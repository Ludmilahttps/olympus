import React from 'react';

export const Logo = ({ variant = 'full', className, ...props }) => {
  // Se for "symbol", retorna só o M
  if (variant === 'symbol') {
    return (
      <svg 
        viewBox="0 0 100 100" /* <--- AJUSTE O VIEWBOX CONFORME SEU ARQUIVO ORIGINAL DO 'M' */
        fill="currentColor" /* Isso permite mudar a cor via Tailwind */
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        {/* --- COLE AQUI O <path> DO SEU LOGO 'M' --- */}
        {/* Exemplo (apague isso e cole o seu): */}
        <path d="M50 0 L100 100 L0 100 Z" /> 
      </svg>
    );
  }

  // Se não, retorna o logo completo (Olympus)
  return (
    <svg 
      viewBox="0 0 300 100" /* <--- AJUSTE O VIEWBOX CONFORME SEU ARQUIVO ORIGINAL COMPLETO */
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* --- COLE AQUI OS <path> DO SEU LOGO COMPLETO --- */}
      {/* Exemplo (apague isso e cole o seu): */}
      <path d="M0 0 H300 V100 H0 Z" />
    </svg>
  );
};