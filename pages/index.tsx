import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { APP_NAME, APP_TAGLINE, APP_SHORT, PRIMARY_CTA, SECONDARY_CTA, TRACKER_CTA } from '@/src/lib/appMeta';

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <div className="min-h-screen text-white" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
    }}>
      {/* Header/Navigation */}
      <header className="border-b border-white/10">
        <nav className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-bold hover:text-pink-200 transition-colors">
              {APP_SHORT}
            </Link>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href={PRIMARY_CTA.href} className="text-sm md:text-base hover:text-pink-200 transition-colors">
                    {PRIMARY_CTA.label}
                  </Link>
                  <Link href={TRACKER_CTA.href} className="text-sm md:text-base hover:text-pink-200 transition-colors">
                    {TRACKER_CTA.label}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm md:text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href={SECONDARY_CTA.href}>
                  <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition text-sm md:text-base font-semibold">
                    {SECONDARY_CTA.label}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-5">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center pt-20 md:pt-24 pb-12">
          <header className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-5 md:mb-6 drop-shadow-lg leading-tight">
              {APP_NAME}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-8 md:mb-10">
              {APP_TAGLINE}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center">
              <Link href={PRIMARY_CTA.href}>
                <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-none rounded-full text-base md:text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[200px] text-center bg-white text-purple-600 hover:transform hover:-translate-y-1 hover:shadow-xl">
                  {PRIMARY_CTA.label}
                </button>
              </Link>
              <Link href={SECONDARY_CTA.href}>
                <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-none rounded-full text-base md:text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[200px] text-center bg-white/20 text-white border-2 border-white/30 backdrop-blur-lg hover:transform hover:-translate-y-1 hover:shadow-xl">
                  {SECONDARY_CTA.label}
                </button>
              </Link>
            </div>
          </header>
        </section>

        {/* Footer */}
        <footer className="py-12 md:py-16 mt-12 md:mt-20 border-t border-white/20">
          <div className="text-center">
            <p className="opacity-70 text-xs md:text-sm px-4">
              © 2024 InvestorAI Club - Streamlining real estate investor workflows
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
