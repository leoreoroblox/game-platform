import { Suspense } from 'react';
import ExploreClient from './components/ExploreClient';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<div className="pt-32 text-center text-cyan-400">Loading...</div>}>
        <ExploreClient />
      </Suspense>
    </main>
  );
}