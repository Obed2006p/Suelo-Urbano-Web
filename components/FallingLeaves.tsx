
import React, { useState, useEffect, useCallback } from 'react';
import { LeafIcon } from './icons/Icons';

interface LeafState {
    id: number;
    style: React.CSSProperties;
}

interface FallingLeavesProps {
    position?: 'fixed' | 'absolute';
}

// Eliminamos la dependencia de una imagen externa PNG y usamos componentes SVG para mejor control de color
const FallingLeaves: React.FC<FallingLeavesProps> = ({ position = 'fixed' }) => {
    const [leaves, setLeaves] = useState<LeafState[]>([]);

    const removeLeaf = useCallback((id: number) => {
        setLeaves(prev => prev.filter(leaf => leaf.id !== id));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const id = Date.now() + Math.random();
            const animationName = `fall-sway-${Math.floor(Math.random() * 3) + 1}`;
            const size = Math.random() * 20 + 15; // Tamaño entre 15px y 35px
            
            const newLeaf: LeafState = {
                id,
                style: {
                    left: `${Math.random() * 100}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationName: animationName,
                    animationDuration: `${Math.random() * 5 + 5}s`, // Velocidad normal
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: Math.random() * 0.6 + 0.4,
                    transform: `rotate(${Math.random() * 360}deg)`,
                }
            };
            setLeaves(prev => [...prev, newLeaf]);
        }, 400); // Frecuencia de generación

        return () => clearInterval(interval);
    }, []);
    
    const containerClasses = `${position} top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden`;

    return (
        <div className={containerClasses} aria-hidden="true">
            {leaves.map(leaf => (
                <div
                    key={leaf.id}
                    className="absolute top-[-5vh]"
                    style={{
                        ...leaf.style,
                        animationTimingFunction: 'ease-in-out',
                        animationFillMode: 'forwards',
                    }}
                    onAnimationEnd={() => removeLeaf(leaf.id)}
                >
                    <LeafIcon className="w-full h-full text-green-600/60 dark:text-green-400/40" />
                </div>
            ))}
        </div>
    );
};

export default FallingLeaves;
