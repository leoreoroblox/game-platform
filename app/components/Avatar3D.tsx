'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

export default function Avatar3D({ config, isThumbnail = false }: { config?: any, isThumbnail?: boolean }) {
  // 預設顏色（如果玩家還沒設定過）
  const colors = config || { head: '#facc15', body: '#1f2937', arms: '#06b6d4', legs: '#111827' };

  return (
    <div className={`w-full h-full ${isThumbnail ? '' : 'cursor-grab active:cursor-grabbing'}`}>
      {/* 如果是小頭像，相機拉遠一點，確保人偶完整入鏡 */}
      <Canvas camera={{ position: [0, 1.5, isThumbnail ? 5.5 : 4.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <Environment preset="city" />

        <group position={[0, -1, 0]}>
          {/* 頭部 */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color={colors.head} />
          </mesh>
          
          {/* 身體 */}
          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[0.8, 1, 0.4]} />
            <meshStandardMaterial color={colors.body} />
          </mesh>
          
          {/* 左手 */}
          <mesh position={[-0.6, 1, 0]} castShadow>
            <boxGeometry args={[0.3, 0.9, 0.3]} />
            <meshStandardMaterial color={colors.arms} />
          </mesh>
          
          {/* 右手 */}
          <mesh position={[0.6, 1, 0]} castShadow>
            <boxGeometry args={[0.3, 0.9, 0.3]} />
            <meshStandardMaterial color={colors.arms} />
          </mesh>
          
          {/* 左腿 */}
          <mesh position={[-0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 1, 0.3]} />
            <meshStandardMaterial color={colors.legs} />
          </mesh>
          
          {/* 右腿 */}
          <mesh position={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 1, 0.3]} />
            <meshStandardMaterial color={colors.legs} />
          </mesh>
        </group>

        {/* 🚀 根據模式切換控制器 */}
        {isThumbnail ? (
          <OrbitControls autoRotate autoRotateSpeed={2.5} enablePan={false} enableZoom={false} />
        ) : (
          <OrbitControls enablePan={false} enableZoom={false} minDistance={2} maxDistance={6} maxPolarAngle={Math.PI / 2 + 0.1} />
        )}
      </Canvas>
    </div>
  );
}