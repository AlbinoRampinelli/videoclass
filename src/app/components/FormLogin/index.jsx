'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import styles from './form-login.module.css'
import { validarCPF } from '../../../utils/validaCpf';

export default function FormLogin() {
    const [cpf, setCpf] = useState('')
    const [senha, setSenha] = useState('')
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState("")

    // Estados para o Double Check
    const [passo, setPasso] = useState(1)
    const [codigoUsuario, setCodigoUsuario] = useState('')
    const [codigoEnviado, setCodigoEnviado] = useState('')

    // Função de máscara
    const formatarCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const loginAttempt = async (event) => {
        event.preventDefault();
        setErro("");

        if (passo === 1) {
            setLoading(true);
            if (!validarCPF(cpf)) {
                setErro("CPF inválido. Verifique os números.");
                setLoading(false);
                return;
            }

            const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
            setCodigoEnviado(novoCodigo);

            try {
                const response = await fetch('/api/send-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cpf: cpf.replace(/\D/g, ''),
                        code: novoCodigo
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    setErro(`Erro: ${errorData.error || "ao enviar e-mail"}`);
                } else {
                    setPasso(2);
                }
            } catch (err) {
                setErro("Falha na conexão com o serviço de e-mail.");
            }
            setLoading(false);

        } else {
            setLoading(true);
            if (String(codigoUsuario).trim() === String(codigoEnviado).trim()) {
                try {
                    const result = await signIn('credentials', {
                        redirect: false,
                        cpf: cpf.replace(/\D/g, ''),
                        code: codigoUsuario,
                        password: senha,
                    });
                    if (result?.ok) {
                        window.location.replace('/');
                    } else {
                        setErro("CPF ou Senha inválidos");
                        setLoading(false);
                    }
                } catch (err) {
                    setErro("Erro interno ao processar login.");
                    setLoading(false);
                }
            } else {
                setErro("Código incorreto. Tente novamente.");
                setLoading(false);
            }
        }
    };

    return (
        <form className={styles.form} onSubmit={loginAttempt}>
            {passo === 1 ? (
                <>
                    <h3 className="text-white mb-4">Video Class</h3>
                    <div className="mb-3">
                        <label className="form-label text-white">CPF</label>
                        <input
                            type="text"
                            value={cpf}
                            className="form-control text-black"
                            onChange={(e) => setCpf(formatarCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-white">Senha</label>
                        <input
                            type="password"
                            className="form-control text-black"
                            value={senha}
                            required
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>
                </>
            ) : (
                <div className="mb-3 text-center">
                    <h3 style={{ color: '#DAFF01' }}>Verifique seu E-mail</h3>
                    <p className="text-white mb-4">Insira o código de 6 dígitos enviado.</p>
                    <input
                        type="text"
                        className="form-control text-center text-black"
                        style={{ fontSize: '24px', letterSpacing: '8px' }}
                        value={codigoUsuario}
                        onChange={(e) => setCodigoUsuario(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        maxLength="6"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setPasso(1)}
                        className="btn btn-link mt-3"
                        style={{ color: '#DAFF01', textDecoration: 'none' }}
                    >
                        ← Voltar para o CPF
                    </button>
                </div>
            )}

            {erro && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: '14px' }}>{erro}</div>}

            {/* Botão Principal de Login */}
            <button
                type="submit"
                disabled={loading}
                className={`w-full mt-4 py-3 px-4 rounded-md font-bold transition-all
                ${loading
                        ? 'bg-zinc-400 cursor-not-allowed text-white'
                        : 'bg-white text-black hover:bg-zinc-200 shadow-lg'
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        PROCESSANDO...
                    </span>
                ) : (
                    passo === 1 ? 'RECEBER CÓDIGO' : 'CONFIRMAR ENTRADA'
                )}
            </button>

            {/* Divisor e Botão do Google (Apenas no Passo 1) */}
            {passo === 1 && (
                <div className="mt-8 animate-in fade-in duration-500">
                    <div className="relative flex py-3 items-center">
                        <div className="flex-grow border-t border-zinc-700"></div>
                        <span className="flex-shrink mx-4 text-zinc-400 text-xs uppercase tracking-widest font-medium">Ou entre com</span>
                        <div className="flex-grow border-t border-zinc-700"></div>
                    </div>

                    <div className="flex justify-center gap-4 mt-4">
                        {/* <button 
                            type="button" 
                            onClick={() => signIn('google')} 
                            className="flex items-center justify-center p-3 bg-white rounded-full hover:bg-zinc-100 transition-all transform hover:scale-110 shadow-md"
                            title="Entrar com Google"
                        >
                            <img src="/gmail.png" alt="Gmail" width="24" height="24" />
                        </button> */}

                        {/* <button 
                            type="button" 
                            onClick={() => signIn('github')} 
                            className="flex items-center justify-center p-3 bg-white rounded-full hover:bg-zinc-100 transition-all transform hover:scale-110 shadow-md"
                            title="Entrar com GitHub"
                        >
                            <img src="/github.png" alt="GitHub" width="24" height="24" />
                        </button> */}
                    </div>
                </div>
            )}
        </form>
    )
}