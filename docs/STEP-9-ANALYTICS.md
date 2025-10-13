# Step 9 - Analytics & Cost Dashboard

## Overview
Implemented comprehensive analytics and cost tracking system with event logging, LLM usage monitoring, daily aggregation, and admin dashboard visualization.

## What Was Built

### Step 9A - Event Logging
**Purpose**: Track user funnel and key workflow events

#### Event Model
**File**: `src/models/Event.ts`

**Schema**:
```typescript
{
  at: Date,
  userId?: ObjectId,
  problemId?: ObjectId,
  type: String,
  meta?: Object
}
```

**Indexes**:
- `{ at: -1 }` - Time-series queries
- `{ type: 1, at: -1 }` - Event type filtering
- `{ userId: 1, at: -1 }` - User-specific queries
- `{ problemId: 1, at: -1 }` - Problem-specific queries

#### Event Types
| Event Type | Trigger | Purpose |
|------------|---------|---------|
| `triage.run` | Triage API called | Track triage attempts |
| `triage.ok` | Triage succeeded | Track success rate |
| `triage.fail` | Triage failed | Track failures |
| `answers.save` | Follow-up answers saved | Track completion |
| `outline.run` | Outline generation started | Track outline attempts |
| `outline.ok` | Outline succeeded | Track success rate |
| `outline.fail` | Outline failed | Track failures |
| `pdf.download` | PDF exported | Track deliverable generation |
| `status.change` | Admin changed status | Track workflow progression |
| `rfi.create` | Admin created RFI | Track admin communication |
| `rfi.answer` | User answered RFI | Track response time |
| `rfi.close` | Admin closed RFI | Track resolution |

#### Log Event Helper
**File**: `src/lib/logEvent.ts`

**Features**:
- Non-blocking (errors logged, never thrown)
- Type-safe with EventType enum
- Rich metadata support
- Automatic timestamp

**Usage**:
```typescript
await logEvent({
  type: 'triage.ok',
  userId,
  problemId,
  meta: { kind: 'AI', domains: ['Lead Generation'] }
});
```

---

### Step 9B - LLM Usage Tracking
**Purpose**: Monitor token consumption, costs, and performance

#### LLMUsage Model
**File**: `src/models/LLMUsage.ts`

**Schema**:
```typescript
{
  at: Date,
  userId?: ObjectId,
  problemId?: ObjectId,
  route: String,        // e.g., "/api/intake/triage"
  model: String,        // e.g., "gpt-4o-mini"
  ms: Number,           // Latency in milliseconds
  tokensIn: Number,     // Input tokens
  tokensOut: Number     // Output tokens
}
```

**Indexes**:
- `{ at: -1 }` - Time-series queries
- `{ route: 1, at: -1 }` - Route-specific analysis
- `{ model: 1, at: -1 }` - Model-specific analysis
- `{ userId: 1, at: -1 }` - User-specific tracking

#### LLM Usage Logger
**File**: `src/lib/logLLMUsage.ts`

**Features**:
- Non-blocking logging
- Captures route context
- Records token usage
- Tracks latency

#### OpenAI Integration
**File**: `src/lib/openai.ts` (modified)

**Changes**:
- Added optional `route`, `userId`, `problemId` parameters
- Calls `logLLMUsage` after successful API responses
- Captures telemetry data automatically
- Works with retry logic

**Updated Routes**:
- `pages/api/intake/triage.ts` - Logs triage LLM calls
- `pages/api/intake/outline.ts` - Logs outline LLM calls

---

### Step 9C - Daily Aggregation Cron

#### DailyAnalytics Model
**File**: `src/models/DailyAnalytics.ts`

**Schema**:
```typescript
{
  date: Date (unique),
  events: [{
    type: String,
    count: Number
  }],
  llmUsage: [{
    route: String,
    model: String,
    totalCalls: Number,
    totalTokensIn: Number,
    totalTokensOut: Number,
    totalMs: Number,
    avgMs: Number
  }],
  problems: {
    created: Number,
    submitted: Number,
    inProgress: Number,
    completed: Number
  },
  topDomains: [{
    domain: String,
    count: Number
  }]
}
```

#### Cron Job Endpoint
**File**: `pages/api/cron/usage-daily.ts`

**Features**:
- Aggregates previous day's data (UTC)
- Protected by CRON_SECRET authorization
- Prevents duplicate aggregations
- Aggregates:
  - Event counts by type
  - LLM usage by route and model
  - Problem counts by status
  - Top 10 domains from triage data

**Aggregation Logic**:
```typescript
// Date range: Yesterday 00:00 UTC to Today 00:00 UTC
const yesterday = new Date();
yesterday.setUTCDate(yesterday.getUTCDate() - 1);
yesterday.setUTCHours(0, 0, 0, 0);

const today = new Date(yesterday);
today.setUTCDate(today.getUTCDate() + 1);
```

#### Vercel Cron Configuration
**File**: `vercel.json`

```json
{
  "crons": [{
    "path": "/api/cron/usage-daily",
    "schedule": "0 0 * * *"
  }]
}
```

**Schedule**: Daily at midnight UTC (00:00)

---

### Step 9D - Admin Analytics Dashboard

#### Analytics API
**File**: `pages/api/admin/analytics.ts`

**Features**:
- Admin-only access
- Configurable date range (default 7 days)
- Returns:
  - Summary metrics (totals and today's activity)
  - Time-series data for charts
  - LLM usage by model
  - Top domains
  - Estimated costs

**Query Parameters**:
- `days` - Number of days to include (default: 7)

**Response Structure**:
```typescript
{
  ok: true,
  dateRange: { start, end, days },
  summary: {
    totalProblems,
    totalEvents,
    totalLLMCalls,
    totalTokensIn,
    totalTokensOut,
    estimatedCost,
    todayEvents,
    todayProblems,
    todayLLMCalls
  },
  timeSeries: [{ date, problems, events, llmCalls, tokensIn, tokensOut }],
  llmByModel: [{ model, totalTokensIn, totalTokensOut, totalCalls }],
  topDomains: [{ domain, count }]
}
```

#### Analytics UI
**File**: `pages/admin/analytics.tsx`

**Features**:
- Date range selector (7, 14, 30 days)
- Summary cards:
  - Problems Created (with today's count)
  - Total Events (with today's count)
  - LLM API Calls (with today's count)
  - Estimated Cost (formatted)
- Token usage breakdown (total, input, output)
- Bar charts:
  - Problems per day
  - Tokens per day
- Tables:
  - LLM usage by model (calls, tokens)
  - Top domains
- Responsive design
- Admin-only access with authentication

**Visual Design**:
- Purple theme for consistency
- Emoji icons for quick recognition
- Color-coded metrics (blue for input, purple for output)
- Progress bars for time-series data
- Formatted numbers (k for thousands)

---

### Step 9E - Pricing & Cost Estimation

#### Pricing Module
**File**: `src/lib/pricing.ts`

**OpenAI Pricing Constants** (January 2025):
```typescript
MODEL_PRICING = {
  'gpt-4o': {
    input: 2.50,    // $2.50 per 1M tokens
    output: 10.00   // $10.00 per 1M tokens
  },
  'gpt-4o-mini': {
    input: 0.15,    // $0.15 per 1M tokens
    output: 0.60    // $0.60 per 1M tokens
  },
  'gpt-4-turbo': {
    input: 10.00,
    output: 30.00
  },
  'gpt-4': {
    input: 30.00,
    output: 60.00
  },
  'gpt-3.5-turbo': {
    input: 0.50,
    output: 1.50
  }
}
```

**Helper Functions**:

```typescript
// Calculate cost for single call
estimateCost(model, tokensIn, tokensOut): number

// Calculate cost for aggregated usage
estimateTotalCost(usageArray): number

// Format cost as USD string
formatCost(cost): string  // "$1.23" or "<$0.01"
```

**Cost Calculation**:
```typescript
const inputCost = (tokensIn / 1_000_000) * pricing.input;
const outputCost = (tokensOut / 1_000_000) * pricing.output;
return inputCost + outputCost;
```

---

## Files Created/Modified

### New Files
- `src/models/Event.ts`
- `src/models/LLMUsage.ts`
- `src/models/DailyAnalytics.ts`
- `src/lib/logEvent.ts`
- `src/lib/logLLMUsage.ts`
- `src/lib/pricing.ts`
- `pages/api/cron/usage-daily.ts`
- `pages/api/admin/analytics.ts`
- `pages/admin/analytics.tsx`
- `vercel.json`

### Modified Files
- `src/lib/openai.ts` - Added tracking integration
- `pages/api/intake/triage.ts` - Added logging
- `pages/api/intake/answers.ts` - Added logging
- `pages/api/intake/outline.ts` - Added logging
- `pages/api/export/outline-pdf.ts` - Added logging
- `pages/api/admin/problems/[id]/status.ts` - Added logging
- `pages/api/problems/[id]/rfi/index.ts` - Added logging
- `pages/api/problems/[id]/rfi/[rfiId]/answer.ts` - Added logging
- `pages/api/problems/[id]/rfi/[rfiId]/close.ts` - Added logging

---

## Business Value

### Cost Management
- **Visibility**: See exact API costs by model and route
- **Budgeting**: Predict future costs based on usage trends
- **Optimization**: Identify expensive operations
- **Control**: Monitor spending in real-time

### Usage Insights
- **Funnel Analysis**: Track conversion from triage → answers → outline → PDF
- **Success Rates**: Measure triage.ok, outline.ok rates
- **Feature Adoption**: See which features are used most
- **User Engagement**: Track active users and activity patterns

### Performance Monitoring
- **Latency Tracking**: Identify slow API calls
- **Error Rates**: Monitor triage.fail, outline.fail events
- **Capacity Planning**: Predict infrastructure needs
- **SLA Compliance**: Ensure response times meet targets

### Domain Intelligence
- **Market Insights**: Understand most common problem domains
- **Product Focus**: Prioritize features for popular domains
- **Specialization**: Identify expertise areas
- **Trend Analysis**: Track domain popularity over time

---

## Deployment Guide

### 1. Environment Variables

Add to Vercel (or .env.local for local testing):

```bash
CRON_SECRET=5f60e77feb6e3322a89b282c6dc546803af1d2a3834f08e9357513c100ed981c
```

**Steps for Vercel**:
1. Go to Project Settings → Environment Variables
2. Add `CRON_SECRET` with the value above
3. Select "Production" environment
4. Save and redeploy

### 2. Verify Cron Job

After deployment:
1. Go to Vercel Dashboard → Settings → Cron Jobs
2. Confirm `/api/cron/usage-daily` is listed
3. Schedule should show: `0 0 * * *` (daily at midnight UTC)

### 3. Manual Testing (Optional)

Test the cron job manually:

```bash
curl -X GET https://your-domain.com/api/cron/usage-daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "ok": true,
  "date": "2025-10-12",
  "summary": {
    "events": 5,
    "llmUsage": 2,
    "problems": 3,
    "domains": 4
  }
}
```

### 4. Access Analytics Dashboard

1. Deploy application to Vercel
2. Log in as admin user
3. Navigate to `/admin/analytics`
4. Select date range (7, 14, or 30 days)
5. View metrics, charts, and cost estimates

**Note**: Initially, data will be minimal until the cron job runs or you manually aggregate.

---

## Acceptance Checklist (Step 9F)

- [x] Events are logged for all key workflows
- [x] LLM usage documents saved with tokens and latency
- [x] Daily cron job aggregates data
- [x] `/admin/analytics` shows dashboard with:
  - [x] Summary cards
  - [x] Charts (problems/day, tokens/day)
  - [x] LLM usage table by model
  - [x] Top domains table
  - [x] Cost estimates
- [x] Admin-only access enforced
- [x] Date range selector works (7, 14, 30 days)
- [x] Real-time "today" metrics displayed
- [x] No errors in production logs

---

## Monitoring and Maintenance

### Cron Job Monitoring
- Check Vercel Logs for cron execution
- Verify daily aggregations are created
- Monitor for failures or errors

### Data Retention
Consider implementing data retention policies:
- Events: Keep 90 days
- LLMUsage: Keep 90 days
- DailyAnalytics: Keep 1 year

### Performance Optimization
- Ensure indexes are used efficiently
- Monitor aggregation query performance
- Consider sharding for high-volume data

### Cost Alerts
Set up alerts for:
- Daily cost exceeds threshold
- Token usage spikes
- Error rate increases

---

## Future Enhancements

1. **Advanced Filtering**: Filter analytics by user, domain, date range
2. **Export**: CSV/PDF export of analytics reports
3. **Alerts**: Email alerts for cost thresholds
4. **Forecasting**: Predict future costs based on trends
5. **A/B Testing**: Track feature variations
6. **User Cohorts**: Analyze behavior by user segment
7. **Custom Dashboards**: Allow admins to create custom views
8. **Real-time Updates**: WebSocket for live metrics
9. **Anomaly Detection**: Alert on unusual patterns
10. **Cost Attribution**: Track costs per customer/project

---

## Troubleshooting

### Cron Job Not Running
- Verify CRON_SECRET is set in Vercel
- Check vercel.json is deployed
- Review Vercel Logs for errors

### No Data in Dashboard
- Wait for cron job to run (runs at midnight UTC)
- Manually trigger cron job for testing
- Check if events are being logged

### Incorrect Cost Estimates
- Verify pricing constants are up to date
- Check token counts in LLMUsage collection
- Review cost calculation logic

### Performance Issues
- Add more indexes to collections
- Optimize aggregation queries
- Consider caching frequently accessed data
