import Link from 'next/link';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { APP_TAGLINE, PRIMARY_CTA, SECONDARY_CTA, TRACKER_CTA } from '@/src/lib/appMeta';

export default function Home() {
  const { data: session } = useSession();

  const canonicalUrl = 'https://investoraiclub.com';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'InvestorAI Club',
    description: APP_TAGLINE,
    url: canonicalUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${canonicalUrl}/submit-problem`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <Head>
        <title>InvestorAI Club - Solve Real Estate Problems with AI & Automation</title>
        <meta name="description" content={APP_TAGLINE} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="InvestorAI Club - Solve Real Estate Problems with AI & Automation" />
        <meta property="og:description" content={APP_TAGLINE} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="InvestorAI Club - Solve Real Estate Problems with AI & Automation" />
        <meta name="twitter:description" content={APP_TAGLINE} />
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
              Solve Real Estate Investor Problems with AI & Automation
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-8 md:mb-10">
              {APP_TAGLINE}
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
            <p className="opacity-70 text-xs md:text-sm px-4">
              © 2024 InvestorAI Club - Streamlining real estate investor workflows
            </p>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
}
