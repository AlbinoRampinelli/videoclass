'use client'
import Image from 'next/image'
import banner from './banner-signon.jpeg'
import styles from './signon.module.css'
import { Label } from '../../components/Label'
import { Input } from '../../components/Input'
import Botao from '../../components/Botao'
import { ArrowForward } from '../../components/Icons/ArrowForward'
import { TextDivider } from '../../components/TextDivider'
import Providers from '../../components/Providers'
import Link from 'next/link'
import { Login } from '../../components/Icons/Login'
import { createUser } from '../../actions'
import { useActionState, useState } from 'react'

export default function SignOn() {
    const [state, formAction] = useActionState(createUser, { message: null });
    const [cpf, setCpf] = useState('');

    // Função de máscara simples (Puro JavaScript)
    const formatarCPF = (value) => {
        if (!value) return "";
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleCPFChange = (e) => {
        const valorFormatado = formatarCPF(e.target.value);
        setCpf(valorFormatado);
    };

    return (
        <main className={styles.main}>
            <div className={styles.wrapper}>
                
                {/* LADO DA IMAGEM COM TEXTOS */}
                <div className={styles.bannerContainer}>
                    <Image
                        src={banner}
                        alt='Banner'
                        priority
                        className={styles.bannerImage}
                    />
                    
                    {/* Estes textos vão aparecer se você usar o CSS que te passei antes */}
                    <div className={styles.logoOverlay}>
                        <div className={styles.logoIcon}>\\</div>
                        <div>
                            <span className={styles.logoText}>VIDEOCLASS</span>
                            <p className={styles.logoSub}>Seu futuro digital começa aqui</p>
                        </div>
                    </div>

                    <div className={styles.bottomText}>
                        <h2 className={styles.highlightText}>Desbloqueie Seu Potencial</h2>
                        <p className={styles.subHighlightText}>Aprenda. Conecte-se. Cresça.</p>
                    </div>
                </div>

                {/* LADO DO FORMULÁRIO */}
                <div className={styles.container}>
                    <h1>Cadastro</h1>
                    <h2>Olá! Preencha seus dados.</h2>

                    {state?.message && (
                        <p className={styles.errorMessage}>{state.message}</p>
                    )}

                    <form className={styles.form} action={formAction}>
                        <div className={styles.inputGroup}>
                            <Label>Nome</Label>
                            <Input name="name" id="name" placeholder="Nome completo" required />
                        </div>
                        
                        <div className={styles.inputGroup}>
                            <Label>Email</Label>
                            <Input name="email" id="email" type="email" placeholder="Digite seu E-mail" required />
                        </div>

                        <div className={styles.inputGroup}>
                            <Label>CPF</Label>
                            <Input
                                name="cpf"
                                id="cpf"
                                value={cpf}
                                onChange={handleCPFChange}
                                placeholder="000.000.000-00"
                                required 
                            />
                        </div>

                        {/* Labels Corrigidos */}
                        <div className={styles.inputGroup}>
                            <Label>Senha</Label>
                            <Input
                                type="password"
                                name="password"
                                required
                                placeholder="Crie uma senha"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Label>Confirmar Senha</Label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                required
                                placeholder="Repita a senha"
                            />
                        </div>

                        <div className={styles.checkboxContainer}>
                            <input type="checkbox" id="termos" required className={styles.checkboxInput} />
                            <label htmlFor="termos" className={styles.checkboxLabel}>
                                Li e aceito os termos de uso
                            </label>
                        </div>

                        <div className={styles.action}>
                            <Botao type="submit" variant="primary">
                                Cadastrar <ArrowForward />
                            </Botao>
                        </div>
                    </form>

                    <div className={styles.providers}>
                        <TextDivider text="ou entre com outras contas" />
                        <Providers />
                    </div>

                    <footer className={styles.footer}>
                        <p>
                            Já tem conta? <Link href='/signin'>Faça seu login! <Login color="#81FE88" /></Link>
                        </p>
                    </footer>
                </div>
            </div>
        </main>
    )
}