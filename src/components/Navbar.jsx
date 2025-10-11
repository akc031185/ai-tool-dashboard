import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { APP_SHORT, PRIMARY_CTA, TRACKER_CTA, SECONDARY_CTA } from '../lib/appMeta';

export default function Navbar() {
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

          {/* Navigation Links */}
          <div className="flex items-center space-x-4 md:space-x-6">
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
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-white/90 hover:text-pink-200 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-medium transition-colors"
              >
                Logout
              </button>
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
