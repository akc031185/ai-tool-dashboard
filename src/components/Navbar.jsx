import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { APP_SHORT, PRIMARY_CTA, TRACKER_CTA, SECONDARY_CTA } from '../lib/appMeta';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActivePath = (path) => router.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user?.name) return 'U';
    const names = session.user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

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

          {/* Navigation Links */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Public Links */}
            <Link
              href="/how-it-works"
              className={`px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium transition-colors ${
                isActivePath('/how-it-works')
                  ? 'text-white underline underline-offset-4'
                  : 'text-white/90 hover:text-pink-200'
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className={`px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium transition-colors ${
                isActivePath('/about')
                  ? 'text-white underline underline-offset-4'
                  : 'text-white/90 hover:text-pink-200'
              }`}
            >
              About
            </Link>

            {/* Authenticated User Links */}
            {session && (
              <>
                <Link
                  href={PRIMARY_CTA.href}
                  className={`px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium transition-colors ${
                    isActivePath(PRIMARY_CTA.href)
                      ? 'text-white underline underline-offset-4'
                      : 'text-white/90 hover:text-pink-200'
                  }`}
                >
                  {PRIMARY_CTA.label}
                </Link>
                <Link
                  href={TRACKER_CTA.href}
                  className={`px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium transition-colors ${
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
                className={`px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium transition-colors ${
                  isActivePath('/dashboard')
                    ? 'text-white underline underline-offset-4'
                    : 'text-white/90 hover:text-pink-200'
                }`}
              >
                Dashboard
              </Link>
            )}
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium transition-colors text-white/90 hover:text-pink-200"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                    {getUserInitials()}
                  </div>
                  <span className="hidden md:inline">{session.user.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 text-gray-800">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <Link
                      href={TRACKER_CTA.href}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {TRACKER_CTA.label}
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={SECONDARY_CTA.href}
                className="text-white/90 hover:text-pink-200 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium transition-colors"
              >
                {SECONDARY_CTA.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
