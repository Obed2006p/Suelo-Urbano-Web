import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface Spore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
  color: string;
}

interface BioluminescentEcosystemProps {
  mousePos: { x: number; y: number };
  intensity?: number;
  className?: string;
}

const BioluminescentEcosystem: React.FC<BioluminescentEcosystemProps> = ({
  mousePos,
  intensity = 1,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  // Spores & Mycelium Nodes references to avoid re-allocating memory every frame
  const nodesRef = useRef<Particle[]>([]);
  const sporesRef = useRef<Spore[]>([]);
  const ripplesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }[]>([]);
  const timeRef = useRef<number>(0);

  // Initialize nodes and spores based on canvas dimensions
  const initParticles = (width: number, height: number) => {
    // 1. Mycelium Network Nodes
    const nodeCount = Math.min(Math.floor((width * height) / 18000), 55);
    const nodes: Particle[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1.2,
        baseRadius: Math.random() * 1.8 + 1.2,
        alpha: Math.random() * 0.5 + 0.35,
        baseAlpha: Math.random() * 0.5 + 0.35,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    nodesRef.current = nodes;

    // 2. Floating Bioluminescent Spores / Fireflies
    const sporeColors = [
      '#34d399', // Emerald
      '#10b981', // Neon green
      '#22d3ee', // Cyan
      '#a7f3d0', // Light mint
      '#fbbf24', // Subtle warm spore gold
    ];

    const sporeCount = Math.min(Math.floor((width * height) / 22000), 40);
    const spores: Spore[] = [];
    for (let i = 0; i < sporeCount; i++) {
      spores.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.45 + 0.2), // Gently rising upwards
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.7 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        color: sporeColors[Math.floor(Math.random() * sporeColors.length)],
      });
    }
    sporesRef.current = spores;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Handle high-DPI displays
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Pause animation when hero is offscreen to save battery & GPU
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0.05 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Main animation loop
    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      if (!isVisibleRef.current) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);
      timeRef.current += 0.012;
      const t = timeRef.current;

      // Mouse influence coordinates in canvas space
      const targetMouseX = mousePos.x;
      const targetMouseY = mousePos.y;

      // -------------------------------------------------------------
      // LAYER 3: TOPOGRAFÍA DIGITAL DE "SUELO URBANO" (Wireframe Waves)
      // -------------------------------------------------------------
      const terrainLines = 7;
      const baseY = height * 0.72;

      ctx.save();
      for (let l = 0; l < terrainLines; l++) {
        const lineOffset = l * 26;
        const lineAlpha = (0.05 + (l / terrainLines) * 0.14) * intensity;
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
        ctx.lineWidth = 1 + (l * 0.2);

        // Sine wave terrain with harmonic frequencies
        const stepX = 24;
        let isFirst = true;

        for (let x = 0; x <= width + stepX; x += stepX) {
          // Subtle mouse elevation effect
          const distToMouse = Math.abs(x - targetMouseX);
          const mouseElevation = distToMouse < 260 
            ? Math.cos((distToMouse / 260) * (Math.PI / 2)) * 18 * (1 - (distToMouse / 260))
            : 0;

          const wave1 = Math.sin(x * 0.0055 + t * 0.7 + l * 0.8) * 16;
          const wave2 = Math.cos(x * 0.012 - t * 0.4 + l * 0.5) * 8;
          const y = baseY + lineOffset + wave1 + wave2 - mouseElevation;

          if (isFirst) {
            ctx.moveTo(x, y);
            isFirst = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Subtle vertical contour lines crossing down to the shelf
        if (l % 2 === 0) {
          for (let x = 60; x < width; x += 110) {
            const wave1 = Math.sin(x * 0.0055 + t * 0.7 + l * 0.8) * 16;
            const wave2 = Math.cos(x * 0.012 - t * 0.4 + l * 0.5) * 8;
            const y1 = baseY + lineOffset + wave1 + wave2;
            const y2 = y1 + 22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(5, 150, 105, ${lineAlpha * 0.4})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // -------------------------------------------------------------
      // LAYER 2: RED NEURONAL / MICELIO SUBTERRÁNEO INTERACTIVO
      // -------------------------------------------------------------
      const nodes = nodesRef.current;
      const maxConnectDist = 120;
      const mouseInfluenceDist = 160;

      // Update and draw connections (Hyphae filaments)
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];

        // Move node
        nodeA.x += nodeA.vx;
        nodeA.y += nodeA.vy;

        // Wrap around boundaries
        if (nodeA.x < 0) nodeA.x = width;
        if (nodeA.x > width) nodeA.x = 0;
        if (nodeA.y < 0) nodeA.y = height;
        if (nodeA.y > height) nodeA.y = 0;

        // Mouse magnetic attraction / repulsion
        const dxMouse = targetMouseX - nodeA.x;
        const dyMouse = targetMouseY - nodeA.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouseInfluenceDist && distMouse > 5) {
          // Gentle soft pull towards cursor
          const force = (1 - distMouse / mouseInfluenceDist) * 0.06;
          nodeA.x += (dxMouse / distMouse) * force;
          nodeA.y += (dyMouse / distMouse) * force;
        }

        // Draw mycelium filaments between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const connectAlpha = (1 - dist / maxConnectDist) * 0.22 * intensity;
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(52, 211, 153, ${connectAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.moveTo(nodeA.x, nodeA.y);
            
            // Draw slightly curved organic filament
            const midX = (nodeA.x + nodeB.x) / 2 + Math.sin(t * 2 + i) * 2.5;
            const midY = (nodeA.y + nodeB.y) / 2 + Math.cos(t * 2 + j) * 2.5;
            ctx.quadraticCurveTo(midX, midY, nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }

        // Connect directly to mouse cursor if near
        if (distMouse < mouseInfluenceDist) {
          const mouseLineAlpha = (1 - distMouse / mouseInfluenceDist) * 0.32 * intensity;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(110, 231, 183, ${mouseLineAlpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(targetMouseX, targetMouseY);
          ctx.stroke();
        }
      }

      // Draw Mycelium Nodes (Spore nuclei)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.pulsePhase += node.pulseSpeed;
        const currentPulse = Math.sin(node.pulsePhase) * 0.35 + 0.65;
        const r = node.baseRadius * (0.85 + currentPulse * 0.3);
        const a = node.baseAlpha * currentPulse * intensity;

        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3);
        gradient.addColorStop(0, `rgba(52, 211, 153, ${a})`);
        gradient.addColorStop(0.5, `rgba(16, 185, 129, ${a * 0.4})`);
        gradient.addColorStop(1, 'rgba(5, 150, 105, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core bright dot
        ctx.fillStyle = `rgba(209, 250, 229, ${a * 1.2})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // LAYER 4: ESPORAS Y LUCIÉRNAGAS FLOTANTES (Ascending Spores)
      // -------------------------------------------------------------
      const spores = sporesRef.current;
      for (let i = 0; i < spores.length; i++) {
        const spore = spores[i];

        // Move upwards and sway
        spore.x += spore.vx + Math.sin(t * 1.5 + spore.pulse) * 0.35;
        spore.y += spore.vy;

        // Wrap around bottom if floated above top
        if (spore.y < -10) {
          spore.y = height + 10;
          spore.x = Math.random() * width;
        }
        if (spore.x < -10) spore.x = width + 10;
        if (spore.x > width + 10) spore.x = -10;

        // Gentle breathing pulse
        spore.pulse += spore.pulseSpeed;
        const pulseFactor = Math.sin(spore.pulse) * 0.4 + 0.6;
        const sporeAlpha = spore.alpha * pulseFactor * intensity;

        // Draw spore with soft aura
        const sporeGlow = ctx.createRadialGradient(spore.x, spore.y, 0, spore.x, spore.y, spore.size * 3.5);
        sporeGlow.addColorStop(0, spore.color);
        sporeGlow.addColorStop(0.4, spore.color);
        sporeGlow.addColorStop(1, 'transparent');

        ctx.globalAlpha = sporeAlpha;
        ctx.fillStyle = sporeGlow;
        ctx.beginPath();
        ctx.arc(spore.x, spore.y, spore.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright white/mint core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(spore.x, spore.y, spore.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // -------------------------------------------------------------
      // CLICK RIPPLE EFFECTS (Nutrient Pulse Waves)
      // -------------------------------------------------------------
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 3.5;
        rip.alpha -= 0.015;

        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = `rgba(52, 211, 153, ${rip.alpha * intensity})`;
        ctx.lineWidth = 1.5;
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [intensity, mousePos]);

  // Handle click on canvas to emit a biological nutrient pulse wave
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    ripplesRef.current.push({
      x: clickX,
      y: clickY,
      radius: 5,
      maxRadius: 180,
      alpha: 0.65,
    });
  };

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasClick}
      className={`absolute inset-0 pointer-events-auto overflow-hidden select-none z-[2] ${className}`}
      aria-hidden="true"
    >
      {/* ============================================================== */}
      {/* LAYER 1: ORBES DE BIOLUMINISCENCIA (CSS Ambient Glow)          */}
      {/* ============================================================== */}
      <style>{`
        @keyframes float-orb-1 {
          0%, 100% {
            transform: translate3d(0px, 0px, 0) scale(1);
          }
          33% {
            transform: translate3d(80px, -60px, 0) scale(1.15);
          }
          66% {
            transform: translate3d(-50px, 40px, 0) scale(0.9);
          }
        }

        @keyframes float-orb-2 {
          0%, 100% {
            transform: translate3d(0px, 0px, 0) scale(1.05);
          }
          33% {
            transform: translate3d(-90px, 70px, 0) scale(0.9);
          }
          66% {
            transform: translate3d(60px, -50px, 0) scale(1.2);
          }
        }

        @keyframes float-orb-3 {
          0%, 100% {
            transform: translate3d(0px, 0px, 0) scale(0.95);
          }
          50% {
            transform: translate3d(70px, 50px, 0) scale(1.1);
          }
        }

        @keyframes float-orb-4 {
          0%, 100% {
            transform: translate3d(0px, 0px, 0) scale(1);
          }
          50% {
            transform: translate3d(-60px, -70px, 0) scale(1.15);
          }
        }

        .ambient-orb {
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
          mix-blend-mode: screen;
          will-change: transform;
        }

        .orb-neon-green {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(5, 150, 105, 0.25) 45%, transparent 75%);
          filter: blur(110px);
          animation: float-orb-1 22s ease-in-out infinite;
        }

        .orb-cyan-depth {
          background: radial-gradient(circle, rgba(6, 182, 212, 0.38) 0%, rgba(14, 116, 144, 0.2) 50%, transparent 75%);
          filter: blur(125px);
          animation: float-orb-2 28s ease-in-out infinite;
        }

        .orb-emerald-core {
          background: radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, rgba(4, 120, 87, 0.22) 50%, transparent 75%);
          filter: blur(120px);
          animation: float-orb-3 25s ease-in-out infinite;
        }

        .orb-golden-spore {
          background: radial-gradient(circle, rgba(234, 179, 8, 0.22) 0%, rgba(161, 98, 7, 0.12) 50%, transparent 75%);
          filter: blur(100px);
          animation: float-orb-4 30s ease-in-out infinite;
        }
      `}</style>

      {/* Bioluminescent floating orbs */}
      <div
        className="ambient-orb orb-neon-green w-[380px] h-[380px] sm:w-[500px] sm:h-[500px] -top-24 -left-20 opacity-70"
        style={{
          transform: `translate3d(${(mousePos.x - 500) * 0.025}px, ${(mousePos.y - 400) * 0.025}px, 0)`,
        }}
      />

      <div
        className="ambient-orb orb-cyan-depth w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] top-1/4 -right-28 opacity-65"
        style={{
          transform: `translate3d(${(mousePos.x - 700) * -0.03}px, ${(mousePos.y - 400) * -0.03}px, 0)`,
        }}
      />

      <div
        className="ambient-orb orb-emerald-core w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] bottom-10 left-1/3 opacity-75"
        style={{
          transform: `translate3d(${(mousePos.x - 600) * 0.02}px, ${(mousePos.y - 500) * 0.02}px, 0)`,
        }}
      />

      <div
        className="ambient-orb orb-golden-spore w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] top-1/2 left-10 opacity-50"
        style={{
          transform: `translate3d(${(mousePos.x - 400) * -0.02}px, ${(mousePos.y - 300) * 0.02}px, 0)`,
        }}
      />

      {/* Canvas for Interactive Mycelium, Topography, and Ascending Spores */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default BioluminescentEcosystem;
