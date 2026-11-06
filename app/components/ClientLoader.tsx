'use client';
import dynamic from 'next/dynamic';

// 只有在這個客戶端組件裡，才能使用 ssr: false
const Loader = dynamic(() => import('./Loader'), { ssr: false });

export default function ClientLoader() {
  return <Loader />;
}