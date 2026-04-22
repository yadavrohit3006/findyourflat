'use client';

import { useRouter } from 'next/navigation';

export function AdminLogout() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-gray-400 hover:text-white text-xs transition-colors"
    >
      Sign out
    </button>
  );
}
