import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen text-white" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
    }}>
      <div className="max-w-6xl mx-auto px-5 py-5">
        {/* Header */}
        <header className="text-center mb-12 pt-10 pb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-5 drop-shadow-lg">
            🚀 Welcome to AI Tool Dashboard
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Discover, submit, and explore cutting-edge AI tools that are transforming industries. 
            Your gateway to the future of artificial intelligence.
          </p>
        </header>
        
        {/* Main Actions */}
        <div className="flex gap-5 justify-center mb-10 flex-wrap">
          <Link href="/submit-ai-tool">
            <button className="px-8 py-4 border-none rounded-full text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[200px] text-center bg-white/20 text-white border-2 border-white/30 backdrop-blur-lg hover:transform hover:-translate-y-1 hover:shadow-xl">
              Submit AI Tool Request
            </button>
          </Link>
          <Link href="/dashboard/tools">
            <button className="px-8 py-4 border-none rounded-full text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[200px] text-center bg-white/90 text-purple-600 border-2 border-transparent hover:transform hover:-translate-y-1 hover:shadow-xl">
              View AI Tool Dashboard
            </button>
          </Link>
        </div>
        
        {/* Stats Section */}
        <section className="text-center my-20 p-10 bg-white/10 rounded-3xl backdrop-blur-lg">
          <h2 className="text-4xl text-center mb-10 font-semibold">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-10">
            <div className="stat-item">
              <h4 className="text-4xl font-bold mb-2 text-yellow-300">250+</h4>
              <p className="opacity-90 text-lg">AI Tools Listed</p>
            </div>
            <div className="stat-item">
              <h4 className="text-4xl font-bold mb-2 text-yellow-300">15K+</h4>
              <p className="opacity-90 text-lg">Active Users</p>
            </div>
            <div className="stat-item">
              <h4 className="text-4xl font-bold mb-2 text-yellow-300">50+</h4>
              <p className="opacity-90 text-lg">Categories</p>
            </div>
            <div className="stat-item">
              <h4 className="text-4xl font-bold mb-2 text-yellow-300">98%</h4>
              <p className="opacity-90 text-lg">User Satisfaction</p>
            </div>
          </div>
        </section>
        
        {/* Features Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 my-15">
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
            <span className="text-5xl mb-5 block">🔍</span>
            <h3 className="text-2xl mb-4 font-semibold">Discover AI Tools</h3>
            <p className="opacity-90 leading-relaxed mb-5">
              Explore our curated collection of AI tools across different categories including machine learning, 
              natural language processing, computer vision, and more.
            </p>
            <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity">
              Browse Tools →
            </Link>
          </div>
          
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
            <span className="text-5xl mb-5 block">📊</span>
            <h3 className="text-2xl mb-4 font-semibold">Tool Analytics</h3>
            <p className="opacity-90 leading-relaxed mb-5">
              Get detailed insights about tool performance, user ratings, popularity trends, and comprehensive 
              reviews from our community.
            </p>
            <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity">
              View Analytics →
            </Link>
          </div>
          
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
            <span className="text-5xl mb-5 block">💡</span>
            <h3 className="text-2xl mb-4 font-semibold">Submit New Tools</h3>
            <p className="opacity-90 leading-relaxed mb-5">
              Found an amazing AI tool? Share it with our community! Our review process ensures quality 
              and relevance for all submissions.
            </p>
            <Link href="/submit-ai-tool" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity">
              Submit Tool →
            </Link>
          </div>
          
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
            <span className="text-5xl mb-5 block">🤝</span>
            <h3 className="text-2xl mb-4 font-semibold">Community Reviews</h3>
            <p className="opacity-90 leading-relaxed mb-5">
              Read authentic reviews from real users, share your experiences, and help others make informed 
              decisions about AI tools.
            </p>
            <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity">
              Join Community →
            </Link>
          </div>
          
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
            <span className="text-5xl mb-5 block">🏆</span>
            <h3 className="text-2xl mb-4 font-semibold">Top Rated Tools</h3>
            <p className="opacity-90 leading-relaxed mb-5">
              Discover the highest-rated AI tools based on user feedback, performance metrics, and expert evaluations.
            </p>
            <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity">
              See Top Tools →
            </Link>
          </div>
          
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15">
            <span className="text-5xl mb-5 block">📈</span>
            <h3 className="text-2xl mb-4 font-semibold">Trending Now</h3>
            <p className="opacity-90 leading-relaxed mb-5">
              Stay updated with the latest AI tool trends, emerging technologies, and tools gaining popularity 
              in the community.
            </p>
            <Link href="/dashboard/tools" className="text-white no-underline font-semibold opacity-80 hover:opacity-100 transition-opacity">
              View Trends →
            </Link>
          </div>
        </section>
        
        {/* Recently Added Tools */}
        <section className="my-15">
          <h2 className="text-4xl text-center mb-10 font-semibold">Recently Added Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/12 rounded-2xl p-6 transition-all duration-300 border border-white/10 hover:bg-white/18 hover:-translate-y-1">
              <span className="bg-white/20 text-white py-1 px-3 rounded-full text-sm font-semibold inline-block mb-4">
                Machine Learning
              </span>
              <h4 className="text-xl mb-2 font-semibold">AutoML Studio</h4>
              <p className="opacity-90 text-sm leading-relaxed mb-4">
                Automated machine learning platform that simplifies model building and deployment for non-technical users.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>Added 2 days ago</span>
                <span className="bg-green-500 text-white py-1 px-2 rounded-xl text-xs font-semibold">Live</span>
              </div>
            </div>
            
            <div className="bg-white/12 rounded-2xl p-6 transition-all duration-300 border border-white/10 hover:bg-white/18 hover:-translate-y-1">
              <span className="bg-white/20 text-white py-1 px-3 rounded-full text-sm font-semibold inline-block mb-4">
                NLP
              </span>
              <h4 className="text-xl mb-2 font-semibold">TextGenius Pro</h4>
              <p className="opacity-90 text-sm leading-relaxed mb-4">
                Advanced natural language processing tool for content generation, analysis, and optimization.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>Added 5 days ago</span>
                <span className="bg-blue-500 text-white py-1 px-2 rounded-xl text-xs font-semibold">Beta</span>
              </div>
            </div>
            
            <div className="bg-white/12 rounded-2xl p-6 transition-all duration-300 border border-white/10 hover:bg-white/18 hover:-translate-y-1">
              <span className="bg-white/20 text-white py-1 px-3 rounded-full text-sm font-semibold inline-block mb-4">
                Computer Vision
              </span>
              <h4 className="text-xl mb-2 font-semibold">VisionAI Detector</h4>
              <p className="opacity-90 text-sm leading-relaxed mb-4">
                Real-time object detection and image analysis tool with custom model training capabilities.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>Added 1 week ago</span>
                <span className="bg-green-500 text-white py-1 px-2 rounded-xl text-xs font-semibold">Live</span>
              </div>
            </div>
            
            <div className="bg-white/12 rounded-2xl p-6 transition-all duration-300 border border-white/10 hover:bg-white/18 hover:-translate-y-1">
              <span className="bg-white/20 text-white py-1 px-3 rounded-full text-sm font-semibold inline-block mb-4">
                Audio Processing
              </span>
              <h4 className="text-xl mb-2 font-semibold">SoundMind AI</h4>
              <p className="opacity-90 text-sm leading-relaxed mb-4">
                AI-powered audio enhancement and transcription service with multi-language support.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>Submitted today</span>
                <span className="bg-orange-500 text-white py-1 px-2 rounded-xl text-xs font-semibold">Pending</span>
              </div>
            </div>
            
            <div className="bg-white/12 rounded-2xl p-6 transition-all duration-300 border border-white/10 hover:bg-white/18 hover:-translate-y-1">
              <span className="bg-white/20 text-white py-1 px-3 rounded-full text-sm font-semibold inline-block mb-4">
                Data Analytics
              </span>
              <h4 className="text-xl mb-2 font-semibold">DataInsight Engine</h4>
              <p className="opacity-90 text-sm leading-relaxed mb-4">
                Intelligent data analysis platform with automated insights and predictive modeling.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>Added 3 days ago</span>
                <span className="bg-green-500 text-white py-1 px-2 rounded-xl text-xs font-semibold">Live</span>
              </div>
            </div>
            
            <div className="bg-white/12 rounded-2xl p-6 transition-all duration-300 border border-white/10 hover:bg-white/18 hover:-translate-y-1">
              <span className="bg-white/20 text-white py-1 px-3 rounded-full text-sm font-semibold inline-block mb-4">
                Robotics
              </span>
              <h4 className="text-xl mb-2 font-semibold">RoboControl Suite</h4>
              <p className="opacity-90 text-sm leading-relaxed mb-4">
                Comprehensive robotics control and simulation platform for industrial applications.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>Added 1 week ago</span>
                <span className="bg-blue-500 text-white py-1 px-2 rounded-xl text-xs font-semibold">Beta</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
