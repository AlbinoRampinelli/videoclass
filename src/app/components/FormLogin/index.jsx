'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import styles from './form-login.module.css'
import { validarCPF } from '../../../utils/validaCpf';

export default function FormLogin() {
    const [cpf, setCpf] = useState('')
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState("")

    // Estados para o Double Check (OTP)
    const [passo, setPasso] = useState(1)
    const [codigoUsuario, setCodigoUsuario] = useState('')

    // Removido o ": string" para funcionar em .jsx
    const formatarCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    // Removido o tipo do evento para funcionar em .jsx
    const loginAttempt = async (event) => {
        event.preventDefault();
        setErro("");
        setLoading(true);

        const cleanCpf = cpf.replace(/\D/g, '');

        if (passo === 1) {
            if (!validarCPF(cpf)) {
                setErro("CPF inválido. Verifique os números.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/send-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cpf: cleanCpf }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    setErro(errorData.error || "CPF não encontrado.");
                } else {
                    setPasso(2);
                }
            } catch (err) {
                setErro("Falha na conexão com o servidor.");
            }
        } else {
            try {
                const result = await signIn('credentials', {
                    redirect: false,
                    cpf: cleanCpf,
                    code: codigoUsuario,
                });

                if (result?.ok) {
                    window.location.replace('/');
                } else {
                    setErro("Código incorreto ou expirado.");
                }
            } catch (err) {
                setErro("Erro ao processar login.");
            }
        }
        setLoading(false);
    };

    // ... restante do return (igual ao anterior)
    return (
        <form className={styles.form} onSubmit={loginAttempt}>
            {/* O JSX do return que já tínhamos */}
            {passo === 1 ? (
                <div className="mb-3">
                    <label className="text-white text-xs">CPF</label>
                    <input
                        type="text"
                        value={cpf}
                        className="form-control text-black p-3"
                        onChange={(e) => setCpf(formatarCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        required
                    />
                </div>
            ) : (
                <div className="mb-3 text-center">
                    <h3 style={{ color: '#81FE88' }}>Verifique seu E-mail</h3>
                    <input
                        type="text"
                        className="form-control text-center text-black font-bold"
                        style={{ fontSize: '24px', letterSpacing: '8px' }}
                        value={codigoUsuario}
                        onChange={(e) => setCodigoUsuario(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        maxLength={6}
                        required
                    />
                    <button type="button" onClick={() => setPasso(1)} className="btn btn-link mt-3 text-xs" style={{ color: '#81FE88', textDecoration: 'none' }}>
                        ← Voltar
                    </button>
                </div>
            )}

            {erro && <div className="text-red-500 text-xs text-center mt-2">{erro}</div>}

            <button type="submit" disabled={loading} className="w-full mt-6 py-4 rounded-xl font-bold bg-[#81FE88] text-black">
                {loading ? "PROCESSANDO..." : (passo === 1 ? 'RECEBER CÓDIGO' : 'CONFIRMAR ENTRADA')}
            </button>
        </form>
    );
}