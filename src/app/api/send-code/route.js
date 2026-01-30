// src/app/api/auth/send-code/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from "../../../../prisma/db.js";
import { buscarUsuarioPorCPF } from '../../../utils/usuarios.js';

export async function POST(request) {
    try {
        // 1. Pega apenas o CPF (o código agora nasce aqui no servidor)
        const { cpf } = await request.json();

        // 2. Busca o usuário
        const usuario = await buscarUsuarioPorCPF(cpf);

        if (!usuario) {
            console.error("Usuário não encontrado para o CPF:", cpf);
            return NextResponse.json({ error: "CPF não cadastrado." }, { status: 404 });
        }

        // 3. GERA O CÓDIGO AQUI (Segurança máxima)
        const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. SALVA NO BANCO (Usando sua instância db/prisma)
        await db.user.update({
            where: { id: usuario.id },
            data: { codigoVerificacao: novoCodigo } 
        });

        // 5. CONFIGURAÇÃO DO NODEMAILER
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "arampinelli10@gmail.com", 
                pass: 'cavmfbnxiwdftdmh', 
            },
        });

        // 6. ENVIA O E-MAIL (Usando o novoCodigo que geramos acima)
        await transporter.sendMail({
            from: `"Videoclass" <arampinelli10@gmail.com>`,
            to: usuario.email,
            subject: "Código de Segurança - Videoclass",
            html: `<h3>Olá, ${usuario.name || 'Usuário'}!</h3>
                   <p>Seu código de acesso é: <b style="font-size: 20px; color: #81FE88;">${novoCodigo}</b></p>
                   <p>Este código expira em breve.</p>`,
        });

        console.log(`✅ Código ${novoCodigo} enviado para ${usuario.email}`);
        return NextResponse.json({ message: "E-mail enviado!" }, { status: 200 });

    } catch (error) {
        console.error("Erro detalhado no servidor:", error);
        return NextResponse.json({ error: "Falha ao processar e-mail." }, { status: 500 });
    }
}