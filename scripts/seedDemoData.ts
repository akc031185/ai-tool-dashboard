import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investoraiclub';

const demoUserData = {
  email: 'demo@investoraiclub.com',
  password: 'Demo123!',
  name: 'Demo User',
};

const demoProblemData = [
  {
    rawDescription: 'I need to automatically categorize incoming tenant maintenance requests by urgency level and route them to the appropriate contractor based on the issue type (plumbing, electrical, HVAC, etc.)',
    status: 'complete',
    triage: {
      kind: ['AI', 'Automation'],
      kind_scores: { AI: 0.8, Automation: 0.9, Hybrid: 0.85 },
      domains: [
        { label: 'Property Management', score: 0.95 },
        { label: 'Tenant Communication', score: 0.7 }
      ],
      subdomains: [
        { label: 'Maintenance Requests', score: 0.9 },
        { label: 'Work Order Management', score: 0.8 }
      ],
      other_tags: ['Natural Language Processing', 'Classification', 'Routing'],
      needs_more_info: false,
      missing_info: [],
      risk_flags: [],
      notes: 'Straightforward AI classification task with automation routing'
    },
    followUps: [
      {
        question: 'What volume of maintenance requests do you receive per month?',
        answer: 'Around 200-300 requests per month across 50 properties',
        required: true
      },
      {
        question: 'What categories/types of maintenance issues do you need to classify?',
        answer: 'Plumbing, electrical, HVAC, appliances, landscaping, pest control, general repairs',
        required: true
      },
      {
        question: 'How do you currently receive these requests (email, portal, phone)?',
        answer: 'Mix of email and tenant portal submissions',
        required: true
      }
    ],
    solutionOutline: JSON.stringify({
      summary: 'Build an AI-powered maintenance request classifier that analyzes incoming requests, assigns urgency levels (emergency, high, medium, low), and automatically routes to appropriate contractor categories. Integration with existing tenant portal and email system.',
      requirements: [
        'Natural language processing to extract issue type from text descriptions',
        'Multi-class classification for urgency levels (emergency/high/medium/low)',
        'Multi-label classification for issue categories (plumbing/electrical/HVAC/etc)',
        'Email parsing for requests received via email',
        'Portal API integration for direct submissions',
        'Automated notification system to contractors',
        'Dashboard for property managers to review and override classifications',
        'Historical data logging for model improvement'
      ],
      computePlan: {
        estimatedCost: '$80-120/month for 300 requests (GPT-4o-mini)',
        modelChoice: 'GPT-4o-mini for classification tasks, structured output mode',
        apiCalls: '1-2 API calls per request (classification + routing)',
        reasoning: 'GPT-4o-mini is cost-effective for classification tasks and provides excellent accuracy. At 300 requests/month with 2 API calls each = 600 calls. Cost approximately $0.15-0.20 per 1K tokens, estimated 200 tokens per request = $18-24 in API costs. Add buffer for retries and edge cases.'
      },
      mermaidDiagram: `flowchart TD
    A[Maintenance Request] --> B{Source?}
    B -->|Email| C[Parse Email]
    B -->|Portal| D[Extract Portal Data]
    C --> E[GPT-4o-mini Classifier]
    D --> E
    E --> F{Issue Type}
    F -->|Plumbing| G[Route to Plumbers]
    F -->|Electrical| H[Route to Electricians]
    F -->|HVAC| I[Route to HVAC Techs]
    F -->|Other| J[Route to General Contractors]
    E --> K{Urgency Level}
    K -->|Emergency| L[Immediate Notification]
    K -->|High| M[Priority Queue]
    K -->|Medium/Low| N[Standard Queue]
    G --> O[Manager Dashboard]
    H --> O
    I --> O
    J --> O
    L --> O
    M --> O
    N --> O`,
      nextActions: [
        'Set up email forwarding or API webhooks for tenant portal',
        'Create classification prompt templates and test with sample requests',
        'Build contractor routing logic and notification system',
        'Develop property manager review dashboard',
        'Pilot with 1-2 properties for initial testing and refinement'
      ]
    })
  },
  {
    rawDescription: 'Automate the process of screening potential tenants by analyzing their rental applications, credit reports, and employment verification documents to flag high-risk applicants.',
    status: 'in-progress',
    triage: {
      kind: ['AI', 'Automation'],
      kind_scores: { AI: 0.85, Automation: 0.8, Hybrid: 0.9 },
      domains: [
        { label: 'Tenant Screening', score: 0.95 },
        { label: 'Risk Assessment', score: 0.85 }
      ],
      subdomains: [
        { label: 'Application Review', score: 0.9 },
        { label: 'Document Analysis', score: 0.8 }
      ],
      other_tags: ['Document Processing', 'Risk Scoring', 'Compliance'],
      needs_more_info: false,
      missing_info: [],
      risk_flags: ['Fair Housing compliance required', 'Must avoid discriminatory criteria'],
      notes: 'Critical to ensure Fair Housing Act compliance in all screening criteria'
    },
    followUps: [
      {
        question: 'What specific criteria do you use to evaluate tenant applications?',
        answer: 'Credit score minimum 620, income 3x rent, no evictions in past 5 years, employment verification, references',
        required: true
      },
      {
        question: 'How many applications do you process per month?',
        answer: 'About 50-80 applications per month',
        required: true
      },
      {
        question: 'What format are the documents in (PDF, images, physical)?',
        answer: 'Mostly PDFs and some scanned documents',
        required: true
      }
    ],
    solutionOutline: JSON.stringify({
      summary: 'Create an automated tenant screening system that extracts data from application documents, applies objective screening criteria, generates risk scores, and flags applications for manual review. Ensures Fair Housing compliance with documented, non-discriminatory criteria.',
      requirements: [
        'PDF and image document parsing (OCR for scanned documents)',
        'Structured data extraction from applications, credit reports, pay stubs',
        'Automated criteria checking (credit score, income ratio, eviction history)',
        'Risk scoring algorithm based on weighted criteria',
        'Fair Housing compliance checks and audit trail',
        'Flagging system for manual review of edge cases',
        'Integration with background check APIs',
        'Applicant notification system',
        'Compliance reporting and documentation'
      ],
      computePlan: {
        estimatedCost: '$60-100/month for 80 applications (GPT-4o for document parsing)',
        modelChoice: 'GPT-4o with vision for document parsing, GPT-4o-mini for risk analysis',
        apiCalls: '3-5 API calls per application (parse docs, extract data, risk assessment)',
        reasoning: 'GPT-4o needed for accurate document parsing with vision capabilities. At 80 applications with 4 API calls average = 320 calls/month. Document parsing is token-intensive (~1000 tokens per doc). Estimated $50-80 in API costs plus buffer.'
      },
      mermaidDiagram: `flowchart TD
    A[Application Submitted] --> B[Document Upload]
    B --> C{Document Type?}
    C -->|Application| D[GPT-4o Parse Application]
    C -->|Credit Report| E[GPT-4o Parse Credit]
    C -->|Pay Stub| F[GPT-4o Parse Income]
    D --> G[Extract Structured Data]
    E --> G
    F --> G
    G --> H[Apply Screening Criteria]
    H --> I{Credit Score Check}
    I -->|Pass| J[Income Ratio Check]
    I -->|Fail| K[Auto-Reject Flag]
    J -->|Pass| L[Eviction History Check]
    J -->|Fail| K
    L -->|Pass| M[Calculate Risk Score]
    L -->|Fail| K
    M --> N{Risk Level}
    N -->|Low| O[Auto-Approve Queue]
    N -->|Medium| P[Manual Review Queue]
    N -->|High| Q[Reject with Reasons]
    O --> R[Manager Dashboard]
    P --> R
    Q --> R
    K --> R`,
      nextActions: [
        'Define complete Fair Housing compliant screening criteria',
        'Test document parsing with sample applications',
        'Build risk scoring algorithm and validate against historical data',
        'Create manager review interface',
        'Legal review of automated criteria and rejection language'
      ]
    })
  },
  {
    rawDescription: 'Create a system that automatically generates market rent estimates for my properties by analyzing comparable listings in the area, recent lease transactions, and local market trends.',
    status: 'draft',
    triage: {
      kind: ['AI', 'Automation'],
      kind_scores: { AI: 0.75, Automation: 0.85, Hybrid: 0.8 },
      domains: [
        { label: 'Market Analysis', score: 0.9 },
        { label: 'Pricing Strategy', score: 0.85 }
      ],
      subdomains: [
        { label: 'Comp Analysis', score: 0.9 },
        { label: 'Rent Optimization', score: 0.75 }
      ],
      other_tags: ['Data Aggregation', 'Price Modeling', 'Market Research'],
      needs_more_info: false,
      missing_info: [],
      risk_flags: [],
      notes: 'Requires access to market data sources (MLS, Zillow API, etc.)'
    },
    followUps: [
      {
        question: 'How many properties do you need to analyze on a regular basis?',
        answer: '25 rental units across 3 different neighborhoods',
        required: true
      },
      {
        question: 'How frequently do you need updated rent estimates?',
        answer: 'Monthly for active listings, quarterly for occupied units',
        required: true
      },
      {
        question: 'What data sources do you currently use for comps?',
        answer: 'Zillow, Craigslist, and local MLS when I can access it',
        required: true
      },
      {
        question: 'What property attributes affect your rent pricing?',
        answer: 'Square footage, bedrooms, bathrooms, parking, amenities, renovations, school district',
        required: false
      }
    ],
    solutionOutline: null
  }
];

async function seedDemoData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Import models
    const User = (await import('../src/models/User')).default;
    const Problem = (await import('../src/models/Problem')).default;

    // Check if demo user exists
    let demoUser = await User.findOne({ email: demoUserData.email });

    if (!demoUser) {
      console.log('Creating demo user...');
      const hashedPassword = await bcrypt.hash(demoUserData.password, 10);
      demoUser = await User.create({
        email: demoUserData.email,
        passwordHash: hashedPassword,
        name: demoUserData.name,
      });
      console.log('Demo user created:', demoUser.email);
    } else {
      console.log('Demo user already exists:', demoUser.email);
    }

    // Clear existing demo problems
    console.log('Clearing existing demo problems...');
    await Problem.deleteMany({ userId: demoUser._id });

    // Create demo problems
    console.log('Creating demo problems...');
    for (const problemData of demoProblemData) {
      const problem = await Problem.create({
        ...problemData,
        userId: demoUser._id,
      });
      console.log(`Created problem: ${problem.rawDescription.substring(0, 50)}... [${problem.status}]`);
    }

    console.log('\n✅ Demo data seeded successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('Email:', demoUserData.email);
    console.log('Password:', demoUserData.password);
    console.log('\nYou can now log in and test the features at http://localhost:3001');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDemoData();
