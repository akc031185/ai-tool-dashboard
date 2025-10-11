import Head from 'next/head';
import Link from 'next/link';
import { APP_SHORT, APP_TAGLINE, PRIMARY_CTA, TRACKER_CTA } from '@/src/lib/appMeta';

export default function HowItWorks() {
  const canonicalUrl = 'https://investoraiclub.com/how-it-works';

  const steps = [
    {
      number: 1,
      title: 'Describe Your Problem',
      description: 'Submit a detailed description of the AI or automation challenge you want to solve. The more context you provide, the better our analysis.',
      icon: '📝',
      cta: PRIMARY_CTA,
    },
    {
      number: 2,
      title: 'AI Triage & Classification',
      description: 'Our AI analyzes your problem, classifies it by type (AI, Automation, or Hybrid), identifies relevant domains, and flags any risks or missing information.',
      icon: '🤖',
    },
    {
      number: 3,
      title: 'Answer Follow-up Questions',
      description: 'Based on the triage, we ask targeted questions to gather specific details about volume, data sources, constraints, and success criteria.',
      icon: '❓',
    },
    {
      number: 4,
      title: 'Get Your Build Plan',
      description: 'Receive a comprehensive solution outline including requirements, cost estimates, model recommendations, workflow diagrams, and actionable next steps.',
      icon: '📋',
      cta: TRACKER_CTA,
    },
    {
      number: 5,
      title: 'Track & Implement',
      description: 'Use our project tracker to monitor progress from draft to completion. Export your plan as PDF, update status, and manage multiple projects.',
      icon: '✅',
      cta: TRACKER_CTA,
    },
  ];

  return (
    <>
      <Head>
        <title>{`How It Works - ${APP_SHORT}`}</title>
        <meta name="description" content={`Learn how ${APP_SHORT} helps you build AI and automation solutions in 5 simple steps. From problem description to implementation plan.`} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={`How It Works - ${APP_SHORT}`} />
        <meta property="og:description" content={`Learn how ${APP_SHORT} helps you build AI and automation solutions in 5 simple steps.`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`How It Works - ${APP_SHORT}`} />
        <meta name="twitter:description" content={`Learn how ${APP_SHORT} helps you build AI and automation solutions in 5 simple steps.`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {APP_SHORT}
            </Link>
            <nav className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-purple-600 font-medium transition">
                Home
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-purple-600 font-medium transition">
                Login
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {APP_TAGLINE}
            </p>
            <p className="text-lg text-gray-700">
              From problem description to actionable build plan in 5 simple steps
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Icon & Number */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-6xl shadow-xl">
                        {step.icon}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold text-purple-600 shadow-lg">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h2>
                    <p className="text-lg text-gray-700 mb-6">
                      {step.description}
                    </p>
                    {step.cta && (
                      <Link
                        href={step.cta.href}
                        className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-md"
                      >
                        {step.cta.label} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Submit your first problem and get a detailed build plan in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={PRIMARY_CTA.href}
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
              >
                {PRIMARY_CTA.label}
              </Link>
              <Link
                href="/login"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} {APP_SHORT}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
