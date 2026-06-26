'use client';

import React, { useEffect, useRef } from 'react';

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas?.clientWidth || window.innerWidth;
      const h = canvas?.clientHeight || window.innerHeight;
      if (canvas && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', syncSize);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    // Create a flowing, organic motion using sine waves
    float noise = sin(uv.x * 3.0 + u_time * 0.5) * cos(uv.y * 2.0 - u_time * 0.3);
    noise += sin(uv.y * 5.0 + u_time * 0.2) * 0.5;
    
    // Define the primary color (indigo) and background tones
    vec3 color1 = vec3(0.345, 0.314, 0.925); // #5850ec (Primary)
    vec3 color2 = vec3(0.965, 0.965, 1.0);   // Light surface
    vec3 color3 = vec3(0.05, 0.05, 0.15);    // Deep dark tone
    
    // Mix based on coordinates and noise
    vec3 finalColor = mix(color1, color2, uv.y + noise * 0.15);
    
    // Add subtle shimmer
    finalColor += vec3(0.1) * sin(u_time * 0.8 + uv.x * 10.0);
    
    gl_FragColor = vec4(finalColor * 0.9, 1.0);
}`;

    function cs(type: number, src: string) {
      const s = (gl as WebGLRenderingContext).createShader(type);
      if (!s) return null;
      (gl as WebGLRenderingContext).shaderSource(s, src);
      (gl as WebGLRenderingContext).compileShader(s);
      return s;
    }

    const prog = (gl as WebGLRenderingContext).createProgram();
    if (!prog) return;
    
    const vertexShader = cs((gl as WebGLRenderingContext).VERTEX_SHADER, vs);
    const fragmentShader = cs((gl as WebGLRenderingContext).FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    (gl as WebGLRenderingContext).attachShader(prog, vertexShader);
    (gl as WebGLRenderingContext).attachShader(prog, fragmentShader);
    (gl as WebGLRenderingContext).linkProgram(prog);
    (gl as WebGLRenderingContext).useProgram(prog);

    const buf = (gl as WebGLRenderingContext).createBuffer();
    (gl as WebGLRenderingContext).bindBuffer((gl as WebGLRenderingContext).ARRAY_BUFFER, buf);
    (gl as WebGLRenderingContext).bufferData((gl as WebGLRenderingContext).ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), (gl as WebGLRenderingContext).STATIC_DRAW);

    const pos = (gl as WebGLRenderingContext).getAttribLocation(prog, 'a_position');
    (gl as WebGLRenderingContext).enableVertexAttribArray(pos);
    (gl as WebGLRenderingContext).vertexAttribPointer(pos, 2, (gl as WebGLRenderingContext).FLOAT, false, 0, 0);

    const uTime = (gl as WebGLRenderingContext).getUniformLocation(prog, 'u_time');
    const uRes = (gl as WebGLRenderingContext).getUniformLocation(prog, 'u_resolution');
    const uMouse = (gl as WebGLRenderingContext).getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    function render(t: number) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      (gl as WebGLRenderingContext).viewport(0, 0, canvas!.width, canvas!.height);
      if (uTime) (gl as WebGLRenderingContext).uniform1f(uTime, t * 0.001);
      if (uRes) (gl as WebGLRenderingContext).uniform2f(uRes, canvas!.width, canvas!.height);
      if (uMouse) (gl as WebGLRenderingContext).uniform2f(uMouse, mouse.x, mouse.y);
      (gl as WebGLRenderingContext).drawArrays((gl as WebGLRenderingContext).TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', syncSize);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full opacity-40 dark:opacity-60 pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
