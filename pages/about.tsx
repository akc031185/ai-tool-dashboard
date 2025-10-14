import Head from 'next/head';
import Link from 'next/link';
import { APP_SHORT } from '@/src/lib/appMeta';

export default function About() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Abhishek Choudhary",
    "jobTitle": "Private Money Lender (PML); Private Money Partner (PMP); Multifamily Investor",
    "alumniOf": "SubTo, Gator, Owners Club",
    "url": "https://www.investoraiclub.com/about",
    "sameAs": [
      "https://www.linkedin.com/in/abhishek-kumar-choudhary-36903645/",
      "https://www.instagram.com/dadbuildinglegacy/"
    ],
    "worksFor": { "@type": "Organization", "name": "InvestorAI Club" }
  };

  return (
    <>
      <Head>
        <title>About | {APP_SHORT}</title>
        <meta name="description" content="Learn about InvestorAI Club and founder Abhishek Choudhary, a Private Money Lender (PML), Private Money Partner (PMP), and multifamily investor building practical AI + automation for real estate investors." />
        <link rel="canonical" href="https://www.investoraiclub.com/about" />
        <meta property="og:title" content={`About | ${APP_SHORT}`} />
        <meta property="og:description" content="Learn about InvestorAI Club and founder Abhishek Choudhary, building practical AI + automation for real estate investors." />
        <meta property="og:url" content="https://www.investoraiclub.com/about" />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About {APP_SHORT}
            </h1>
          </div>

          {/* Intro */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              {APP_SHORT} is a hands-on project where I test and build practical AI + automation for real estate investors—fast, simple, and execution-ready.
            </p>
          </div>

          {/* Founder Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Founder</h2>
            <p className="text-lg text-gray-700 mb-4">
              <strong>Abhishek Choudhary</strong> — Private Money Lender (PML), Private Money Partner (PMP), and multifamily investor. I build and refine AI-powered workflows for acquisitions, dispositions, capital raising, creative finance, and back-office ops—then ship them as step-by-step, automatable plans.
            </p>

            <div className="mt-6 space-y-2">
              <p className="text-gray-700">
                <strong>Communities:</strong> SubTo • Gator • Owners Club
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mt-6">
                <a
                  href="https://www.linkedin.com/in/abhishek-kumar-choudhary-36903645/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold border-2 border-purple-200 group-hover:border-purple-500 transition-colors">
                    AC
                  </div>
                  <div>
                    <div className="flex items-center text-purple-600 group-hover:text-purple-700 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn
                    </div>
                    <p className="text-sm text-gray-600">Abhishek Kumar Choudhary</p>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/dadbuildinglegacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold border-2 border-purple-200 group-hover:border-purple-500 transition-colors">
                    AC
                  </div>
                  <div>
                    <div className="flex items-center text-purple-600 group-hover:text-purple-700 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
                      </svg>
                      Instagram
                    </div>
                    <p className="text-sm text-gray-600">@dadbuildinglegacy</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* What I'm Building */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What I'm building here</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-3 mt-1">•</span>
                <span>Intake → triage (AI vs automation) with confidence</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-3 mt-1">•</span>
                <span>Adaptive Q&A that only asks what matters</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-3 mt-1">•</span>
                <span>A visual build plan (Mermaid) + checklist you can implement</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-3 mt-1">•</span>
                <span>A tracker to move from idea → delivered workflow</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/submit-problem">
              <button className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
                Submit Your First Problem
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
