'use client';

import Image from 'next/image';
import banner from './banner-signin.png';
// 🎯 Mudamos o nome para 'loginStyles' para evitar o erro de "defined multiple times"
import loginStyles from './signin.module.css';
import { TextDivider } from '../../components/TextDivider';
import Providers from '../../components/Providers';
import Link from 'next/link';
import { Login } from '../../components/Icons/Login';
import FormLogin from '../../components/FormLogin';
import { validarCPF } from '@/utils/validaCpf'

export default function SignIn() {
  return (
    <main className={loginStyles.main}>
      {/* Lado Esquerdo */}
      <div className={loginStyles.bannerWrapper}>
        <Image
          src={banner}
          alt='Banner'
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      {/* Lado Direito */}
      <div className={loginStyles.container}>
        <h1>Login</h1>
        <h2>Boas-vindas! Faça seu login.</h2>

        <FormLogin />

        <div className={loginStyles.providers}>
          <TextDivider text="ou entre com outras contas" />
          <Providers />
        </div>

        <footer className={loginStyles.footer}>
          <p>Ainda não tem conta?</p>
          <p>
            <Link href='/signon' style={{ color: '#81FE88', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Crie seu cadastro! <Login color="#81FE88" />
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}