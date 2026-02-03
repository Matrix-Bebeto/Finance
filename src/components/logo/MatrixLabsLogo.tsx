import React from 'react';

interface MatrixLabsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

const sizes = {
  sm: { width: 120, height: 40 },
  md: { width: 160, height: 50 },
  lg: { width: 200, height: 60 },
  xl: { width: 280, height: 80 },
};

export const MatrixLabsLogo: React.FC<MatrixLabsLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'dark'
}) => {
  const { width, height } = sizes[size];
  const textColor = variant === 'light' ? '#ffffff' : '#111827';
  const accentColor = '#0ea5e9';

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Icon - Hexagon with M inside */}
      <g transform="translate(0, 5)">
        {/* Hexagon shape */}
        <path 
          d="M25 0L46.65 12.5V37.5L25 50L3.35 37.5V12.5L25 0Z" 
          fill="url(#hexGradient)"
          stroke={accentColor}
          strokeWidth="2"
        />
        {/* M letter inside */}
        <path 
          d="M12 18V38H17V26L25 34L33 26V38H38V18H32L25 27L18 18H12Z" 
          fill="white"
        />
        {/* Connection dots */}
        <circle cx="25" cy="-3" r="2" fill={accentColor} />
        <circle cx="49" cy="11" r="2" fill={accentColor} />
        <circle cx="49" cy="39" r="2" fill={accentColor} />
        <circle cx="25" cy="53" r="2" fill={accentColor} />
        <circle cx="1" cy="39" r="2" fill={accentColor} />
        <circle cx="1" cy="11" r="2" fill={accentColor} />
        
        {/* Connection lines */}
        <line x1="25" y1="-1" x2="47" y2="12" stroke={accentColor} strokeWidth="0.5" opacity="0.5" />
        <line x1="47" y1="12" x2="47" y2="38" stroke={accentColor} strokeWidth="0.5" opacity="0.5" />
        <line x1="47" y1="38" x2="25" y2="51" stroke={accentColor} strokeWidth="0.5" opacity="0.5" />
        <line x1="25" y1="51" x2="3" y2="38" stroke={accentColor} strokeWidth="0.5" opacity="0.5" />
        <line x1="3" y1="38" x2="3" y2="12" stroke={accentColor} strokeWidth="0.5" opacity="0.5" />
        <line x1="3" y1="12" x2="25" y2="-1" stroke={accentColor} strokeWidth="0.5" opacity="0.5" />
      </g>
      
      {/* Text */}
      <text 
        x="60" 
        y="28" 
        fill={textColor} 
        fontFamily="Inter, system-ui, sans-serif" 
        fontSize="18" 
        fontWeight="700"
        letterSpacing="-0.02em"
      >
        Matrix
      </text>
      <text 
        x="60" 
        y="48" 
        fill={accentColor} 
        fontFamily="Inter, system-ui, sans-serif" 
        fontSize="18" 
        fontWeight="700"
        letterSpacing="-0.02em"
      >
        LABS
      </text>
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default MatrixLabsLogo;
