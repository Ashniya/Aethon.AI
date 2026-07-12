import { useEffect, useRef } from 'react';

interface HeroDotCanvasProps {
  isDarkMode: boolean;
  focusXPercent?: number;
  focusYPercent?: number;
}

export default function HeroDotCanvas({ isDarkMode, focusXPercent = 0.80, focusYPercent = 0.40 }: HeroDotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (ts: number) => {
      timeRef.current = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const spacing = 14;
      const focusX = canvas.width * focusXPercent;
      const focusY = canvas.height * focusYPercent;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.70;

      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          const dx = x - focusX;
          const dy = y - focusY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let alpha = 1 - distance / maxRadius;
          if (alpha <= 0) continue;

          // Sharper falloff
          alpha = Math.pow(alpha, 2.0);

          // Subtle pulse animation
          const pulse = Math.sin(ts * 0.001 + (x + y) * 0.01) * 0.08;
          alpha = Math.min(1, Math.max(0, alpha + pulse));

          if (isDarkMode) {
            // Blue-cyan dots for dark mode
            ctx.fillStyle = `rgba(59,130,246,${alpha})`;
          } else {
            // Dark charcoal dots fading to white for light mode
            ctx.fillStyle = `rgba(30,30,30,${alpha * 0.85})`;
          }

          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
