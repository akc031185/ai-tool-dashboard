// Navbar Component

// /components/Navbar.jsx

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/">AI Tool Dashboard</Link>
        </div>

        <div className="space-x-4">
          <Link href="/">
            <span className="hover:underline cursor-pointer">Home</span>
          </Link>
          <Link href="/submit">
            <span className="hover:underline cursor-pointer">Submit Request</span>
          </Link>
          <Link href="/dashboard">
            <span className="hover:underline cursor-pointer">Dashboard</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
