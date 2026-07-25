import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
}

export default function Logo({
  className = '',
  size = 'lg',
  variant = 'auto',
  textColor = 'text-[#111111]',
}: LogoProps) {
  const heightMap = {
    sm: 'h-14 md:h-16 max-h-[64px]',
    md: 'h-18 md:h-20 max-h-[82px]',
    lg: 'h-22 md:h-24 max-h-[96px]',
    xl: 'h-32 md:h-36 max-h-[140px]',
  };

  // If in dark container where text is white, invert logo colors seamlessly
  const isDark = textColor.includes('text-white') || textColor.includes('text-gray-300') || variant === 'dark';

  return (
    <div className={`flex items-center justify-center shrink-0 ${className}`} id="comfalo-logo">
      <img
        src="/logo.png"
        alt="COMFALO CLOTHING"
        className={`${heightMap[size]} w-auto object-contain transition-transform hover:scale-105 duration-200 select-none ${
          isDark ? 'brightness-0 invert' : ''
        }`}
      />
    </div>
  );
}
