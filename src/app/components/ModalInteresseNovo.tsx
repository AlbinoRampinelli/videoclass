"use client";

import React from 'react';
import InfoPythonModal from "./InfoPythonModal";

export default function ModalInteresse({ course, onClose, onAction, userDb }: any) {

    // 1. REGRA DE OURO: Se for Python, abre o modal especial e encerra aqui
    const isPython = course?.id === "1" || course?.title?.toLowerCase().includes("python");

    if (isPython) {
        return (
            <InfoPythonModal
                isOpen={true}
                onClose={onClose}
                onAction={onAction}
            />
        );
    }

    // 2. DESIGN ORIGINAL (A sua Aside para todos os outros cursos)
    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
            {/* Overlay para fechar ao clicar fora */}
            <div className="absolute inset-0" onClick={onClose} />

            <aside className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                {/* Cabeçalho do Modal */}
                <div className="p-6 border-b">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <span className="text-2xl text-gray-500">&times;</span>
                    </button>

                    <h2 className="text-2xl font-bold text-gray-800 pr-8">
                        {course?.title || "Detalhes do Curso"}
                    </h2>
                </div>

                {/* Conteúdo da sua Aside */}
                <div className="p-6 space-y-6">
                    <div className="rounded-xl overflow-hidden bg-gray-100 h-48 flex items-center justify-center">
                        {/* Espaço para imagem ou vídeo do curso */}
                        <p className="text-gray-400">Preview do Curso</p>
                    </div>

                    <div className="prose prose-slate">
                        <h3 className="text-lg font-semibold">O que você vai aprender:</h3>
                        <p className="text-gray-600">
                            {course?.description || "Informações detalhadas sobre o conteúdo programático e benefícios do curso."}
                        </p>
                    </div>

                    {/* Rodapé com Botão de Ação */}
                    <div className="pt-6 border-t mt-auto">
                        <button
                            onClick={() => {
                                console.log("DEBUG: Clique no botão acionado");

                                if (onAction) {
                                    console.log("DEBUG: Sinal onAction encontrado, disparando...");
                                    onAction();
                                } else {
                                    console.error("DEBUG: Erro! O sinal onAction não chegou neste componente.");
                                    alert("Erro técnico: O sinal de cadastro não chegou. Verifique o repasse no ModalInteresse.");
                                }
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                        >
                            TESTE DE SINAL -[SEU NOME]
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
} // <--- FIM DA FUNÇÃO