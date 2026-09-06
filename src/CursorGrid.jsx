import { useEffect, useRef } from 'react';
import './CursorGrid.css';

const curves = {
  linear: t => t,
  smooth: t => t * t * (3 - 2 * t),
  sharp: t => t * t * t,
};

const hexToRgb = hex => {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map(char => char + char).join('') : value;
  const number = Number.parseInt(full.slice(0, 6), 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
};

export default function CursorGrid({
  cellSize = 70,
  color = '#f4a261',
  radius = 140,
  falloff = 'smooth',
  holdTime = 300,
  fadeDuration = 900,
  lineWidth = 1,
  maxOpacity = 0.75,
  fillOpacity = 0.02,
  gridOpacity = 0,
  cellRadius = 8,
  clickPulse = true,
  pulseSpeed = 600,
  className = '',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const propsRef = useRef({});
  const wakeRef = useRef(null);

  propsRef.current = { cellSize, color, radius, falloff, holdTime, fadeDuration, lineWidth, maxOpacity, fillOpacity, gridOpacity, cellRadius, clickPulse, pulseSpeed };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const eventTarget = container?.parentElement;
    if (!container || !canvas || !eventTarget) return undefined;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cols = 0;
    let rows = 0;
    let offX = 0;
    let offY = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let lastFrame = 0;
    const pulses = [];

    const rebuild = () => {
      const p = propsRef.current;
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / p.cellSize) + 1;
      rows = Math.ceil(height / p.cellSize) + 1;
      offX = (width - cols * p.cellSize) / 2;
      offY = (height - rows * p.cellSize) / 2;
      alphas = new Float32Array(cols * rows);
      touched = new Float64Array(cols * rows);
    };

    const center = index => {
      const p = propsRef.current;
      return [
        offX + (index % cols) * p.cellSize + p.cellSize / 2,
        offY + Math.floor(index / cols) * p.cellSize + p.cellSize / 2,
      ];
    };

    const energize = (x, y, boost = 1) => {
      const p = propsRef.current;
      const influence = Math.max(p.radius, 1);
      const ease = curves[p.falloff] ?? curves.smooth;
      const now = performance.now();
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const index = row * cols + col;
          const [cx, cy] = center(index);
          const distance = Math.hypot(cx - x, cy - y);
          if (distance > influence) continue;
          const level = ease(1 - distance / influence) * p.maxOpacity * boost;
          alphas[index] = Math.max(alphas[index], level);
          touched[index] = now;
        }
      }
    };

    const draw = now => {
      const p = propsRef.current;
      const delta = Math.min(now - lastFrame, 50);
      lastFrame = now;
      ctx.clearRect(0, 0, width, height);
      const [r, g, b] = hexToRgb(p.color);

      if (p.gridOpacity > 0) {
        ctx.strokeStyle = `rgba(${r},${g},${b},${p.gridOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let col = 0; col <= cols; col += 1) {
          const x = Math.round(offX + col * p.cellSize) + 0.5;
          ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let row = 0; row <= rows; row += 1) {
          const y = Math.round(offY + row * p.cellSize) + 0.5;
          ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      for (let pulseIndex = pulses.length - 1; pulseIndex >= 0; pulseIndex -= 1) {
        const pulse = pulses[pulseIndex];
        const ring = ((now - pulse.started) / 1000) * p.pulseSpeed;
        if (ring > Math.hypot(width, height)) { pulses.splice(pulseIndex, 1); continue; }
        const band = p.cellSize * 0.8;
        for (let index = 0; index < alphas.length; index += 1) {
          const [cx, cy] = center(index);
          if (Math.abs(Math.hypot(cx - pulse.x, cy - pulse.y) - ring) < band / 2) {
            alphas[index] = Math.max(alphas[index], p.maxOpacity);
            touched[index] = now;
          }
        }
      }

      let visible = pulses.length > 0;
      const half = p.cellSize / 2;
      for (let index = 0; index < alphas.length; index += 1) {
        let alpha = alphas[index];
        if (alpha <= 0) continue;
        if (now - touched[index] > p.holdTime) {
          alpha = Math.max(0, alpha - delta / Math.max(p.fadeDuration, 16));
          alphas[index] = alpha;
        }
        if (alpha <= 0) continue;
        visible = true;
        const [cx, cy] = center(index);
        const x = cx - half + 0.5;
        const y = cy - half + 0.5;
        const size = p.cellSize - 1;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.cellSize);
        gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        p.cellRadius > 0 ? ctx.roundRect(x, y, size, size, p.cellRadius) : ctx.rect(x, y, size, size);
        if (p.fillOpacity > 0) { ctx.fillStyle = `rgba(${r},${g},${b},${alpha * p.fillOpacity})`; ctx.fill(); }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.lineWidth;
        ctx.stroke();
      }

      if (visible) raf = requestAnimationFrame(draw);
      else running = false;
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    const localPoint = event => {
      const rect = container.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    };
    const onMove = event => { const [x, y] = localPoint(event); energize(x, y, 0.5); wake(); };
    const onDown = event => {
      if (!propsRef.current.clickPulse) return;
      const [x, y] = localPoint(event);
      pulses.push({ x, y, started: performance.now() });
      energize(x, y, 1);
      wake();
    };

    const observer = new ResizeObserver(() => { rebuild(); wake(); });
    observer.observe(container);
    rebuild();
    eventTarget.addEventListener('pointermove', onMove);
    eventTarget.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      eventTarget.removeEventListener('pointermove', onMove);
      eventTarget.removeEventListener('pointerdown', onDown);
    };
  }, [cellSize]);

  useEffect(() => { wakeRef.current?.(); }, [gridOpacity, color, lineWidth, maxOpacity, fillOpacity, cellRadius]);

  return <div ref={containerRef} className={`cursor-grid ${className}`.trim()} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
