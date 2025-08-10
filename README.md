# Investor AI Club - AI Tools Dashboard & Community Platform

**Website:** https://www.investoraiclub.com  
**Repository:** https://github.com/akc031185/ai-tool-dashboard

A comprehensive AI tools dashboard and community platform designed for investors and entrepreneurs to discover, submit, and manage AI tools and solutions. Built with Next.js and featuring advanced authentication, tool categorization, and workflow integration capabilities.

## Project Overview

The Investor AI Club platform serves as a centralized hub for AI tool discovery and management, featuring a sophisticated dashboard system for both users and administrators. The platform supports tool submissions, automated categorization using AI, and planned integration with N8N workflows for automated processing.

## Technology Stack

### Frontend
- **Next.js 14.2.30** with Pages Router
- **React 18.3.1**
- **TypeScript 5.8.3**
- **Tailwind CSS 3.4.17**
- **SWR 2.3.3** for data fetching
- **Axios 1.6.0** for HTTP requests

### Backend & Database
- **MongoDB** via Mongoose 7.0.0
- **NextAuth.js 4.24.11** for authentication
- **bcryptjs 3.0.2** for password hashing
- Next.js API Routes

### AI Integration
- **Anthropic SDK 0.56.0** (Claude AI)
- **OpenAI SDK 4.0.0**
- AI-powered tool categorization
- Planned: AI agent workflows

### Development & Testing
- **Jest 30.0.3** with React Testing Library
- **ESLint 9.29.0** with Next.js configuration
- **Prettier 3.6.1** for code formatting
- **TypeScript 5.8.3** for type safety

## Project Structure

```
investoraiclub/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                    # Main navigation component
│   │   └── ToolCard.jsx                  # AI tool display card
│   ├── lib/
│   │   ├── claude.ts                     # Claude AI integration
│   │   ├── dbConnect.js                  # MongoDB connection
│   │   ├── openai.js                     # OpenAI integration (legacy)
│   │   └── openai.ts                     # OpenAI integration (TypeScript)
│   └── models/
│       ├── AiTool.ts                     # AI tool data model
│       ├── Request.js                    # Tool request model
│       └── User.ts                       # User authentication model
├── pages/
│   ├── api/
│   │   ├── ai-tools/
│   │   │   ├── [id].ts                   # Individual tool CRUD operations
│   │   │   └── index.ts                  # AI tool submission & listing
│   │   ├── auth/
│   │   │   ├── [...nextauth].ts          # NextAuth configuration
│   │   │   └── register.ts               # User registration endpoint
│   │   ├── requests/
│   │   │   └── index.ts                  # Tool request management
│   │   └── workspace/
│   │       ├── generate.ts               # N8N workflow generation
│   │       └── status.ts                 # Workspace status management
│   ├── admin/
│   │   └── index.tsx                     # Admin dashboard
│   ├── auth/
│   │   ├── login.tsx                     # User login page
│   │   └── register.tsx                  # User registration page
│   ├── dashboard/
│   │   ├── submissions.js                # Tool submissions management
│   │   └── tools.tsx                     # Tools dashboard
│   ├── workspace/
│   │   └── index.tsx                     # Workspace management interface
│   ├── _app.js                           # Next.js app configuration
│   ├── contact.js                        # Contact page
│   ├── dashboard.js                      # Main dashboard
│   ├── index.tsx                         # Homepage
│   ├── submit-ai-tool.tsx                # AI tool submission form
│   └── submit.js                         # General submission page
├── styles/
│   └── globals.css                       # Global styles
├── types/
│   └── next-auth.d.ts                    # NextAuth type definitions
└── _tests_/                              # Test files
```

## Recent Changes & Development History

### December 2024 - Major Project Restructuring

**Commits:** `2b73a7f`, `ac6bf18`, `702a6f6`

#### Phase 1: Project Rename and Restructuring (`2b73a7f`)
**Changes Made:**
1. **Project Rename:**
   - Renamed from `ai-tool-dashboard` to `investoraiclub`
   - Updated package.json project name
   - Aligned with investoraiclub.com domain

2. **Folder Structure Migration:**
   - Moved `components/` → `src/components/`
   - Moved `lib/` → `src/lib/`
   - Moved `models/` → `src/models/`
   - Maintained Pages Router architecture for compatibility

#### Phase 2: Import Path Fixes (`ac6bf18`)
**Changes Made:**
1. **API Route Import Updates:**
   - Updated all `@/lib/` imports to `@/src/lib/`
   - Updated all `@/models/` imports to `@/src/models/`
   - Fixed 7 API files with TypeScript import issues

#### Phase 3: Component Import Resolution (`702a6f6`)
**Changes Made:**
1. **Frontend Component Imports:**
   - Fixed `pages/_app.js`, `pages/dashboard.js`, `pages/submit.js`
   - Updated all `../components/` to `../src/components/`
   - Resolved webpack build errors

**Technical Impact:**
- ✅ Build Success: All compilation errors resolved
- ✅ Deployment Ready: Vercel deployment successful
- ✅ Backward Compatibility: All functionality preserved

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB instance
- Anthropic API key
- OpenAI API key (optional)

### Environment Variables
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Installation Steps
1. Clone: `git clone https://github.com/akc031185/ai-tool-dashboard.git`
2. Install: `npm install`
3. Configure: Set up `.env.local`
4. Run: `npm run dev`

## License

Private proprietary software. All rights reserved.

---

**Last Updated:** December 2024  
**Version:** 2.0.0