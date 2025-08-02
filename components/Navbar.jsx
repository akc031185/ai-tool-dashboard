import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold hover:text-pink-200 transition-colors">
              🚀 AI Tool Dashboard
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="hover:text-pink-200 px-3 py-2 rounded-md font-medium transition-colors">
                Home
              </Link>
              <Link href="/submit-ai-tool" className="hover:text-pink-200 px-3 py-2 rounded-md font-medium transition-colors">
                Submit Request
              </Link>
              <Link href="/dashboard/tools" className="hover:text-pink-200 px-3 py-2 rounded-md font-medium transition-colors">
                Dashboard
              </Link>
              {session?.user?.role === 'admin' && (
                <Link href="/admin" className="hover:text-pink-200 px-3 py-2 rounded-md font-medium transition-colors">
                  Admin
                </Link>
              )}
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-pink-100 text-sm">Welcome, {session.user.name}</span>
                  <button
                    onClick={() => signOut()}
                    className="hover:text-pink-200 px-3 py-2 rounded-md font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" className="hover:text-pink-200 px-3 py-2 rounded-md font-medium transition-colors">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-pink-200 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-purple-700 rounded-lg mt-2">
              <Link 
                href="/" 
                className="text-white hover:text-pink-200 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/submit-ai-tool" 
                className="text-white hover:text-pink-200 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Submit Request
              </Link>
              <Link 
                href="/dashboard/tools" 
                className="text-white hover:text-pink-200 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {session?.user?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="text-white hover:text-pink-200 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              {session ? (
                <div className="border-t border-purple-600 pt-2 mt-2">
                  <div className="px-3 py-2 text-pink-100 text-sm">
                    Welcome, {session.user.name}
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-white hover:text-pink-200 block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="text-white hover:text-pink-200 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
