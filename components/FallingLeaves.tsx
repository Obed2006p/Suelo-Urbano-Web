
import React, { useState, useEffect, useCallback } from 'react';

interface LeafState {
    id: number;
    style: React.CSSProperties;
}

interface FallingLeavesProps {
    position?: 'fixed' | 'absolute';
}

const LEAF_IMAGE_URL = "https://res.cloudinary.com/dsmzpsool/image/upload/v1756226411/2556-removebg-preview_my8qp4.png";

const FallingLeaves: React.FC<FallingLeavesProps> = ({ position = 'fixed' }) => {
    const [leaves, setLeaves] = useState<LeafState[]>([]);

    const removeLeaf = useCallback((id: number) => {
        setLeaves(prev => prev.filter(leaf => leaf.id !== id));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const id = Date.now() + Math.random();
            const animationName = `fall-sway-${Math.floor(Math.random() * 3) + 1}`;
            const size = Math.random() * 25 + 20; // Size between 20px and 45px
            
            const newLeaf: LeafState = {
                id,
                style: {
                    left: `${Math.random() * 100}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationName: animationName,
                    animationDuration: `${Math.random() * 10 + 15}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: Math.random() * 0.5 + 0.5,
                }
            };
            setLeaves(prev => [...prev, newLeaf]);
        }, 500); // Create a new leaf every 500ms

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
                        animationTimingFunction: 'linear',
                        animationFillMode: 'forwards',
                    }}
                    onAnimationEnd={() => removeLeaf(leaf.id)}
                >
                    <img src={LEAF_IMAGE_URL} alt="" className="w-full h-full object-contain" />
                </div>
            ))}
        </div>
    );
};

export default FallingLeaves;
