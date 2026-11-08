'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Box } from '@react-three/drei';
import * as THREE from 'three';

// 一個會旋轉的方塊，確保場景活著
function SpinningCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta;
    }
  });

  return (
    <Box ref={meshRef} args={[1, 1, 1]} position={[0, 1.5, 0]}>
      <meshStandardMaterial color="#06b6d4" />
    </Box>
  );
}

export default function World3D({ onExit }: { onExit: () => void }) {
  return (
    <div className="w-full h-full relative bg-[#0a0f1c] overflow-hidden">
      
      <button 
        onClick={onExit}
        className="absolute top-6 right-6 z-50 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition btn-danger"
      >
        Exit 3D World
      </button>

      <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
        {/* 確保有背景色，不會是一片黑 */}
        <color attach="background" args={['#0a0f1c']} />
        
        {/* 最強光照組合 */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} />

        {/* 測試用的旋轉方塊與科技網格地板 */}
        <SpinningCube />
        <Grid 
          args={[100, 100]} 
          cellSize={1} 
          cellThickness={1} 
          cellColor="#1f2937" 
          sectionSize={5} 
          sectionThickness={1.5} 
          sectionColor="#06b6d4" 
          fadeDistance={30} 
          fadeStrength={1} 
          followCamera={false} 
          infiniteGrid={true} 
          position={[0, 0, 0]} 
        />

        {/* 讓你用滑鼠自由旋轉 */}
        <OrbitControls />
      </Canvas>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 text-white font-mono bg-black/60 px-6 py-3 rounded-full pointer-events-none border border-gray-700">
        Drag to rotate
      </div>
    </div>
  );
}