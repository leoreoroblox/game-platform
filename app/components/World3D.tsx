'use client';
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, PointerLockControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

// 🚀 玩家控制器 (第一人稱移動)
function Player() {
  const { camera } = useThree();
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    // 取得相機朝向的前與右向量
    frontVector.set(
      0,
      0,
      Number(keys.current['KeyS'] || keys.current['ArrowDown']) - Number(keys.current['KeyW'] || keys.current['ArrowUp'])
    );
    sideVector.set(
      Number(keys.current['KeyD'] || keys.current['ArrowRight']) - Number(keys.current['KeyA'] || keys.current['ArrowLeft']),
      0,
      0
    );
    
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(8).applyEuler(camera.rotation);

    // 更新相機位置 (WASD 移動)
    camera.position.x += direction.x * delta;
    camera.position.z += direction.z * delta;
    
    // 鎖定玩家高度 (像第一人稱射擊遊戲)
    camera.position.y = 1.6; 

    // 限制玩家移動範圍，不要走出世界
    camera.position.x = Math.max(-45, Math.min(45, camera.position.x));
    camera.position.z = Math.max(-45, Math.min(45, camera.position.z));
  });

  return null;
}

// 🚀 場景裡的方塊與裝飾
function WorldObjects() {
  return (
    <>
      {/* 地面 */}
      <Box args={[100, 0.1, 100]} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial color="#1f2937" />
      </Box>

      {/* 一些科技感裝飾方塊 */}
      <Box args={[2, 4, 2]} position={[5, 2, -5]} castShadow>
        <meshStandardMaterial color="#06b6d4" />
      </Box>
      <Box args={[3, 2, 3]} position={[-6, 1, -8]} castShadow>
        <meshStandardMaterial color="#8b5cf6" />
      </Box>
      <Box args={[1, 6, 1]} position={[0, 3, -15]} castShadow>
        <meshStandardMaterial color="#facc15" />
      </Box>

      {/* 中央歡迎文字 */}
      <Text position={[0, 3, -10]} fontSize={1.5} color="#ffffff" anchorX="center" anchorY="middle">
        LEO GAME WORLD
      </Text>
      <Text position={[0, 2, -10]} fontSize={0.5} color="#06b6d4" anchorX="center" anchorY="middle">
        Coming Soon...
      </Text>
    </>
  );
}

export default function World3D({ onExit }: { onExit: () => void }) {
  const [isLocked, setIsLocked] = useState(false);

  return (
    <div className="w-full h-screen bg-black relative">
      {/* 🚀 退出按鈕 */}
      <button 
        onClick={onExit}
        className="absolute top-6 right-6 z-50 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
      >
        Exit 3D World
      </button>

      <Canvas shadows camera={{ position: [0, 1.6, 5], fov: 75 }}>
        <fog attach="fog" args={['#050810', 10, 50]} />
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        <Player />
        <WorldObjects />
        
        {/* 🚀 滑鼠鎖定控制，點擊畫面後就能用滑鼠轉視角 */}
        <PointerLockControls onLock={() => setIsLocked(true)} onUnlock={() => setIsLocked(false)} />
      </Canvas>

      {/* 提示文字 */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 text-white font-mono bg-black/60 px-6 py-3 rounded-full pointer-events-none border border-gray-700">
        {isLocked ? 'WASD to move | ESC to unlock mouse' : 'Click to play'}
      </div>
    </div>
  );
}