// src/app/api/auth/send-code/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { buscarUsuarioPorCPF } from '../../../utils/usuarios.js'; // Use o @ para facilitar

export async function POST(request) {
    try {
        const { cpf, code } = await request.json();

        // 1. Busca o usuário pelo CPF que veio do front-end
        const usuario = await buscarUsuarioPorCPF(cpf);

        await prisma.user.update({
            where: { id: usuario.id },
            data: { codigoVerificacao: String(code) } // Salva o código gerado no banco
        });

        if (!usuario) {
            console.error("Usuário não encontrado para o CPF:", cpf);
            return NextResponse.json({ error: "CPF não cadastrado." }, { status: 404 });
        }

        // 2. O e-mail agora vem do seu arquivo de usuários
        const emailDestino = usuario.email;
        console.log("Enviando código para:", emailDestino);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true para porta 465, false para 587
            auth: {
                user: process.env.EMAIL_USER, // Seu e-mail no .env
                pass: process.env.EMAIL_PASS, // Sua Senha de App no .env
            },
        });

        await transporter.sendMail({
            from: `"Videoclass" <${process.env.EMAIL_USER}>`,
            to: usuario.email,
            subject: "Código de Segurança - Videoclass",
            html: `<h3>Olá, ${usuario.nome}!</h3>
                   <p>Seu código de acesso é: <b>${code}</b></p>`,
        });

        return NextResponse.json({ message: "E-mail enviado!" }, { status: 200 });

    } catch (error) {
        console.error("Erro detalhado no servidor:", error);
        return NextResponse.json({ error: "Falha ao processar e-mail." }, { status: 500 });
    }
}