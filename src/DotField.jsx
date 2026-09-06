import { memo, useEffect, useRef } from 'react';
import './DotField.css';

const TWO_PI = Math.PI * 2;

const DotField = memo(function DotField({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.1,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = 'rgba(168, 85, 247, 0.35)',
  gradientTo = 'rgba(180, 151, 207, 0.25)',
  glowColor = '#120F17',
  className = '',
}) {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);
  const dotsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 });
  const frameRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const engagementRef = useRef(0);
  const glowOpacityRef = useRef(0);
  const propsRef = useRef({});
  const rebuildRef = useRef(null);
  const glowIdRef = useRef(`dot-field-glow-${Math.random().toString(36).slice(2, 9)}`);

  propsRef.current = { dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, sparkle, waveAmplitude, gradientFrom, gradientTo };

  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let resizeTimer;

    const buildDots = (width, height) => {
      const p = propsRef.current;
      const step = p.dotRadius + p.dotSpacing;
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);
      const padX = (width % step) / 2;
      const padY = (height % step) / 2;
      dotsRef.current = Array.from({ length: rows * cols }, (_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = padX + col * step + step / 2;
        const y = padY + row * step + step / 2;
        return { anchorX: x, anchorY: y, x, y, velocityX: 0, velocityY: 0 };
      });
    };

    const resizeNow = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width: rect.width, height: rect.height, left: rect.left + window.scrollX, top: rect.top + window.scrollY };
      buildDots(rect.width, rect.height);
    };
    const resize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resizeNow, 100); };
    const onMove = event => {
      const size = sizeRef.current;
      mouseRef.current.x = event.pageX - size.left;
      mouseRef.current.y = event.pageY - size.top;
    };
    const speedTimer = setInterval(() => {
      const mouse = mouseRef.current;
      const distance = Math.hypot(mouse.prevX - mouse.x, mouse.prevY - mouse.y);
      mouse.speed += (distance - mouse.speed) * 0.5;
      if (mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    }, 20);

    let count = 0;
    const tick = () => {
      count += 1;
      const dots = dotsRef.current;
      const mouse = mouseRef.current;
      const { width, height } = sizeRef.current;
      const p = propsRef.current;
      const time = count * 0.02;
      const targetEngagement = Math.min(mouse.speed / 5, 1);
      engagementRef.current += (targetEngagement - engagementRef.current) * 0.06;
      if (engagementRef.current < 0.001) engagementRef.current = 0;
      const engagement = engagementRef.current;
      glowOpacityRef.current += (engagement - glowOpacityRef.current) * 0.08;

      if (glow) {
        glow.setAttribute('cx', mouse.x);
        glow.setAttribute('cy', mouse.y);
        glow.style.opacity = glowOpacityRef.current;
      }

      context.clearRect(0, 0, width, height);
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, p.gradientFrom);
      gradient.addColorStop(1, p.gradientTo);
      context.fillStyle = gradient;
      context.beginPath();
      const cursorRadiusSquared = p.cursorRadius * p.cursorRadius;
      const radius = p.dotRadius / 2;

      dots.forEach((dot, index) => {
        const dx = mouse.x - dot.anchorX;
        const dy = mouse.y - dot.anchorY;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < cursorRadiusSquared && engagement > 0.01) {
          const distance = Math.max(Math.sqrt(distanceSquared), 1);
          const angle = Math.atan2(dy, dx);
          if (p.bulgeOnly) {
            const amount = Math.pow(1 - distance / p.cursorRadius, 2) * p.bulgeStrength * engagement;
            dot.x += (dot.anchorX - Math.cos(angle) * amount - dot.x) * 0.15;
            dot.y += (dot.anchorY - Math.sin(angle) * amount - dot.y) * 0.15;
          } else {
            const move = (500 / distance) * (mouse.speed * p.cursorForce);
            dot.velocityX -= Math.cos(angle) * move;
            dot.velocityY -= Math.sin(angle) * move;
          }
        } else if (p.bulgeOnly) {
          dot.x += (dot.anchorX - dot.x) * 0.1;
          dot.y += (dot.anchorY - dot.y) * 0.1;
        }

        if (!p.bulgeOnly) {
          dot.velocityX *= 0.9;
          dot.velocityY *= 0.9;
          dot.x += (dot.anchorX + dot.velocityX - dot.x) * 0.1;
          dot.y += (dot.anchorY + dot.velocityY - dot.y) * 0.1;
        }

        const drawX = dot.x + (p.waveAmplitude > 0 ? Math.cos(dot.anchorY * 0.03 + time * 0.7) * p.waveAmplitude * 0.5 : 0);
        const drawY = dot.y + (p.waveAmplitude > 0 ? Math.sin(dot.anchorX * 0.03 + time) * p.waveAmplitude : 0);
        const sparkleScale = p.sparkle && (((index * 2654435761) ^ (count >> 3)) >>> 0) % 100 < 3 ? 1.8 : 1;
        context.moveTo(drawX + radius * sparkleScale, drawY);
        context.arc(drawX, drawY, radius * sparkleScale, 0, TWO_PI);
      });
      context.fill();
      frameRef.current = requestAnimationFrame(tick);
    };

    resizeNow();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    frameRef.current = requestAnimationFrame(tick);
    rebuildRef.current = () => buildDots(sizeRef.current.width, sizeRef.current.height);
    return () => {
      cancelAnimationFrame(frameRef.current);
      clearInterval(speedTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  useEffect(() => { rebuildRef.current?.(); }, [dotRadius, dotSpacing]);

  return (
    <div className={`dot-field-container ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} />
      <svg>
        <defs><radialGradient id={glowIdRef.current}><stop offset="0%" stopColor={glowColor}/><stop offset="100%" stopColor="transparent"/></radialGradient></defs>
        <circle ref={glowRef} cx="-9999" cy="-9999" r={glowRadius} fill={`url(#${glowIdRef.current})`}/>
      </svg>
    </div>
  );
});

export default DotField;
