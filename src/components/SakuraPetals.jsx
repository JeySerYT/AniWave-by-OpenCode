import { memo, useEffect, useRef } from 'react';
import './SakuraPetals.css';

const SakuraPetals = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let petals = [];
    let w, h;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const drawPetal = (p) => {
      const s = p.size;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      const base = ctx.createRadialGradient(0, -s * 0.2, 0, 0, -s * 0.2, s * 1.6);
      base.addColorStop(0, p.color[0]);
      base.addColorStop(0.6, p.color[1]);
      base.addColorStop(1, p.color[2]);

      // Draw cherry blossom petal with notch at tip
      ctx.beginPath();
      const w_ = s * 0.85;  // half-width
      const h_ = s;         // height

      // Start at bottom center
      ctx.moveTo(0, h_);

      // Right side of petal
      ctx.bezierCurveTo(w_ * 1.1, h_ * 0.4, w_ * 0.9, -h_ * 0.3, w_ * 0.15, -h_ * 0.9);

      // Notch at the tip (left side of notch)
      ctx.bezierCurveTo(w_ * 0.05, -h_ * 1.0, 0, -h_ * 0.95, 0, -h_ * 0.8);

      // Notch at the tip (right side of notch going down)
      ctx.bezierCurveTo(0, -h_ * 0.95, -w_ * 0.05, -h_ * 1.0, -w_ * 0.15, -h_ * 0.9);

      // Left side of petal
      ctx.bezierCurveTo(-w_ * 0.9, -h_ * 0.3, -w_ * 1.1, h_ * 0.4, 0, h_);
      ctx.closePath();

      ctx.fillStyle = base;
      ctx.fill();

      // Subtle veins
      ctx.globalAlpha = p.opacity * 0.15;
      ctx.strokeStyle = '#fff';

      for (let i = 0; i < 3; i++) {
        const offset = (i - 1) * w_ * 0.3;
        ctx.beginPath();
        ctx.moveTo(offset, h_ * 0.2);
        ctx.quadraticCurveTo(offset + (i === 1 ? 0 : (i < 1 ? -1 : 1)) * w_ * 0.15, -h_ * 0.1, offset * 0.3, -h_ * 0.6);
        ctx.lineWidth = 0.4 + Math.random() * 0.2;
        ctx.stroke();
      }

      ctx.restore();
    };

    const createPetal = (reset) => ({
      x: reset ? Math.random() * w : w * 0.5,
      y: reset ? -20 - Math.random() * 60 : h + 20,
      size: 3 + Math.random() * 5,
      speedY: 0.6 + Math.random() * 0.8,
      speedX: 0.2 + Math.random() * 0.4,
      swayAmp: 15 + Math.random() * 25,
      swayFreq: 0.008 + Math.random() * 0.015,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 0.01 + Math.random() * 0.03,
      opacity: 0.25 + Math.random() * 0.35,
      color: [
        `hsla(${340 + Math.random() * 20}, ${60 + Math.random() * 30}%, ${80 + Math.random() * 10}%, 0.9)`,
        `hsla(${345 + Math.random() * 15}, ${50 + Math.random() * 30}%, ${72 + Math.random() * 12}%, 0.85)`,
        `hsla(${350 + Math.random() * 10}, ${40 + Math.random() * 20}%, ${65 + Math.random() * 10}%, 0.7)`,
      ],
    });

    const init = () => {
      resize();
      petals = Array.from({ length: 30 }, (_, i) => {
        const p = createPetal(true);
        p.y = Math.random() * h;
        return p;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of petals) {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * p.swayFreq + p.phase) * 0.3;
        p.rotation += p.rotSpeed;

        if (p.y > h + 40) {
          Object.assign(p, createPetal(true));
        }
      }

      petals.sort((a, b) => a.size - b.size);
      for (const p of petals) drawPetal(p);

      animId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="sakura-canvas"
      aria-hidden="true"
    />
  );
});

export default SakuraPetals;
