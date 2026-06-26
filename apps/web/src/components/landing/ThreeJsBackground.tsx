'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeJsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Create a modern "learning" abstract 3D object: A floating book-like geometric form
    const geometry = new THREE.BoxGeometry(2, 3, 0.5);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x5850ec,
        shininess: 100,
        specular: 0xffffff
    });
    const book = new THREE.Mesh(geometry, material);
    scene.add(book);

    // Add some floating spheres around it
    const sphereGeom = new THREE.SphereGeometry(0.2, 32, 32);
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0x818cf8 });

    for(let i = 0; i < 5; i++) {
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        sphere.position.set(
            Math.random() * 4 - 2,
            Math.random() * 4 - 2,
            Math.random() * 4 - 2
        );
        scene.add(sphere);
    }

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 7;

    let animationFrameId: number;
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        book.rotation.x += 0.005;
        book.rotation.y += 0.01;
        
        scene.children.forEach((child, index) => {
            if(child instanceof THREE.Mesh && index > 0) {
                child.position.y += Math.sin(Date.now() * 0.001 + index) * 0.005;
            }
        });
        
        renderer.render(scene, camera);
    }

    const handleResize = () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full transform hover:scale-105 transition-transform duration-500 pointer-events-none">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
