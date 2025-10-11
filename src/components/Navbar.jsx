import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { APP_SHORT, PRIMARY_CTA, TRACKER_CTA, SECONDARY_CTA } from '../lib/appMeta';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const isActivePath = (path) => router.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold hover:text-pink-200 transition-colors">
              {APP_SHORT}
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {session && (
                <>
                  <Link
                    href={PRIMARY_CTA.href}
                    className={`px-3 py-2 rounded-md font-medium transition-colors ${
                      isActivePath(PRIMARY_CTA.href)
                        ? 'text-white underline underline-offset-4'
                        : 'text-white/90 hover:text-pink-200'
                    }`}
                  >
                    {PRIMARY_CTA.label}
                  </Link>
                  <Link
                    href={TRACKER_CTA.href}
                    className={`px-3 py-2 rounded-md font-medium transition-colors ${
                      isActivePath(TRACKER_CTA.href)
                        ? 'text-white underline underline-offset-4'
                        : 'text-white/90 hover:text-pink-200'
                    }`}
                  >
                    {TRACKER_CTA.label}
                  </Link>
                </>
              )}
              {session?.user?.role === 'admin' && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md font-medium transition-colors ${
                    isActivePath('/dashboard')
                      ? 'text-white underline underline-offset-4'
                      : 'text-white/90 hover:text-pink-200'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-white/90 hover:text-pink-200 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href={SECONDARY_CTA.href}
                  className="text-white/90 hover:text-pink-200 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  {SECONDARY_CTA.label}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-pink-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
              aria-label="Open main menu"
              aria-expanded={isMenuOpen}
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
              {session && (
                <>
                  <Link
                    href={PRIMARY_CTA.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActivePath(PRIMARY_CTA.href)
                        ? 'text-white underline underline-offset-4'
                        : 'text-white/90 hover:text-pink-200'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {PRIMARY_CTA.label}
                  </Link>
                  <Link
                    href={TRACKER_CTA.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActivePath(TRACKER_CTA.href)
                        ? 'text-white underline underline-offset-4'
                        : 'text-white/90 hover:text-pink-200'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {TRACKER_CTA.label}
                  </Link>
                </>
              )}
              {session?.user?.role === 'admin' && (
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActivePath('/dashboard')
                      ? 'text-white underline underline-offset-4'
                      : 'text-white/90 hover:text-pink-200'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {session ? (
                <div className="border-t border-purple-600 pt-2 mt-2">
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setIsMenuOpen(false);
                    }}
                    className="text-white/90 hover:text-pink-200 block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href={SECONDARY_CTA.href}
                  className="text-white/90 hover:text-pink-200 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {SECONDARY_CTA.label}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
