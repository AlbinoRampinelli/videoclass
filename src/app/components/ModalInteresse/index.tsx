"use client";

import { useState } from "react";
import { X, School, UserCircle, Send } from "lucide-react";

interface ModalInteresseProps {
    course: any;
    onClose: () => void;
    userDb: any;
}

export default function ModalInteresse({ course, onClose, userDb }: ModalInteresseProps) {
    const [userType, setUserType] = useState<string>(userDb?.userType || "PAI");
    const [schoolName, setSchoolName] = useState<string>(userDb?.schoolName || "");
    const [loading, setLoading] = useState(false);

    async function handleRegisterInterest() {
        setLoading(true);

        const userEmail = userDb?.email;

        if (!userEmail) {
            alert("Erro: E-mail não identificado.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/interesse", { // Mudamos para a rota que cria o registro
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cursoId: course.id, // IMPORTANTE: Enviando o ID do curso para a tabela Enrollment
                    userType: userType,
                    schoolName: schoolName,
                }),
            });

            if (res.ok) {
                onClose();
                window.location.reload();
            } else {
                const errorData = await res.json();
                alert("Erro: " + (errorData.details || "Erro ao salvar"));
            }
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 pt-0 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                            <UserCircle size={14} /> Quem é você?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {["PAI", "ALUNO"].map((tipo) => (
                                <button
                                    key={tipo}
                                    type="button"
                                    onClick={() => setUserType(tipo)}
                                    className={`py-3 rounded-xl font-bold text-xs transition-all border ${userType === tipo
                                            ? "bg-[#81FE88] text-black border-[#81FE88]"
                                            : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                                        }`}
                                >
                                    {tipo}
                                </button>
                            ))}
                        </div>
                    </div>

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
                        disabled={loading || !schoolName}
                        className="w-full bg-white hover:bg-[#81FE88] disabled:bg-zinc-700 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all uppercase italic tracking-tighter"
                    >
                        {loading ? "Salvando..." : "Confirmar Interesse"}
                    </button>
                </div>
            </div>
        </div>
    );
}