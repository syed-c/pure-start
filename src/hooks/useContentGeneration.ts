import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const API_KEY = 'aimlapi';

interface ContentBriefParams {
  contentType: string;
  targetKeyword: string;
  location?: string;
  service?: string;
  contentDepth: string;
  searchIntent: string;
  competitorUrls?: string[];
}

interface ContentBrief {
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  h2Sections: { title: string; content: string }[];
  topics: string[];
  questions: string[];
  faqs: { question: string; answer: string }[];
  trustSignals: string[];
  internalLinks: string[];
  cta: string;
}

interface GenerateContentParams {
  pageId: string;
  pageType: string;
  targetKeyword: string;
  location?: string;
  service?: string;
  tone: string;
  wordCount: number;
  competitors?: string[];
  existingContent?: string;
}

interface OptimizeContentParams {
  pageId: string;
  focus: string[];
}

export function useGenerateContentBrief() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ContentBriefParams): Promise<ContentBrief> => {
      const { data: config } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', API_KEY)
        .single();

      if (!config?.value) {
        throw new Error('AIML API not configured. Go to API Control to add your AIML API key.');
      }

      const valueObj = typeof config.value === 'string' ? JSON.parse(config.value) : config.value as unknown;
      const apiKey = typeof valueObj === 'object' && valueObj ? (valueObj as Record<string, unknown>).api_key as string : '';
      const model = typeof valueObj === 'object' && valueObj ? (valueObj as Record<string, unknown>).model as string : 'gpt-4o-mini';
      
      if (!apiKey) {
        throw new Error('API key not found. Go to API Control to add your AIML API key.');
      }

      const locationContext = params.location ? ` for ${params.location}, UK` : '';
      const serviceContext = params.service ? ` about ${params.service}` : '';
      
      const prompt = `Generate a detailed content brief for a UK fostering platform page.

Page Type: ${params.contentType}
Target Keyword: ${params.targetKeyword}${locationContext}${serviceContext}
Content Depth: ${params.contentDepth}
Search Intent: ${params.searchIntent}
${params.competitorUrls?.length ? `Competitor URLs:\n${params.competitorUrls.join('\n')}` : ''}

Return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "metaTitle": "string (max 60 chars)",
  "metaDescription": "string (max 160 chars)", 
  "h1": "string",
  "h2Sections": [{"title": "string", "content": "string"}],
  "topics": ["string"],
  "questions": ["string"],
  "faqs": [{"question": "string", "answer": "string"}],
  "trustSignals": ["string"],
  "internalLinks": ["/url"],
  "cta": "string"
}`;

      const response = await fetch(
        `https://api.aimlapi.com/v1/chat/completions`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: `You are an expert UK fostering content writer. Return ONLY valid JSON.` },
              { role: 'user', content: prompt }
            ],
            max_tokens: 4096,
            temperature: 0.7,
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to generate brief');
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || '';
      
      // Try to extract JSON from response
      if (!text) {
        throw new Error('Empty AI response');
      }
      
      // Try to find JSON in the response
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try array format
        jsonMatch = text.match(/\[[\s\S]*\]/);
      }
      if (!jsonMatch) {
        console.error('Unable to parse AI response:', text);
        throw new Error('Could not parse AI response. The model may have returned invalid JSON.');
      }
      
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('JSON parse error:', jsonMatch[0]);
        throw new Error('Invalid JSON in AI response');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-briefs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useGenerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GenerateContentParams): Promise<{ content: string; metaTitle: string; metaDescription: string; faqs: any[] }> => {
      const { data: config } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', API_KEY)
        .single();

      const valueObj = config?.value as unknown;
      const apiKey = typeof valueObj === 'object' && valueObj ? (valueObj as Record<string, unknown>).api_key as string : '';
      const model = typeof valueObj === 'object' && valueObj ? (valueObj as Record<string, unknown>).model as string : 'gpt-4o-mini';

      if (!apiKey) {
        throw new Error('AIML API not configured. Go to API Control to add your AIML API key.');
      }

      const locationInfo = params.location ? `Location: ${params.location}, UK. ` : '';
      const serviceInfo = params.service ? `Service: ${params.service}. ` : '';
      
      const wordTarget = params.wordCount >= 1200 ? 'long-form' : params.wordCount >= 700 ? 'standard' : 'concise';
      
      const prompt = `Generate high-quality, unique, web-optimised content for a UK fostering directory platform page. The content must follow a proper heading hierarchy (H1 → H2 → H3) and use short, scannable paragraphs (max 3-4 sentences each).

PLATFORM CONTEXT:
- This is "Foster Care UK" (foster-care.co.uk), a UK fostering directory connecting prospective foster carers with fostering agencies
- Audience: UK residents interested in becoming foster carers, looking for agencies in their local area
- The platform covers all UK nations: England, Scotland, Wales, Northern Ireland

Page Type: ${params.pageType}
Target Keyword: ${params.targetKeyword}
${locationInfo}${serviceInfo}Tone: ${params.tone}
Target Length: ${params.wordCount} words (${wordTarget} format)

${params.existingContent ? `Existing content to improve/expand:\n${params.existingContent.substring(0, 2000)}\n\n` : ''}
${params.competitors?.length ? `Competitor analysis — do NOT copy, but understand what topics they cover:\n${params.competitors.join('\n')}\n\n` : ''}

CONTENT STRUCTURE REQUIREMENTS:
- <h2> headings for each major section (NOT H1 — H1 is rendered separately in the page hero)
- Short paragraphs: MAXIMUM 3-4 sentences each. Never write a paragraph longer than 4 sentences.
- Use <ul> with <li> for any list of items, features, or steps
- Use <p> for paragraphs
- Break up text with frequent headings. A wall of text without a heading for more than 200 words is not allowed.
- 5-7 H2 sections minimum, plus the FAQ

REQUIRED SECTIONS (in order):
1. Introduction (2-3 short paragraphs, 80-120 words total — hook the reader)
2. "Why Choose a Fostering Agency in [Location]?" — 2-3 short paragraphs + bullet points for key benefits
3. "Types of Fostering Available" — list fostering types as <ul> with short <li> descriptions
4. "The Fostering Assessment Process" — use a numbered step list (<ol>) with brief explanations
5. "Fostering Allowances and Financial Support" — present rates in short paragraphs + bullet points for breakdown
6. "How to Find the Right Agency" — bullet point checklist format
7. FAQ section with 5-7 questions (render each as <h3> heading + <p> answer)

WRITING RULES:
- MAXIMUM paragraph length: 4 sentences. Never more.
- Use <ul> or <ol> for ANY listing of 2+ items
- Every H2 section must be at least 2 paragraphs OR 1 paragraph + a list
- No two consecutive sections without a heading between them
- Write unique, location-specific content for UK fostering applicants
- Include specific local context (mention city landmarks, regional fostering stats where applicable)
- Follow Google E-E-A-T guidelines (experience, expertise, authoritativeness, trustworthiness)
- People-first content, not search-first
- Absolutely NO template phrases like "If you're looking for..." or "When it comes to..." — vary your sentence openings
- No exaggerated claims about safeguarding or fostering outcomes
- Include factual UK fostering information (fostering allowance rates, assessment process, Ofsted inspection criteria)
- Make every page feel hand-written for that specific location — use specific local details
- Use varied sentence structure throughout — avoid repetitive patterns
- Each paragraph must have a distinct angle — do not repeat the same idea across multiple paragraphs

ANTI-DUPLICATION RULES:
- This content will be compared against other pages. Every paragraph must contain at least one sentence that is unique to this location/topic.
- Do NOT start paragraphs with the same phrase across different sections (vary: "In...", "Across...", "For...", "Carers in...", "Prospective foster parents...", etc.)
- Do NOT use the same sentence structure or cadence across multiple pages
- Do NOT use the phrase "Whether you're" or "When it comes to" — find fresh openings
- Each list item must be genuinely informative, not generic filler

Return ONLY valid JSON with NO text before or after:
{
  "content": "full HTML content with h2 sections, short paragraphs, lists, minimum ${params.wordCount} words. Each section must have a heading.",
  "metaTitle": "string (max 60 chars, include location and keyword)",
  "metaDescription": "string (max 160 chars, compelling with location context, not starting with 'Find' or 'Discover')",
  "faqs": [{"question": "string (natural question, not keyword-stuffed)", "answer": "string (2-4 sentences max)"}]
}

IMPORTANT: The content field must contain AT LEAST ${params.wordCount} words. Count words before returning. If short, add more detailed paragraphs with specific local information. Short paragraphs are OK — they improve readability. NEVER repeat the same section heading pattern across different pages.
`;

      const response = await fetch(
        `https://api.aimlapi.com/v1/chat/completions`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: `You are an expert UK fostering content writer. Your response must be ONLY valid JSON - no explanations, no markdown, no text before or after. Start with { and end with }.` },
              { role: 'user', content: prompt }
            ],
            max_tokens: 16384,
            temperature: 0.7,
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('API error:', errText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || '';
      
      if (!text) {
        throw new Error('Empty AI response');
      }
      
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        jsonMatch = text.match(/\[[\s\S]*\]/);
      }
      if (!jsonMatch) {
        console.error('Parse error, response:', text);
        throw new Error('Could not parse AI response');
      }
      
      try {
        const result = JSON.parse(jsonMatch[0]);
        return result;
      } catch (e) {
        console.error('JSON error:', jsonMatch[0]);
        throw new Error('Invalid JSON from AI');
      }
    },
    onSuccess: (data, params) => {
      queryClient.invalidateQueries({ queryKey: ['seo-pages'] });
      toast.success('Content generated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useOptimizeContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: OptimizeContentParams & { content: string; title: string; metaTitle?: string; metaDescription?: string }): Promise<{ improvements: string[]; newContent?: string; newMetaTitle?: string; newMetaDescription?: string }> => {
      const { data: config } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', API_KEY)
        .single();

      const valueObj = typeof config?.value === 'string' ? JSON.parse(config?.value) : config?.value as unknown;
      const apiKey = typeof valueObj === 'object' && valueObj ? (valueObj as Record<string, unknown>).api_key as string : '';
      const model = typeof valueObj === 'object' && valueObj ? (valueObj as Record<string, unknown>).model as string : 'gpt-4o-mini';

      if (!apiKey) {
        throw new Error('AIML API not configured. Go to API Control to add your AIML API key.');
      }

      const focusList = params.focus.join(', ');
      
      const prompt = `Optimize this content for SEO and AI search readiness.

Current Title: ${params.title}
Current Meta Title: ${params.metaTitle || 'none'}
Current Meta Description: ${params.metaDescription || 'none'}
Current Content: ${params.content.substring(0, 3000)}

Focus areas: ${focusList}

Return ONLY valid JSON with improvements:
{
  "improvements": ["specific actionable improvement 1", "specific actionable improvement 2"],
  "newMetaTitle": "improved meta title (if needed)",
  "newMetaDescription": "improved meta description (if needed)"
}`;

      const response = await fetch(
        `https://api.aimlapi.com/v1/chat/completions`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
messages: [
              { role: 'system', content: `You are an expert UK fostering content writer. Your response must be ONLY valid JSON - no explanations, no markdown, no text before or after. Start with { and end with }.` },
              { role: 'user', content: prompt }
            ],
            max_tokens: 2048,
            temperature: 0.5,
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to optimize');
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text) throw new Error('Empty AI response');
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response');
      
      return JSON.parse(jsonMatch[0]);
    },
    onSuccess: () => {
      toast.success('Content optimized');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useAnalyzeCompetitors() {
  return useMutation({
    mutationFn: async (params: { myContent: string; competitorUrls: string[]; keyword: string }): Promise<{ gaps: string[]; opportunities: string[]; recommendations: string[] }> => {
      const { data: config } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', API_KEY)
        .single();

      const valueObj = typeof config?.value === 'string' ? JSON.parse(config?.value) : config?.value as unknown;
      const apiKey = typeof valueObj === 'object' && valueObj ? (valueObj as Record<string, unknown>).api_key as string : '';
      const model = typeof valueObj === 'object' && valueObj ? (valueObj as Record<string, unknown>).model as string : 'gpt-4o-mini';

      if (!apiKey) {
        throw new Error('AIML API not configured. Go to API Control to add your AIML API key.');
      }

      const prompt = `Analyze competitor content for gaps and opportunities. Do NOT copy content.

Platform Context: Pure Start is a UK fostering directory connecting prospective foster carers with fostering agencies.

My Content: ${params.myContent.substring(0, 2000)}
Target Keyword: ${params.keyword}

Competitor URLs (analyze for gaps only, do NOT copy):
${params.competitorUrls.join('\n')}

Return ONLY valid JSON:
{
  "gaps": ["topics competitors cover that I'm missing"],
  "opportunities": ["content angles I can use"],
  "recommendations": ["specific actionable steps to improve my content"]
}`;

      const response = await fetch(
        `https://api.aimlapi.com/v1/chat/completions`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: `You are an expert SEO competitor analyst for UK fostering platforms. Return ONLY valid JSON.` },
              { role: 'user', content: prompt }
            ],
            max_tokens: 2048,
            temperature: 0.6,
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to analyze competitors');
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text) throw new Error('Empty AI response');
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response');
      
      return JSON.parse(jsonMatch[0]);
    }
  });
}