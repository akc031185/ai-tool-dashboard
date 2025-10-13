import Link from 'next/link';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { PRIMARY_CTA, SECONDARY_CTA, TRACKER_CTA, HERO_VARIANTS, SEO } from '@/src/lib/appMeta';
import { pickVariant, type HeroVariant } from '@/src/lib/ab';

export default function Home() {
  const { data: session } = useSession();
  const [variant, setVariant] = useState<HeroVariant>("B");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Determine variant on client-side only
    const selectedVariant = pickVariant(window.location.search);
    setVariant(selectedVariant);
    setMounted(true);

    // Track homepage view with variant (non-blocking)
    fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'home.view',
        meta: { variant: selectedVariant }
      })
    }).catch(() => {
      // Silently fail - analytics shouldn't block UX
    });
  }, []);

  const hero = HERO_VARIANTS[variant];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'InvestorAI Club',
    description: SEO.description,
    url: SEO.canonical,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO.canonical}/submit-problem`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <Head>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <link rel="canonical" href={SEO.canonical} />
        <meta property="og:title" content={SEO.title} />
        <meta property="og:description" content={SEO.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SEO.canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO.title} />
        <meta name="twitter:description" content={SEO.description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <div className="min-h-screen text-white" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}>
      <div className="max-w-6xl mx-auto px-4 md:px-5">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center pt-20 md:pt-24 pb-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-5 md:mb-6 drop-shadow-lg leading-tight">
              {hero.h1}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-8 md:mb-10">
              {hero.sub}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center items-center">
              <Link href={PRIMARY_CTA.href}>
                <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-none rounded-full text-base md:text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[200px] text-center bg-white text-purple-600 hover:transform hover:-translate-y-1 hover:shadow-xl">
                  {PRIMARY_CTA.label}
                </button>
              </Link>
              {session ? (
                <Link href={TRACKER_CTA.href}>
                  <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-none rounded-full text-base md:text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[200px] text-center bg-white/20 text-white border-2 border-white/30 backdrop-blur-lg hover:transform hover:-translate-y-1 hover:shadow-xl">
                    {TRACKER_CTA.label}
                  </button>
                </Link>
              ) : (
                <Link href={SECONDARY_CTA.href}>
                  <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-none rounded-full text-base md:text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[200px] text-center bg-white/20 text-white border-2 border-white/30 backdrop-blur-lg hover:transform hover:-translate-y-1 hover:shadow-xl">
                    {SECONDARY_CTA.label}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 md:py-16 mt-12 md:mt-20 border-t border-white/20">
          <div className="text-center">
            <div className="mb-4">
              <Link href="/how-it-works" className="text-white/90 hover:text-white font-medium underline">
                How It Works
              </Link>
            </div>
            <p className="opacity-70 text-xs md:text-sm px-4">
              © 2024 InvestorAI Club - Streamlining real estate investor workflows
            </p>
          </div>
        </footer>
      </div>

      {/* Dev-only variant badge */}
      {mounted && process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono backdrop-blur-sm border border-white/20">
          Variant: {variant}
        </div>
      )}
    </div>
    </>
  );
}
