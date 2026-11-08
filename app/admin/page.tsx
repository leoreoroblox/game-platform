export const instant = false;

import { Suspense } from 'react';
import AdminClient from '../components/AdminClient';

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-cyan-400 flex items-center justify-center animate-pulse">Checking Admin Permissions...</div>}>
      <AdminClient />
    </Suspense>
  );
}