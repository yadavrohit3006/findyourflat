import type { ReactNode } from 'react';
import Link from 'next/link';
import { AdminLogout } from '@/components/admin/AdminLogout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-sm tracking-tight">FindYourFlat Admin</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/listings" className="text-gray-300 hover:text-white transition-colors">
              Listings
            </Link>
            <Link href="/admin/new" className="text-gray-300 hover:text-white transition-colors">
              + Add Listing
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors" target="_blank">
              View Site ↗
            </Link>
          </nav>
        </div>
        <AdminLogout />
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
