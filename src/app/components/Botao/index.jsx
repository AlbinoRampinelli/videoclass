import React from "react";
import Link from "next/link"; // Importamos o Link do Next.js

const Botao = ({
  type,
  children,
  variant = "default",
  className,
  handleClick,
  href, // Adicionamos a prop href aqui
  ...rest
}) => {
  const buttonStyleMap = {
    default: "btn rounded-0 btn-outline-light",
    primary: "btn rounded-0 btn-dark botao-lilas",
    secondary: "btn rounded-0 btn-outline-purple",
    tertiary: "btn rounded-0 btn-tertiary btn-dark",
    addItem: "botao__circular bg-transparent border-light text-light rounded-circle",
    removeItem: "botao__circular border bg-transparent border-light text-light rounded-circle",
    deleteItem: "botao__excluir text-light fw-semibol material-symbols-outlined",
    close: "btn-close btn-close-white",
  };

  const classes = `${buttonStyleMap[variant]} ${className || ""}`;

  // Se tiver um 'href', renderizamos como um Link do Next.js com cara de botão
  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

 return (
    <button 
      className={classes} 
      type={type} 
      // 🎯 Se não houver handleClick, não passamos nada para o onClick
      // Isso permite que o formulário use o comportamento padrão do type="submit"
      {...(handleClick ? { onClick: handleClick } : {})} 
      {...rest}
    >
      {children}
    </button>
  );
};

export default Botao;