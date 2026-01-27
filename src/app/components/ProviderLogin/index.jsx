import Image from "next/image"
import { IconButton } from "../IconButton"
import { signIn } from 'next-auth/react'
import githubImg from './github.png'


console.log("Imagem do GitHub carregada:", githubImg);

export const Github = (props) => {

    function loginAttempt(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        console.log('tentar fazer login via github');
        signIn('github', {
            callbackUrl: '/'
        })
    }

    return (
        <IconButton {...props} onClick={loginAttempt}>
        <Image 
            src={githubImg} 
            alt="Github Logo"
            width={40} 
            height={40}
            />
    </IconButton>)
}
export const Google = (props) => {

    function loginAttempt(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        console.log('tentar fazer login via google');
        signIn('google', {
            callbackUrl: '/'
        })
    }

    return (
        <IconButton {...props} onClick={loginAttempt}>
        <Image 
            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
            alt="Google Logo" 
            padding="20px"
            width={30} 
            height={40}
            />
    </IconButton>)
}
export const Gmail = (props) => {
    function loginAttempt(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        // O provedor continua sendo 'google'
        signIn('google', {
            callbackUrl: '/'
        })
    }

    return (
        <IconButton {...props} onClick={loginAttempt}>
            <img 
                src="/gmail.png" 
                alt="Gmail Logo" 
                style={{ width: '40px', height: '30px' }} 
            />
        </IconButton>
    )
}