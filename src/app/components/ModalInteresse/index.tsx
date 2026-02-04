"use client";

import { useState, useEffect } from "react";
import { X, School, UserCircle, Fingerprint } from "lucide-react"; // Importei o ícone de digital

interface ModalInteresseProps {
    course: any;
    onClose: () => void;
    userDb: any;
}

export default function ModalInteresse({ course, onClose, userDb }: ModalInteresseProps) {
    // 1. Estados atuais
    // Removemos o 'userDb?.schoolName' para ele nascer sempre vazio
    const [userType, setUserType] = useState<string>("RESPONSAVEL");
    const [schoolName, setSchoolName] = useState<string>("");
    const [cpf, setCpf] = useState<string>(userDb?.cpf || ""); // Mantivemos o CPF porque é chato digitar toda hora
    const [loading, setLoading] = useState(false);
    // 2. ADICIONE ISSO: Sincroniza os campos com o banco sempre que o modal abrir
    useEffect(() => {
        if (userDb) {
            setUserType(userDb.userType || "RESPONSAVEL");
            setSchoolName(userDb.schoolName || "");
            setCpf(userDb.cpf || "");
        }
    }, [userDb]); // Toda vez que os dados do usuário mudarem, o modal atualiza
    async function handleRegisterInterest() {
        if (!cpf || cpf.length < 11) {
            alert("Por favor, insira um CPF válido.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/interesse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cursoId: course.id,
                    userType: userType,
                    schoolName: schoolName,
                    cpf: cpf.replace(/\D/g, ""), // Limpa o CPF (deixa só números)
                    email: userDb?.email // Enviamos o e-mail para localizar o usuário no banco
                }),
            });

            if (res.ok) {
                alert("Interesse registrado com sucesso!");
                onClose();
                window.location.reload();
            } else {
                const errorData = await res.json();
                alert("Erro: " + (errorData.message || "Erro ao salvar"));
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro na conexão.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                            Tenho Interesse
                        </h2>
                        <p className="text-zinc-500 text-sm font-medium">
                            Curso: <span className="text-[#81FE88]">{course?.title}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 pt-0 space-y-5">
                    {/* QUEM É VOCÊ */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                            <UserCircle size={14} /> Quem é você?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "PAI / MÃE", value: "RESPONSAVEL" },
                                { label: "ALUNO", value: "ALUNO" }
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setUserType(item.value)} // Aqui ele salva o valor correto: "RESPONSAVEL"
                                    className={`py-3 rounded-xl font-bold text-xs transition-all border ${userType === item.value
                                        ? "bg-[#81FE88] text-black border-[#81FE88]"
                                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CPF - O CAMPO QUE FALTAVA */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                            <Fingerprint size={14} /> Seu CPF (Obrigatório)
                        </label>
                        <input
                            type="text"
                            maxLength={14}
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[#81FE88] font-bold"
                        />
                    </div>

                    {/* ESCOLA */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                            <School size={14} /> Sua Escola Atual
                        </label>
                        <input
                            type="text"
                            placeholder="Nome da escola..."
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[#81FE88]"
                        />
                    </div>

                    <button
                        onClick={handleRegisterInterest}
                        disabled={loading || !schoolName || !cpf}
                        className="w-full bg-white hover:bg-[#81FE88] disabled:bg-zinc-700 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all uppercase italic tracking-tighter mt-2"
                    >
                        {loading ? "Salvando..." : "Confirmar Interesse"}
                    </button>
                </div>
            </div>
        </div>
    );
}