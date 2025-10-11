interface CallOpenAIJSONParams {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

interface OpenAITelemetry {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  retried: boolean;
}

interface CallOpenAIJSONResult {
  data: any;
  telemetry: OpenAITelemetry;
}

export async function callOpenAIJSON({
  model,
  system,
  user,
  maxTokens = 1000,
  temperature = 0.3,
}: CallOpenAIJSONParams): Promise<CallOpenAIJSONResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const startTime = Date.now();
  let totalTokens = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  let retried = false;

  const makeRequest = async (messages: Array<{ role: string; content: string }>) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: 'json_object' },
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Extract usage data
    if (data.usage) {
      promptTokens = data.usage.prompt_tokens || 0;
      completionTokens = data.usage.completion_tokens || 0;
      totalTokens = data.usage.total_tokens || 0;
    }

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return content;
  };

  try {
    // First attempt
    const content = await makeRequest([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]);

    const latencyMs = Date.now() - startTime;
    const parsed = JSON.parse(content);

    return {
      data: parsed,
      telemetry: {
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        latencyMs,
        retried: false,
      },
    };
  } catch (parseError) {
    // Retry with fix instruction
    try {
      console.warn('JSON parse failed, retrying with fix instruction');
      retried = true;
      const fixedContent = await makeRequest([
        { role: 'system', content: system },
        { role: 'user', content: user },
        {
          role: 'assistant',
          content: String(parseError instanceof Error ? parseError.message : parseError),
        },
        { role: 'user', content: 'Fix the response to be valid JSON only. No prose, just JSON.' },
      ]);

      const latencyMs = Date.now() - startTime;
      const parsed = JSON.parse(fixedContent);

      return {
        data: parsed,
        telemetry: {
          model,
          promptTokens,
          completionTokens,
          totalTokens,
          latencyMs,
          retried: true,
        },
      };
    } catch (retryError) {
      console.error('OpenAI JSON parse error after retry:', retryError);
      throw new Error('Failed to get valid JSON from OpenAI after retry');
    }
  }
}
