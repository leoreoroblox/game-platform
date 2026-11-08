export const instant = false;

import { Suspense } from 'react';
import WorldClient from '../components/WorldClient';

export default function WorldPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-cyan-400">Loading World...</div>}>
      <WorldClient />
    </Suspense>
  );
}