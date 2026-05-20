import React from 'react';
import Link from 'next/link';

interface LogoProps {
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    href?: string;
}

const Logo: React.FC<LogoProps> = ({ 
    className = "", 
    size = 'md',
    href = "/"
}) => {
    const sizes = {
        xs: { text: 'text-[12px]', icon: 22 },
        sm: { text: 'text-[18px]', icon: 32 },
        md: { text: 'text-[24px]', icon: 40 },
        lg: { text: 'text-[32px]', icon: 48 },
        xl: { text: 'text-[48px]', icon: 60 }
    };

    return (
        <Link 
            href={href} 
            className={`logo ${sizes[size].text} ${className}`}
            style={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}
        >
            <img
                src="/logo.png"
                alt="TrueServe logo"
                width={sizes[size].icon}
                height={sizes[size].icon}
                style={{
                    borderRadius: '999px',
                    boxShadow: '0 0 20px rgba(249, 115, 22, 0.35)',
                    objectFit: 'cover'
                }}
            />
            <span style={{ fontWeight: 900, letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: '#fff' }}>
                True<em style={{ color: '#68c7cc', fontStyle: 'normal', fontWeight: 900, letterSpacing: '-0.02em' }}>Serve</em>
            </span>
        </Link>
    );
};

export default Logo;
