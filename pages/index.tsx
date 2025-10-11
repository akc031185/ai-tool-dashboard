import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Smooth scroll handler
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'tools', 'statistics', 'about'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-white" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
    }}>
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('home')}
              className="text-xl md:text-2xl font-bold hover:text-pink-200 transition-colors cursor-pointer"
            >
              🚀 AI Tool Dashboard
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {[
                { id: 'home', label: 'Home' },
                { id: 'features', label: 'Features' },
                { id: 'tools', label: 'Tools' },
                { id: 'statistics', label: 'Statistics' },
                { id: 'about', label: 'About' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeSection === id
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
              <Link href="/submit-ai-tool">
                <button className="ml-2 px-4 lg:px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-pink-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Submit Tool
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-2">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'features', label: 'Features' },
                  { id: 'tools', label: 'Tools' },
                  { id: 'statistics', label: 'Statistics' },
                  { id: 'about', label: 'About' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`px-4 py-3 rounded-lg font-medium text-left transition-all ${
                      activeSection === id
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <Link href="/submit-ai-tool">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-4 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-pink-50 transition-all"
                  >
                    Submit Tool
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-5">
        {/* Home Section */}
        <section id="home" className="min-h-screen flex flex-col justify-center pt-20 md:pt-24 pb-12">
          <header className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-5 md:mb-6 drop-shadow-lg leading-tight">
              🚀 Welcome to AI Tool Dashboard
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-8 md:mb-10">
              Discover, submit, and explore cutting-edge AI tools that are transforming industries.
              Your gateway to the future of artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center">
              <Link href="/submit-ai-tool">
                <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-none rounded-full text-base md:text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[200px] text-center bg-white/20 text-white border-2 border-white/30 backdrop-blur-lg hover:transform hover:-translate-y-1 hover:shadow-xl">
                  Submit AI Tool Request
                </button>
              </Link>
              <Link href="/dashboard/tools">
                <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-none rounded-full text-base md:text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[200px] text-center bg-white/90 text-purple-600 border-2 border-transparent hover:transform hover:-translate-y-1 hover:shadow-xl">
                  View AI Tool Dashboard
                </button>
              </Link>
            </div>
          </header>
        </section>

        {/* Statistics Section */}
        <section id="statistics" className="py-16 md:py-20">
          <div className="text-center p-8 md:p-10 bg-white/10 rounded-3xl backdrop-blur-lg">
            <h2 className="text-3xl md:text-4xl text-center mb-8 md:mb-10 font-semibold">Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              <div className="stat-item">
                <h4 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-300">250+</h4>
                <p className="opacity-90 text-sm md:text-lg">AI Tools Listed</p>
              </div>
              <div className="stat-item">
                <h4 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-300">15K+</h4>
                <p className="opacity-90 text-sm md:text-lg">Active Users</p>
              </div>
              <div className="stat-item">
                <h4 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-300">50+</h4>
                <p className="opacity-90 text-sm md:text-lg">Categories</p>
              </div>
              <div className="stat-item">
                <h4 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-300">98%</h4>
                <p className="opacity-90 text-sm md:text-lg">User Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl text-center mb-10 md:mb-12 font-semibold">Our Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
              <span className="text-4xl md:text-5xl mb-4 md:mb-5 block">🔍</span>
              <h3 className="text-xl md:text-2xl mb-3 md:mb-4 font-semibold">Discover AI Tools</h3>
              <p className="opacity-90 leading-relaxed mb-4 md:mb-5 text-sm md:text-base">
                Explore our curated collection of AI tools across different categories including machine learning,
                natural language processing, computer vision, and more.
              </p>
              <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity text-sm md:text-base">
                Browse Tools →
              </Link>
            </div>

            <div className="bg-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
              <span className="text-4xl md:text-5xl mb-4 md:mb-5 block">📊</span>
              <h3 className="text-xl md:text-2xl mb-3 md:mb-4 font-semibold">Tool Analytics</h3>
              <p className="opacity-90 leading-relaxed mb-4 md:mb-5 text-sm md:text-base">
                Get detailed insights about tool performance, user ratings, popularity trends, and comprehensive
                reviews from our community.
              </p>
              <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity text-sm md:text-base">
                View Analytics →
              </Link>
            </div>

            <div className="bg-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
              <span className="text-4xl md:text-5xl mb-4 md:mb-5 block">💡</span>
              <h3 className="text-xl md:text-2xl mb-3 md:mb-4 font-semibold">Submit New Tools</h3>
              <p className="opacity-90 leading-relaxed mb-4 md:mb-5 text-sm md:text-base">
                Found an amazing AI tool? Share it with our community! Our review process ensures quality
                and relevance for all submissions.
              </p>
              <Link href="/submit-ai-tool" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity text-sm md:text-base">
                Submit Tool →
              </Link>
            </div>

            <div className="bg-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
              <span className="text-4xl md:text-5xl mb-4 md:mb-5 block">🤝</span>
              <h3 className="text-xl md:text-2xl mb-3 md:mb-4 font-semibold">Community Reviews</h3>
              <p className="opacity-90 leading-relaxed mb-4 md:mb-5 text-sm md:text-base">
                Read authentic reviews from real users, share your experiences, and help others make informed
                decisions about AI tools.
              </p>
              <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity text-sm md:text-base">
                Join Community →
              </Link>
            </div>

            <div className="bg-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
              <span className="text-4xl md:text-5xl mb-4 md:mb-5 block">🏆</span>
              <h3 className="text-xl md:text-2xl mb-3 md:mb-4 font-semibold">Top Rated Tools</h3>
              <p className="opacity-90 leading-relaxed mb-4 md:mb-5 text-sm md:text-base">
                Discover the highest-rated AI tools based on user feedback, performance metrics, and expert evaluations.
              </p>
              <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity text-sm md:text-base">
                See Top Tools →
              </Link>
            </div>

            <div className="bg-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
              <span className="text-4xl md:text-5xl mb-4 md:mb-5 block">📈</span>
              <h3 className="text-xl md:text-2xl mb-3 md:mb-4 font-semibold">Trending Now</h3>
              <p className="opacity-90 leading-relaxed mb-4 md:mb-5 text-sm md:text-base">
                Stay updated with the latest AI tool trends, emerging technologies, and tools gaining popularity
                in the community.
              </p>
              <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity text-sm md:text-base">
                View Trends →
              </Link>
            </div>
          </div>
        </section>

        {/* Tools Section - Recently Added */}
        <section id="tools" className="py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl text-center mb-10 md:mb-12 font-semibold">Recently Added Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {[
              { category: 'Machine Learning', name: 'AutoML Studio', description: 'Automated machine learning platform that simplifies model building and deployment for non-technical users.', status: 'Live', statusColor: 'bg-green-500', time: 'Added 2 days ago' },
              { category: 'NLP', name: 'TextGenius Pro', description: 'Advanced natural language processing tool for content generation, analysis, and optimization.', status: 'Beta', statusColor: 'bg-blue-500', time: 'Added 5 days ago' },
              { category: 'Computer Vision', name: 'VisionAI Detector', description: 'Real-time object detection and image analysis tool with custom model training capabilities.', status: 'Live', statusColor: 'bg-green-500', time: 'Added 1 week ago' },
              { category: 'Audio Processing', name: 'SoundMind AI', description: 'AI-powered audio enhancement and transcription service with multi-language support.', status: 'Pending', statusColor: 'bg-orange-500', time: 'Submitted today' },
              { category: 'Data Analytics', name: 'DataInsight Engine', description: 'Intelligent data analysis platform with automated insights and predictive modeling.', status: 'Live', statusColor: 'bg-green-500', time: 'Added 3 days ago' },
              { category: 'Robotics', name: 'RoboControl Suite', description: 'Comprehensive robotics control and simulation platform for industrial applications.', status: 'Beta', statusColor: 'bg-blue-500', time: 'Added 1 week ago' }
            ].map((tool, index) => (
              <div key={index} className="bg-white/12 rounded-2xl p-5 md:p-6 transition-all duration-300 border border-white/10 hover:bg-white/18 hover:-translate-y-1">
                <span className="bg-white/20 text-white py-1 px-3 rounded-full text-xs md:text-sm font-semibold inline-block mb-3 md:mb-4">
                  {tool.category}
                </span>
                <h4 className="text-lg md:text-xl mb-2 font-semibold">{tool.name}</h4>
                <p className="opacity-90 text-xs md:text-sm leading-relaxed mb-3 md:mb-4">
                  {tool.description}
                </p>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="opacity-80">{tool.time}</span>
                  <span className={`${tool.statusColor} text-white py-1 px-2 rounded-xl text-xs font-semibold`}>
                    {tool.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-20">
          <div className="p-8 md:p-10 bg-white/10 rounded-3xl backdrop-blur-lg">
            <h2 className="text-3xl md:text-4xl text-center mb-8 md:mb-10 font-semibold">About AI Tool Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">🌟 Our Mission</h3>
                <p className="opacity-90 leading-relaxed mb-5 md:mb-6 text-sm md:text-base">
                  We're building the world's most comprehensive platform for AI tool discovery and collaboration.
                  Our mission is to democratize access to artificial intelligence by connecting innovators,
                  developers, and businesses with the tools they need to succeed.
                </p>

                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">💡 What We Do</h3>
                <p className="opacity-90 leading-relaxed mb-5 md:mb-6 text-sm md:text-base">
                  From machine learning platforms to natural language processing tools, computer vision systems
                  to robotics controllers - we curate and showcase the most innovative AI solutions across all industries.
                </p>

                <div className="flex flex-wrap gap-2 md:gap-3">
                  <span className="bg-white/20 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium">AI Discovery</span>
                  <span className="bg-white/20 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium">Tool Curation</span>
                  <span className="bg-white/20 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium">Community Reviews</span>
                  <span className="bg-white/20 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium">Expert Analysis</span>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="bg-white/15 p-5 md:p-6 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center mb-2 md:mb-3">
                    <span className="text-2xl md:text-3xl mr-2 md:mr-3">🎯</span>
                    <h4 className="text-lg md:text-xl font-semibold">Quality First</h4>
                  </div>
                  <p className="opacity-90 text-sm md:text-base">Every tool undergoes rigorous review to ensure it meets our quality standards.</p>
                </div>

                <div className="bg-white/15 p-5 md:p-6 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center mb-2 md:mb-3">
                    <span className="text-2xl md:text-3xl mr-2 md:mr-3">🤝</span>
                    <h4 className="text-lg md:text-xl font-semibold">Community Driven</h4>
                  </div>
                  <p className="opacity-90 text-sm md:text-base">Built by the community, for the community. Your feedback shapes our platform.</p>
                </div>

                <div className="bg-white/15 p-5 md:p-6 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center mb-2 md:mb-3">
                    <span className="text-2xl md:text-3xl mr-2 md:mr-3">🚀</span>
                    <h4 className="text-lg md:text-xl font-semibold">Innovation Hub</h4>
                  </div>
                  <p className="opacity-90 text-sm md:text-base">Discover cutting-edge tools before they become mainstream industry standards.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 md:py-16 mt-12 md:mt-20 border-t border-white/20">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-semibold mb-3 md:mb-4">Ready to Get Started?</h3>
            <p className="opacity-90 mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base px-4">
              Join thousands of developers, researchers, and businesses who trust AI Tool Dashboard
              to discover and evaluate the best AI solutions.
            </p>

            <div className="flex gap-3 md:gap-4 justify-center flex-wrap px-4">
              <Link href="/submit-ai-tool">
                <button className="bg-white text-purple-600 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 text-sm md:text-base">
                  Submit Your Tool
                </button>
              </Link>
              <Link href="/dashboard/tools">
                <button className="bg-white/20 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 text-sm md:text-base">
                  Explore Tools
                </button>
              </Link>
            </div>

            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10">
              <p className="opacity-70 text-xs md:text-sm px-4">
                © 2024 AI Tool Dashboard - InvestorAI Club. Made for the AI community.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
