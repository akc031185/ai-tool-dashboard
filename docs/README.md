# AI Tool Dashboard - Documentation

## Project Overview

AI Tool Dashboard is a comprehensive SaaS platform for real estate investors to submit workflow automation problems and receive AI-powered solutions. The platform handles problem intake, triage, analysis, and solution generation with full admin management capabilities.

---

## Recent Implementations

### Step 8 - Admin Project Management + RFIs ✅
**Completed**: October 2025

Comprehensive admin capabilities for managing user problems and requesting additional information.

**Key Features**:
- Admin console with filtering and search
- Problem status management
- Assignee management for workload distribution
- Lock/unlock system to prevent user modifications
- Request for Information (RFI) system
- Activity logging and audit trail

**[View Full Documentation →](./STEP-8-ADMIN-RFIS.md)**

---

### Step 9 - Analytics & Cost Dashboard ✅
**Completed**: October 2025

Complete analytics pipeline with event tracking, LLM usage monitoring, and cost estimation.

**Key Features**:
- Event logging across all key workflows
- LLM token usage and latency tracking
- Daily aggregation with Vercel Cron
- Admin analytics dashboard with charts
- OpenAI cost estimation and budgeting

**[View Full Documentation →](./STEP-9-ANALYTICS.md)**

---

## Architecture

### Technology Stack

**Frontend**:
- Next.js 14 (Pages Router)
- React with TypeScript
- Tailwind CSS for styling
- next-auth for authentication

**Backend**:
- Next.js API Routes
- MongoDB with Mongoose ODM
- OpenAI API (gpt-4o, gpt-4o-mini)
- Vercel Cron for scheduled jobs

**Infrastructure**:
- Vercel for hosting and deployment
- MongoDB Atlas for database
- SendGrid/Resend for emails
- Vercel Cron for scheduled tasks

---

## Core Workflows

### 1. Problem Intake Flow
```
User submits problem
  ↓
Triage (AI classification)
  ↓
Follow-up questions
  ↓
Solution outline generation
  ↓
PDF export
```

### 2. Admin Management Flow
```
Admin views problem list
  ↓
Filter and find problems
  ↓
Assign to admin / Change status
  ↓
Create RFI if needed
  ↓
User responds to RFI
  ↓
Admin closes RFI / Completes work
```

### 3. Analytics Flow
```
Events logged on all actions
  ↓
LLM usage captured per call
  ↓
Daily cron aggregates data
  ↓
Admin views dashboard
  ↓
Cost estimates and insights
```

---

## Data Models

### Core Collections

#### Users
```typescript
{
  _id: ObjectId,
  email: String,
  name: String,
  role: 'user' | 'admin',
  hashedPassword: String,
  createdAt: Date
}
```

#### Problems
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  rawDescription: String,
  status: 'draft' | 'submitted' | 'in-progress' | 'completed' | 'cancelled',
  triage: {
    kind: ['AI', 'Automation', 'Hybrid'],
    domains: [{ label, score }],
    subdomains: [{ label, score }],
    other_tags: String[],
    needs_more_info: Boolean,
    missing_info: String[],
    risk_flags: String[],
    notes: String
  },
  followUps: [{
    question: String,
    answer: String,
    required: Boolean
  }],
  solutionOutline: String,
  assigneeId: ObjectId,
  adminLocked: Boolean,
  rfis: [{
    _id: ObjectId,
    question: String,
    answer: String,
    status: 'open' | 'answered' | 'closed',
    priority: 'low' | 'normal' | 'high',
    dueDate: Date,
    createdAt: Date,
    answeredAt: Date
  }],
  activity: [{
    _id: ObjectId,
    at: Date,
    by: ObjectId,
    type: String,
    note: String,
    meta: Object
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Events (Analytics)
```typescript
{
  _id: ObjectId,
  at: Date,
  userId: ObjectId,
  problemId: ObjectId,
  type: String,  // 'triage.run', 'outline.ok', etc.
  meta: Object
}
```

#### LLMUsage (Analytics)
```typescript
{
  _id: ObjectId,
  at: Date,
  userId: ObjectId,
  problemId: ObjectId,
  route: String,
  model: String,
  ms: Number,
  tokensIn: Number,
  tokensOut: Number
}
```

#### DailyAnalytics (Analytics)
```typescript
{
  _id: ObjectId,
  date: Date,
  events: [{ type, count }],
  llmUsage: [{ route, model, totalCalls, totalTokensIn, totalTokensOut, avgMs }],
  problems: { created, submitted, inProgress, completed },
  topDomains: [{ domain, count }]
}
```

---

## API Routes

### Public Routes
- `POST /api/auth/[...nextauth]` - Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Routes (Authenticated)
- `POST /api/intake/triage` - Submit problem for triage
- `GET /api/intake/questions` - Get follow-up questions
- `POST /api/intake/answers` - Submit follow-up answers
- `POST /api/intake/outline` - Generate solution outline
- `GET /api/export/outline-pdf` - Export outline as PDF
- `GET /api/problems/list` - List user's problems
- `GET /api/problems/[id]` - Get problem details
- `POST /api/problems/[id]/rfi/[rfiId]/answer` - Answer RFI

### Admin Routes (Admin Only)
- `GET /api/admin/problems` - List all problems (with filters)
- `PATCH /api/admin/problems/[id]/triage` - Edit triage
- `PATCH /api/admin/problems/[id]/status` - Change status
- `PATCH /api/admin/problems/[id]/assign` - Assign problem
- `PATCH /api/admin/problems/[id]/lock` - Lock/unlock problem
- `POST /api/problems/[id]/rfi` - Create RFI
- `POST /api/problems/[id]/rfi/[rfiId]/close` - Close RFI
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/users` - List all users

### Cron Routes (System)
- `GET /api/cron/usage-daily` - Daily aggregation job

---

## Pages

### Public Pages
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form

### User Pages
- `/dashboard` - User dashboard
- `/project-tracker` - User's problems list
- `/submit-problem` - Problem submission flow
- `/problems/[id]` - Problem details page

### Admin Pages
- `/admin` - Admin console (problem management)
- `/admin/analytics` - Analytics dashboard

---

## Environment Variables

### Required for All Environments

```bash
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here

# OpenAI
OPENAI_API_KEY=sk-...

# Email (SendGrid or Resend)
SENDGRID_API_KEY=SG....
# OR
RESEND_API_KEY=re_...

# Cron Job Protection
CRON_SECRET=5f60e77feb6e3322a89b282c6dc546803af1d2a3834f08e9357513c100ed981c
```

---

## Deployment

### Vercel Deployment

1. **Connect Repository**:
   - Link GitHub repository to Vercel
   - Auto-deploy on push to main

2. **Set Environment Variables**:
   - Add all required variables in Vercel dashboard
   - Settings → Environment Variables

3. **Cron Job Configuration**:
   - Automatically configured via `vercel.json`
   - Runs daily at midnight UTC

4. **Database**:
   - MongoDB Atlas recommended
   - Configure IP allowlist for Vercel

5. **Domain**:
   - Add custom domain in Vercel
   - Update NEXTAUTH_URL

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your values
nano .env.local

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

---

## Testing

### Manual Testing Checklist

**User Flow**:
- [ ] Register new account
- [ ] Login with credentials
- [ ] Submit problem description
- [ ] Review triage results
- [ ] Answer follow-up questions
- [ ] Generate solution outline
- [ ] Export PDF
- [ ] Answer RFI from admin

**Admin Flow**:
- [ ] Login as admin
- [ ] View all problems
- [ ] Filter by kind, domain, status
- [ ] Change problem status
- [ ] Assign problem to admin
- [ ] Lock problem
- [ ] Edit triage classification
- [ ] Create RFI
- [ ] Close RFI
- [ ] View analytics dashboard
- [ ] Change date range in analytics

**Analytics**:
- [ ] Events logged correctly
- [ ] LLM usage captured
- [ ] Cron job runs successfully
- [ ] Dashboard shows accurate data
- [ ] Cost estimates correct

---

## Monitoring

### Key Metrics to Monitor

**Application Health**:
- API response times
- Error rates by endpoint
- Authentication failures
- Database connection issues

**Business Metrics**:
- New user signups
- Problems submitted per day
- Triage success rate
- Outline generation rate
- PDF downloads

**Cost Metrics**:
- Daily OpenAI API spend
- Cost per problem
- Token usage trends
- Cost by model

**User Engagement**:
- Active users per day
- Average time to complete flow
- RFI response time
- Admin response time

---

## Security

### Authentication
- NextAuth.js with credentials provider
- Bcrypt for password hashing
- Session-based authentication
- Secure password reset flow

### Authorization
- Role-based access control (user/admin)
- `requireAuth` middleware for protected routes
- `requireAdmin` middleware for admin routes
- Problem ownership validation

### Data Protection
- MongoDB indexes for performance
- Rate limiting on critical endpoints
- Input validation with Zod
- XSS protection via React
- CSRF protection via NextAuth

### API Security
- CRON_SECRET for cron endpoints
- No API keys in client code
- Secure environment variables
- HTTPS enforced in production

---

## Performance Optimization

### Database
- Proper indexing on all queries
- Compound indexes for common filters
- Aggregation pipeline optimization
- Connection pooling

### API
- Non-blocking analytics logging
- Efficient aggregation queries
- Minimal data transfer
- Caching where appropriate

### Frontend
- Code splitting
- Image optimization
- Lazy loading
- Minimal re-renders

---

## Support and Maintenance

### Common Issues

**Can't login**:
- Verify credentials
- Check NEXTAUTH_SECRET is set
- Clear browser cookies

**Analytics not showing**:
- Wait for cron job (midnight UTC)
- Manually trigger cron
- Check CRON_SECRET is set

**OpenAI errors**:
- Verify API key is valid
- Check rate limits
- Review error logs

**Email not sending**:
- Verify SendGrid/Resend API key
- Check email configuration
- Review email logs

### Getting Help

**Documentation**:
- Step 8: [STEP-8-ADMIN-RFIS.md](./STEP-8-ADMIN-RFIS.md)
- Step 9: [STEP-9-ANALYTICS.md](./STEP-9-ANALYTICS.md)

**Logs**:
- Vercel Logs: Dashboard → Logs
- MongoDB Atlas: Monitoring → Logs
- Application Logs: Check console output

---

## Roadmap

### Upcoming Features

**Phase 1 (Q1 2025)**:
- Email notifications for RFIs
- Slack integration for admin alerts
- Advanced filtering and search
- Bulk actions on problems

**Phase 2 (Q2 2025)**:
- Custom domains per customer
- White-label branding
- API for third-party integrations
- Mobile app (React Native)

**Phase 3 (Q3 2025)**:
- AI-powered insights
- Predictive analytics
- Automated testing
- Multi-language support

---

## Contributing

This is a proprietary project. For internal development:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Create pull request
5. Get review approval
6. Merge to main
7. Deploy to production

---

## License

Proprietary - All rights reserved

---

## Contact

For questions or support:
- Email: support@example.com
- Slack: #ai-tool-dashboard
- Issues: GitHub Issues (private repo)

---

**Last Updated**: October 13, 2025
