import { memo, useEffect, useRef } from 'react';
import './SakuraPetals.css';

const SnowFlakes = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let flakes = [];
    let w, h;
    let time = 0;
    let wind = 0;
    let targetWind = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const drawFlake = (f) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.globalAlpha = f.opacity;

      const r = f.size;
      ctx.beginPath();

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        ctx.moveTo(Math.cos(angle) * r * 0.6, Math.sin(angle) * r * 0.6);
        ctx.lineTo(
          Math.cos(angle + 0.3) * r * 0.35,
          Math.sin(angle + 0.3) * r * 0.35
        );
        ctx.moveTo(Math.cos(angle) * r * 0.6, Math.sin(angle) * r * 0.6);
        ctx.lineTo(
          Math.cos(angle - 0.3) * r * 0.35,
          Math.sin(angle - 0.3) * r * 0.35
        );
      }

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5 + f.size * 0.08;
      ctx.stroke();

      ctx.restore();
    };

    const createFlake = () => {
      const dir = Math.random() > 0.5 ? 1 : -1;
      return {
        x: Math.random() * w,
        y: -(20 + Math.random() * h * 0.3),
        size: 1.5 + Math.random() * 4,
        speedY: 0.4 + Math.random() * 0.8,
        speedX: dir * (0.2 + Math.random() * 0.4),
        swayAmp: 8 + Math.random() * 20,
        swayFreq: 0.008 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        opacity: 0.3 + Math.random() * 0.5,
      };
    };

    const init = () => {
      resize();
      const count = Math.min(60, Math.floor((w * h) / 20000));
      flakes = Array.from({ length: count }, () => {
        const f = createFlake();
        f.y = Math.random() * h;
        return f;
      });
    };

    const animate = () => {
      time++;
      ctx.clearRect(0, 0, w, h);

      targetWind = Math.sin(time * 0.0008) * 0.4 + Math.sin(time * 0.002) * 0.15;
      wind += (targetWind - wind) * 0.02;

      for (const f of flakes) {
        f.y += f.speedY;
        f.x += f.speedX + wind * 0.6 + Math.sin(f.y * f.swayFreq + f.phase + time * 0.002) * 0.15;
        f.rotation += f.rotSpeed;

        if (f.y > h + 30 || f.x < -40 || f.x > w + 40) {
          Object.assign(f, createFlake());
        }
      }

      for (const f of flakes) drawFlake(f);
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

export default SnowFlakes;
