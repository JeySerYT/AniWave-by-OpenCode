import { memo, useEffect, useRef } from 'react';
import './SakuraPetals.css';

const COLORS = [
  ['hsla(340,90%,80%,0.95)', 'hsla(345,85%,70%,0.9)', 'hsla(350,80%,55%,0.8)'],
  ['hsla(335,95%,75%,0.95)', 'hsla(340,90%,65%,0.9)', 'hsla(345,85%,50%,0.8)'],
  ['hsla(340,85%,82%,0.95)', 'hsla(345,80%,72%,0.9)', 'hsla(350,75%,58%,0.8)'],
  ['hsla(345,90%,78%,0.95)', 'hsla(350,85%,68%,0.9)', 'hsla(355,80%,52%,0.8)'],
];

const CENTER_COLORS = [
  'hsla(345,90%,65%,0.95)',
  'hsla(350,85%,60%,0.95)',
  'hsla(340,95%,70%,0.95)',
];

const drawPetalShape = (ctx, s, gradient) => {
  const w_ = s * 0.7;
  const h_ = s;

  ctx.beginPath();
  ctx.moveTo(0, h_);
  ctx.bezierCurveTo(w_ * 0.7, h_ * 0.2, w_ * 1.0, -h_ * 0.1, w_ * 0.6, -h_ * 0.4);
  ctx.bezierCurveTo(w_ * 0.45, -h_ * 0.55, w_ * 0.3, -h_ * 0.75, w_ * 0.18, -h_ * 0.88);
  ctx.quadraticCurveTo(w_ * 0.05, -h_ * 0.8, 0, -h_ * 0.7);
  ctx.quadraticCurveTo(-w_ * 0.05, -h_ * 0.8, -w_ * 0.18, -h_ * 0.88);
  ctx.bezierCurveTo(-w_ * 0.3, -h_ * 0.75, -w_ * 0.45, -h_ * 0.55, -w_ * 0.6, -h_ * 0.4);
  ctx.bezierCurveTo(-w_ * 1.0, -h_ * 0.1, -w_ * 0.7, h_ * 0.2, 0, h_);
  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();
};

const SakuraPetals = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let flowers = [];
    let w, h;
    let time = 0;
    let wind = 0;
    let targetWind = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const drawPetalAt = (angle, s, gradient) => {
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(0, -s * 0.85);
      drawPetalShape(ctx, s, gradient);
      ctx.restore();
    };

    const drawFlower = (f) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.globalAlpha = f.opacity;

      const s = f.size;
      if (!f._gradients) {
        const gs = [];
        for (let i = 0; i < 5; i++) {
          const g = ctx.createRadialGradient(0, -s * 0.15, 0, 0, -s * 0.15, s * 1.3);
          g.addColorStop(0, f._colors[0]);
          g.addColorStop(0.5, f._colors[1]);
          g.addColorStop(1, f._colors[2]);
          gs.push(g);
        }
        f._gradients = gs;
      }

      const angleStep = (Math.PI * 2) / 5;
      for (let i = 0; i < 5; i++) {
        drawPetalAt(angleStep * i, s, f._gradients[i]);
      }

      ctx.globalAlpha = f.opacity * 0.9;
      ctx.fillStyle = f._centerColor;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = f.opacity * 0.3;
      ctx.strokeStyle = 'rgba(255,220,230,0.5)';
      ctx.lineWidth = 0.4;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + f.phase;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * s * 0.18, Math.sin(a) * s * 0.18);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * s * 0.18, Math.sin(a) * s * 0.18);
        ctx.lineTo(Math.cos(a) * s * 0.24, Math.sin(a) * s * 0.24);
        ctx.stroke();
      }

      ctx.restore();
    };

    const createFlower = () => {
      const size = 2 + Math.random() * 3;
      const dir = Math.random() > 0.5 ? 1 : -1;
      return {
        x: Math.random() * w,
        y: -(20 + Math.random() * h * 0.5),
        size,
        speedY: 0.7 + Math.random() * 0.7,
        speedX: dir * (0.08 + Math.random() * 0.3),
        swayAmp: 8 + Math.random() * 20,
        swayFreq: 0.005 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        opacity: 0.35 + Math.random() * 0.4,
        updraftTimer: 150 + Math.random() * 400,
        updraftStrength: 0,
        _gradients: undefined,
        _colors: COLORS[Math.floor(Math.random() * COLORS.length)],
        _centerColor: CENTER_COLORS[Math.floor(Math.random() * CENTER_COLORS.length)],
      };
    };

    const init = () => {
      resize();
      const count = Math.min(30, Math.floor((w * h) / 40000));
      flowers = Array.from({ length: count }, () => {
        const f = createFlower();
        f.y = Math.random() * h;
        return f;
      });
    };

    const animate = () => {
      time++;
      ctx.clearRect(0, 0, w, h);

      targetWind = Math.sin(time * 0.0008) * 0.3 + Math.sin(time * 0.0025) * 0.2;
      wind += (targetWind - wind) * 0.02;

      for (const f of flowers) {
        f.updraftTimer--;
        if (f.updraftTimer <= 0) {
          f.updraftStrength = 0.2 + Math.random() * 0.4;
          f.updraftTimer = 150 + Math.random() * 400;
        }
        f.updraftStrength *= 0.98;

        f.y += f.speedY - f.updraftStrength * 0.2;
        f.x += f.speedX + wind * 0.4 + Math.sin(f.y * f.swayFreq + f.phase + time * 0.002) * 0.15;
        f.rotation += f.rotSpeed;

        if (f.y > h + 40 || f.x < -50 || f.x > w + 50) {
          Object.assign(f, createFlower());
        }
      }

      flowers.sort((a, b) => a.size - b.size);
      for (const f of flowers) drawFlower(f);

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
