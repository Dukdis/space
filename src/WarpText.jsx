import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl';
import './WarpText.css';

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}`;

const fragment = `#version 300 es
precision highp float;
uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;
in vec2 vUv;
out vec4 fragColor;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);float a=hash(i);float b=hash(i+vec2(1.,0.));float c=hash(i+vec2(0.,1.));float d=hash(i+vec2(1.,1.));return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float value=0.;float amplitude=.5;for(int i=0;i<4;i++){value+=amplitude*noise(p);p*=2.02;amplitude*=.5;}return value;}
vec4 sampleText(vec2 uv){if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)return vec4(0.);return texture(uTextTexture,uv);}
void main(){
  vec2 uv=vUv;float aspect=uResolution.x/max(uResolution.y,1.);float time=uTime*uSpeed;float scale=max(uWarpScale,.001);
  vec2 drift=vec2(time*.055,-time*.045);float n1=fbm(uv*scale*3.1+drift);float n2=fbm((uv+19.17)*scale*3.4-drift.yx);
  vec2 ambient=(vec2(n1,n2)-.5)*uWarpStrength*.045*uMotion;
  vec2 delta=uv-uPointer;vec2 aspectDelta=vec2(delta.x*aspect,delta.y);float dist=length(aspectDelta);float radius=max(uPointerInfluence,.001);
  float t=clamp(dist/radius,0.,1.);float lens=smoothstep(radius,0.,dist)*uPointerActive;float bulge=t*(1.-t)*(1.-t)*6.75*uPointerActive;
  vec2 dir=dist>.0001?vec2(aspectDelta.x/aspect,aspectDelta.y)/dist:vec2(0.);
  float wave=(sin(dist*28.-time*4.2)*.5)*uRipple;vec2 pointerWarp=-dir*bulge*uPointerStrength*.045+dir*wave*bulge*uPointerStrength*.016;
  vec2 displaced=uv+ambient+pointerWarp;vec2 splitDir=ambient+pointerWarp;float splitLen=length(splitDir);splitDir=splitLen>.00001?splitDir/splitLen:vec2(.7071);
  vec2 split=splitDir*uRefraction*.16*(.35+lens*1.65);vec4 base=sampleText(displaced);float r=sampleText(displaced+split).r;float b=sampleText(displaced-split).b;
  float a=max(max(sampleText(displaced+split).a,base.a),sampleText(displaced-split).a);fragColor=vec4(vec3(r,base.g,b)+lens*base.a*.055,a);
}`;

const cssValue = value => typeof value === 'number' ? `${value}px` : value;
const measureLine = (context, line, spacing) => Array.from(line).reduce((width, character) => width + context.measureText(character).width, 0) + Math.max(0, line.length - 1) * spacing;

function buildTextCanvas(container, width, height, dpr, props) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  const context = canvas.getContext('2d');
  if (!context) return canvas;

  const probe = document.createElement('span');
  probe.textContent = props.text;
  Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', pointerEvents: 'none', whiteSpace: 'pre', fontFamily: props.fontFamily, fontSize: cssValue(props.fontSize), fontWeight: String(props.fontWeight), letterSpacing: cssValue(props.letterSpacing), lineHeight: String(props.lineHeight) });
  container.appendChild(probe);
  const computed = getComputedStyle(probe);
  let size = Number.parseFloat(computed.fontSize) || 96;
  const family = computed.fontFamily || 'sans-serif';
  const weight = computed.fontWeight || String(props.fontWeight);
  let spacing = computed.letterSpacing === 'normal' ? 0 : Number.parseFloat(computed.letterSpacing) || 0;
  let lineHeight = Number.parseFloat(computed.lineHeight);
  if (!Number.isFinite(lineHeight)) lineHeight = size * (typeof props.lineHeight === 'number' ? props.lineHeight : 0.9);
  probe.remove();

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.textBaseline = 'middle';
  context.fillStyle = props.color;
  const lines = String(props.text || '').split('\n');
  const applyFont = () => { context.font = `${weight} ${size}px ${family}`; };
  applyFont();
  const widest = Math.max(...lines.map(line => measureLine(context, line, spacing)), 1);
  const fit = Math.min(1, width * 0.96 / widest, height * 0.9 / Math.max(lineHeight * lines.length, 1));
  if (fit < 1) { size *= fit; spacing *= fit; lineHeight *= fit; applyFont(); }
  const startY = height / 2 - lineHeight * (lines.length - 1) / 2;
  lines.forEach((line, lineIndex) => {
    let x = (width - measureLine(context, line, spacing)) / 2;
    Array.from(line).forEach(character => { context.fillText(character, x, startY + lineIndex * lineHeight); x += context.measureText(character).width + spacing; });
  });
  return canvas;
}

export default function WarpText({
  text = 'Bend the moment', color = '#f8f5ff', warpStrength = 0.08, warpScale = 1.7, speed = 0.55,
  pointerInfluence = 0.42, pointerStrength = 0.38, refraction = 0.018, ripple = true,
  fontSize = 'clamp(3rem, 10vw, 9rem)', fontWeight = 800, fontFamily = 'inherit', letterSpacing = '-0.06em', lineHeight = 0.9,
  className = '', style,
}) {
  const containerRef = useRef(null);
  const propsRef = useRef({});
  propsRef.current = { text, color, warpStrength, warpScale, speed, pointerInfluence, pointerStrength, refraction, ripple, fontSize, fontWeight, fontFamily, letterSpacing, lineHeight };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return undefined;
    let renderer;
    try { renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: false, antialias: true, dpr: Math.min(devicePixelRatio || 1, 2) }); }
    catch { container.classList.add('warp-text--fallback'); return undefined; }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);
    const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
    const geometry = new Triangle(gl);
    const p = propsRef.current;
    const program = new Program(gl, { vertex, fragment, transparent: true, depthTest: false, depthWrite: false, uniforms: {
      uTextTexture: { value: texture }, uResolution: { value: new Float32Array([1, 1]) }, uPointer: { value: new Float32Array([0.5, 0.5]) },
      uPointerActive: { value: 0 }, uTime: { value: 0 }, uWarpStrength: { value: p.warpStrength }, uWarpScale: { value: p.warpScale },
      uSpeed: { value: p.speed }, uPointerInfluence: { value: p.pointerInfluence }, uPointerStrength: { value: p.pointerStrength },
      uRefraction: { value: p.refraction }, uRipple: { value: p.ripple ? 1 : 0 }, uMotion: { value: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1 },
    }});
    const mesh = new Mesh(gl, { geometry, program });
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, active: 0, targetActive: 0 };
    let frame = 0;
    let disposed = false;
    const started = performance.now();

    const render = () => renderer.render({ scene: mesh });
    const resize = async () => {
      await document.fonts?.ready;
      if (disposed) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height);
      program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;
      texture.image = buildTextCanvas(container, rect.width, rect.height, Math.min(devicePixelRatio || 1, 2), propsRef.current);
      texture.needsUpdate = true;
      render();
    };
    const onMove = event => {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = (event.clientX - rect.left) / rect.width;
      pointer.targetY = 1 - (event.clientY - rect.top) / rect.height;
      pointer.targetActive = 1;
    };
    const onLeave = () => { pointer.targetActive = 0; };
    const loop = now => {
      if (disposed) return;
      const elapsed = (now - started) * 0.001;
      const targetX = pointer.targetActive ? pointer.targetX : 0.5 + Math.sin(elapsed * 0.33) * 0.12;
      const targetY = pointer.targetActive ? pointer.targetY : 0.5 + Math.cos(elapsed * 0.27) * 0.1;
      pointer.x += (targetX - pointer.x) * 0.08;
      pointer.y += (targetY - pointer.y) * 0.08;
      pointer.active += ((pointer.targetActive ? 1 : 0.18) - pointer.active) * 0.06;
      program.uniforms.uPointer.value[0] = pointer.x;
      program.uniforms.uPointer.value[1] = pointer.y;
      program.uniforms.uPointerActive.value = pointer.active;
      program.uniforms.uTime.value = elapsed;
      render();
      frame = requestAnimationFrame(loop);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    resize();
    frame = requestAnimationFrame(loop);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className={`warp-text ${className}`.trim()} style={style} role="img" aria-label={text}><span>{text}</span></div>;
}
