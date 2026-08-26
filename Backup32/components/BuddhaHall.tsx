'use client';

import { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  Float, 
  Stars, 
  OrbitControls, 
  Environment,
  ContactShadows,
  Sparkles,
  useGLTF,
  Center,
  Html
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

// --- Sub-components ---

function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-orb"></div>
      <p>Sanctifying the Space...</p>
      <style jsx>{`
        .loader-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          z-index: 50;
          color: #d4a017;
          gap: 20px;
          font-family: var(--font-serif);
        }
        .loader-orb {
          width: 50px;
          height: 50px;
          background: radial-gradient(circle, #fff 0%, #d4a017 100%);
          border-radius: 50%;
          box-shadow: 0 0 30px #d4a017;
          animation: pulse 2s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/**
 * 3D Buddha Model Loader 
 */
function BuddhaModel() {
  const { scene } = useGLTF('/models/buddha.glb');
  
  useMemo(() => {
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.metalness = 0.4;
          mat.roughness = 0.65;
          mat.emissive = new THREE.Color('#331a00');
          mat.emissiveIntensity = 0.4;
          mat.side = THREE.DoubleSide;
        }
      }
    });
  }, [scene]);

  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
      <Center top position={[0, -1.5, 0]}>
        <primitive object={scene} scale={2.0} />
      </Center>
    </Float>
  );
}

function EnvironmentEffects() {
  return (
    <>
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={15} size={1.5} speed={0.3} color="#d4a017" opacity={0.4} />
      <Sparkles count={60} scale={6} size={3.5} speed={0.15} color="#ffe699" opacity={0.7} />
    </>
  );
}

function CameraReset({ is3DMode }: { is3DMode: boolean }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    // Reset camera when toggling modes
    camera.position.set(0, 1.2, 8.0);
    camera.lookAt(0, 1.2, 0);
    if (controls) {
      (controls as any).target.set(0, 1.2, 0);
      (controls as any).update();
    }
  }, [is3DMode, camera, controls]);

  return null;
}

/**
 * Main Buddha Hall Component
 */
export default function BuddhaHall({ is3DMode = false, isEcoMode = false }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Artificial delay to ensure textures are ready
    const timer = setTimeout(() => setIsLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="buddha-hall-canvas">
      {!isLoaded && <Loader />}
      
      {/* 2D Hero Layer (HTML for maximum crispness and easy transitions) */}
      <div className={`hero-image-container ${is3DMode ? 'fade-out' : 'fade-in'}`}>
        <img 
          src="/images/buddha-hero.png" 
          alt="Divine Buddha" 
          className="hero-image"
        />
      </div>

      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, stencil: false, depth: true }}
        camera={{ position: [0, 1.2, 8.0], fov: 40 }}
      >
        <CameraReset is3DMode={is3DMode} />
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 8, 22]} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#ffffff" />
        <pointLight position={[0, 1, 5]} intensity={2.5} color="#d4a017" decay={2} />
        
        <spotLight 
          position={[0, 4, 6]} 
          target-position={[0, 2.5, 0]}
          angle={0.2} 
          penumbra={0.8} 
          intensity={5} 
          color="#ffffff"
          castShadow
        />
        
        <pointLight position={[0, -2, 2]} intensity={1.5} color="#8d6e1a" />

        <OrbitControls
          makeDefault
          target={[0, 1.2, 0]}
          enabled={is3DMode}
          enablePan={is3DMode}
          enableZoom={is3DMode}
          enableRotate={is3DMode}
          minDistance={4}
          maxDistance={15}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 + 0.1}
        />

        <Suspense fallback={null}>
          <group visible={is3DMode}>
            <BuddhaModel />
          </group>
        </Suspense>

        <EnvironmentEffects />
        
        {!isEcoMode && (
          <EffectComposer enableNormalPass={false}>
            <Bloom 
              luminanceThreshold={0.95} 
              mipmapBlur 
              intensity={0.8} 
              radius={0.3} 
            />
            <Noise opacity={0.03} />
            <Vignette eskil={false} offset={0.05} darkness={1.1} />
            <ChromaticAberration offset={new THREE.Vector2(0.0005, 0.0005)} />
          </EffectComposer>
        )}

        {!isEcoMode && (
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.8} 
            scale={20} 
            blur={3} 
            far={5} 
            color="#000" 
          />
        )}

        <Environment preset="night" />
      </Canvas>

      <style jsx>{`
        .buddha-hall-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1;
          background: #000;
        }

        .hero-image-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
          pointer-events: none;
          transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .hero-image {
          height: 58vh;
          max-height: calc(100vh - 160px);
          object-fit: contain;
          filter: drop-shadow(0 0 30px rgba(212, 160, 23, 0.2));
        }

        .fade-in {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        .fade-out {
          opacity: 0;
          transform: translate(-50%, -50%) scale(1.1);
          filter: blur(10px);
        }

        @media (max-width: 768px) {
          .hero-image-container {
            top: 50%;
          }
          .hero-image {
            height: 50vh;
          }
        }
      `}</style>
    </div>
  );
}

useGLTF.preload('/models/buddha.glb');
