// src/components/IconButton/index.jsx
export const IconButton = ({ children, onClick, ...props }) => {
    return (
        <button 
            {...props} 
            type="button" 
            onClick={onClick} // 🎯 Aqui deve ser 'onClick', que vem lá do componente Github
            style={{ 
                background: 'transparent', 
                border: 'none', 
                padding: 0,
                cursor: 'pointer',
                ...props.style // Permite que estilos extras venham de fora
            }}
        >
            {children}
        </button>
    )
}