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
          
          // [PRESET 1: 24K Pure Satin Gold - 찬란한 개금 순금불]
          // Detach dark museum scan albedo map to reveal pure, flawless 24K temple gold
          mat.map = null;
          mat.color.set('#e5b138');
          mat.metalness = 0.86;
          mat.roughness = 0.27;
          mat.emissive = new THREE.Color('#382202');
          mat.emissiveIntensity = 0.22;
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;

          /*
          // [PRESET 2: Antique Matte Gold - 박물관 원본 목조 앤틱 (이전 백업값)]
          mat.color.set('#e2bc43');
          mat.metalness = 0.75;
          mat.roughness = 0.32;
          mat.emissive = new THREE.Color('#443008');
          mat.emissiveIntensity = 0.35;
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
          */
        }
      }
    });
  }, [scene]);

  return (
    <Float speed={1} rotationIntensity={0.02} floatIntensity={0.08}>
      <Center position={[0, 1.18, 0]}>
        <primitive 
          object={scene} 
          scale={3.46} 
          rotation={[-Math.PI / 2, 0, Math.PI / 2]} 
        />
      </Center>
    </Float>
  );
}

function EnvironmentEffects() {
  return (
    <>
      <Stars radius={100} depth={50} count={7500} factor={4} saturation={0} fade speed={1} />
      {/* Ambient sanctuary golden light dust */}
      <Sparkles count={300} scale={14} size={1.8} speed={0.32} color="#ffd700" opacity={0.5} />
      {/* Intimate divine aura floating around Buddha's body & crown */}
      <Sparkles count={120} scale={7} size={3.2} speed={0.18} color="#fff2b2" opacity={0.8} />
    </>
  );
}

function CameraReset({ is3DMode }: { is3DMode: boolean }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile) {
      // Mobile camera framing: lower camera & target so Buddha sits higher on mobile screen,
      // perfectly matching the mobile 2D Buddha anchor (top: 120px, 52vh).
      camera.position.set(0, 0.90, 7.5);
      camera.lookAt(0, 0.68, 0);
      if (controls) {
        (controls as any).target.set(0, 0.68, 0);
        (controls as any).update();
      }
    } else {
      // Desktop camera framing aligned with desktop 2D Buddha bounds
      camera.position.set(0, 1.40, 7.5);
      camera.lookAt(0, 1.18, 0);
      if (controls) {
        (controls as any).target.set(0, 1.18, 0);
        (controls as any).update();
      }
    }
  }, [is3DMode, camera, controls]);

  return null;
}

/**
 * Main Buddha Hall Component
 */
export default function BuddhaHall({ is3DMode = false, isEcoMode = false }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [is3DVisible, setIs3DVisible] = useState(is3DMode);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Artificial delay to ensure textures are ready
    const timer = setTimeout(() => setIsLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setIsTransitioning(true);
    // At t=350ms, the goldenBurst flash reaches peak 100% opacity.
    // Reveal or hide the 3D model exactly at the peak of the flash!
    const revealTimer = setTimeout(() => {
      setIs3DVisible(is3DMode);
    }, 350);
    const flashTimer = setTimeout(() => setIsTransitioning(false), 1300);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(flashTimer);
    };
  }, [is3DMode]);

  return (
    <div className="buddha-hall-canvas">
      {!isLoaded && <Loader />}
      
      {/* Golden Aura Transcendence Flash (2D <-> 3D 전환 시 신성한 황금빛 오라) */}
      {isTransitioning && <div className="golden-transcendence-flare" />}

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
        camera={{ position: [0, 1.40, 7.5], fov: 42 }}
      >
        <CameraReset is3DMode={is3DMode} />
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 8, 22]} />
        
        {/* Sacred Temple Lighting: Balanced Golden Key, Fill, Rim & Ambient */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[1, 4.7, 5]} intensity={2.6} color="#fff8e1" />
        <pointLight position={[0, 2.3, 3.8]} intensity={2.5} color="#ffd700" decay={1.8} />
        <pointLight position={[-3.5, 3.2, 2]} intensity={1.6} color="#f6e27a" />
        <pointLight position={[3.5, 3.2, 2]} intensity={1.6} color="#f6e27a" />
        <pointLight position={[0, 4.2, -4]} intensity={2.8} color="#d4a017" />
        <pointLight position={[0, -0.1, 3]} intensity={1.4} color="#aa7c11" />

        <OrbitControls
          makeDefault
          target={typeof window !== 'undefined' && window.innerWidth <= 768 ? [0, 0.68, 0] : [0, 1.18, 0]}
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
          <group visible={is3DVisible}>
            <Environment preset="sunset" environmentIntensity={0.5} />
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
            position={[0, -0.27, 0]} 
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

        .golden-transcendence-flare {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 15;
          background: radial-gradient(
            circle at 50% 48%, 
            rgba(255, 235, 140, 0.85) 0%, 
            rgba(245, 196, 66, 0.5) 25%, 
            rgba(212, 160, 23, 0.2) 50%, 
            transparent 75%
          );
          mix-blend-mode: screen;
          animation: goldenBurst 1.3s cubic-bezier(0.2, 0.8, 0.25, 1) forwards;
        }

        @keyframes goldenBurst {
          0% {
            opacity: 0;
            transform: scale(0.7);
            filter: blur(2px) brightness(1.2);
          }
          30% {
            opacity: 1;
            transform: scale(1.03);
            filter: blur(8px) brightness(1.7);
          }
          70% {
            opacity: 0.7;
            transform: scale(1.12);
            filter: blur(14px) brightness(1.3);
          }
          100% {
            opacity: 0;
            transform: scale(1.25);
            filter: blur(20px) brightness(1);
          }
        }

        .hero-image-container {
          position: absolute;
          top: calc(var(--nav-height, 80px) + 96px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          pointer-events: none;
          transition: opacity 1.3s cubic-bezier(0.4, 0, 0.2, 1), transform 1.3s cubic-bezier(0.4, 0, 0.2, 1), filter 1.3s ease;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .hero-image {
          height: 60vh;
          max-height: calc(100vh - 170px);
          object-fit: contain;
          filter: drop-shadow(0 0 30px rgba(212, 160, 23, 0.25));
        }

        .fade-in {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }

        .fade-out {
          opacity: 0;
          transform: translateX(-50%) scale(1.03);
          filter: drop-shadow(0 0 60px rgba(255, 215, 0, 0.9)) blur(6px);
        }

        @media (max-width: 768px) {
          .hero-image-container {
            top: calc(var(--nav-height, 80px) + 40px);
          }
          .hero-image {
            height: 52vh;
            max-height: calc(100vh - 180px);
          }
        }
      `}</style>
    </div>
  );
}

useGLTF.preload('/models/buddha.glb');

