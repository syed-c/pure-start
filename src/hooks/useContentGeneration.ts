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

      const configValue = config?.value as Record<string, unknown> || {};
      const apiKey = configValue.api_key as string;
      
      if (!apiKey) {
        throw new Error('Gemini API not configured. Go to API Control to configure.');
      }

      const model = (configValue.model as string) || 'gemini-1.5-flash';
      
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
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 4096,
              temperature: 0.7,
            }
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to generate brief');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response');
      
      return JSON.parse(jsonMatch[0]);
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

      if (!config?.value?.api_key) {
        throw new Error('Gemini API not configured');
      }

      const locationInfo = params.location ? `Location: ${params.location}, UK. ` : '';
      const serviceInfo = params.service ? `Service: ${params.service}. ` : '';
      
      const prompt = `Generate high-quality, unique content for a UK fostering platform page.

Page Type: ${params.pageType}
Target Keyword: ${params.targetKeyword}
${locationInfo}${serviceInfo}Tone: ${params.tone}
Word Count: ${params.wordCount} words

${params.existingContent ? `Existing content to improve:\n${params.existingContent.substring(0, 2000)}\n\n` : ''}
${params.competitors?.length ? `Competitor analysis - do NOT copy, but note what topics they cover:\n${params.competitors.join('\n')}\n\n` : ''}

RULES:
- Write unique, helpful content for UK fostering applicants and foster carers
- Include local context for UK locations
- Follow Google E-E-A-T guidelines
- People-first content, not search-first
- No template or duplicate content
- No exaggerated claims about safeguarding
- Include factual UK fostering information
- Add helpful FAQs at the end
- Include trust signals

Return ONLY valid JSON:
{
  "content": "full HTML content with h2 sections",
  "metaTitle": "string (max 60 chars)",
  "metaDescription": "string (max 160 chars)",
  "faqs": [{"question": "string", "answer": "string"}]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.7,
            }
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to generate content');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response');
      
      return JSON.parse(jsonMatch[0]);
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

      if (!config?.value?.api_key) {
        throw new Error('Gemini API not configured');
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
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.5,
            }
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to optimize');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
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

      if (!config?.value?.api_key) {
        throw new Error('Gemini API not configured');
      }

      const prompt = `Analyze competitor content for gaps and opportunities. Do NOT copy content.

My Content: ${params.myContent.substring(0, 2000)}
Target Keyword: ${params.keyword}

Competitor URLs (analyze for gaps only, do NOT copy):
${params.competitorUrls.join('\n')}

Return ONLY valid JSON:
{
  "gaps": ["topicscompetitors cover that I'm missing"],
  "opportunities": ["content angles I can use"],
  "recommendations": ["specific actions to improve"]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.6,
            }
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to analyze competitors');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response');
      
      return JSON.parse(jsonMatch[0]);
    }
  });
}