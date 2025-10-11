import { z } from 'zod';

export const TriageSchema = z.object({
  kind: z.array(z.string()),
  kind_scores: z.object({
    AI: z.number(),
    Automation: z.number(),
    Hybrid: z.number()
  }),
  domains: z.array(z.object({
    label: z.string(),
    score: z.number()
  })),
  subdomains: z.array(z.object({
    label: z.string(),
    score: z.number()
  })),
  other_tags: z.array(z.string()),
  needs_more_info: z.boolean(),
  missing_info: z.array(z.string()),
  risk_flags: z.array(z.string()),
  notes: z.string().optional().default('')
});

export const OutlineSchema = z.object({
  summary: z.string(),
  requirements: z.array(z.string()),
  computePlan: z.object({
    estimatedCost: z.string(),
    modelChoice: z.string(),
    apiCalls: z.string(),
    reasoning: z.string()
  }),
  mermaidDiagram: z.string(),
  nextActions: z.array(z.string())
});

export type Triage = z.infer<typeof TriageSchema>;
export type Outline = z.infer<typeof OutlineSchema>;
