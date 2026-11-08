'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// 動態載入 3D 世界 (避免伺服器端預渲染報錯)
const World3D = dynamic(() => import('./World3D'), { ssr: false });

export default function WorldClient() {
  const router = useRouter();

  return (
    <World3D onExit={() => router.push('/')} />
  );
}