'use client';
import Link from 'next/link';

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Friends</h1>
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-10 text-center">
        <p className="text-gray-400 mb-4">You don't have any friends yet.</p>
        <p className="text-sm text-gray-500">Go to the Explore page to find players and follow them!</p>
      </div>
    </div>
  );
}