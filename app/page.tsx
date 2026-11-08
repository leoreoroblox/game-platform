export const instant = false;

import { Suspense } from 'react';
import ExploreClient from './components/ExploreClient';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<div className="pt-32 text-center text-cyan-400 animate-pulse">Loading World...</div>}>
        <ExploreClient />
      </Suspense>
    </main>
  );
}