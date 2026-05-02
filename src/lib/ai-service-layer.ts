/**
 * Unified AI Service Layer
 * Connects all AI features through a central API system
 * 
 * All AI features must use this service to ensure:
 * - Centralized API key management
 * - Consistent error handling
 * - Rate limiting
 * - Logging
 * - Security
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const API_TAB_CONFIG_KEY = 'gemini_api';

interface GeminiConfig {
  api_key: string;
  model: string;
  max_tokens: number;
  temperature: number;
  enabled: boolean;
}

interface AILogEntry {
  id?: string;
  feature: string;
  request: string;
  response?: string;
  duration_ms: number;
  status: 'success' | 'error';
  error?: string;
  created_at?: string;
}

// Get API configuration from global_settings
export function useGeminiConfig() {
  return useQuery({
    queryKey: ['gemini-config'],
    queryFn: async () => {
      const { data } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', API_TAB_CONFIG_KEY)
        .single();
      
      if (data?.value) {
        return data.value as unknown as GeminiConfig;
      }
      
      // Return default config
      return {
        api_key: '',
        model: 'gemini-1.5-flash',
        max_tokens: 2048,
        temperature: 0.7,
        enabled: false
      };
    }
  });
}

// Save API configuration
export function useSaveGeminiConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: GeminiConfig) => {
      const { data: existing } = await supabase
        .from('global_settings')
        .select('id')
        .eq('key', API_TAB_CONFIG_KEY)
        .single();
      
      if (existing?.id) {
        await supabase
          .from('global_settings')
          .update({ 
            value: config,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('global_settings')
          .insert([{ 
            key: API_TAB_CONFIG_KEY,
            value: config
          }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gemini-config'] });
    }
  });
}

// Test API connection
export async function testGeminiConnection(config: GeminiConfig): Promise<{
  success: boolean;
  responseTime: number;
  error?: string;
  response?: string;
}> {
  if (!config.api_key) {
    return { success: false, responseTime: 0, error: 'API key not configured' };
  }
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.api_key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "AI connection test successful" if you can understand this.' }] }],
          generationConfig: {
            maxOutputTokens: config.max_tokens || 2048,
            temperature: config.temperature || 0.7
          }
        })
      }
    );
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        responseTime,
        error: errorData.error?.message || `API error: ${response.status}` 
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      responseTime,
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Connection successful'
    };
  } catch (e: any) {
    return { 
      success: false, 
      responseTime: Date.now() - startTime,
      error: e.message 
    };
  }
}

// Centralized AI chat function
export async function callGeminiAI(
  prompt: string,
  context?: Record<string, unknown>
): Promise<{
  success: boolean;
  response?: string;
  error?: string;
}> {
  const config = await useGeminiConfig();
  
  if (!config.data?.enabled || !config.data?.api_key) {
    return { success: false, error: 'AI not configured or disabled' };
  }
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.data.model}:generateContent?key=${config.data.api_key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: context 
                ? `Context: ${JSON.stringify(context)}\n\nUser request: ${prompt}`
                : prompt 
            }] 
          }],
          generationConfig: {
            maxOutputTokens: config.data.max_tokens || 2048,
            temperature: config.data.temperature || 0.7
          }
        })
      }
    );
    
    const durationMs = Date.now() - startTime;
    
    // Log the request
    await logAIRequest({
      feature: 'gemini_chat',
      request: prompt,
      status: response.ok ? 'success' : 'error',
      duration_ms: durationMs
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.error?.message || `API error: ${response.status}` 
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    };
  } catch (e: any) {
    await logAIRequest({
      feature: 'gemini_chat',
      request: prompt,
      status: 'error',
      error: e.message,
      duration_ms: Date.now() - startTime
    });
    
    return { 
      success: false, 
      error: e.message 
    };
  }
}

// Log AI requests
async function logAIRequest(log: Omit<AILogEntry, 'id' | 'created_at'>) {
  try {
    await supabase
      .from('ai_events')
      .insert([{
        event_type: 'api_call',
        module: log.feature,
        triggered_by: 'system',
        status: log.status,
        context_data: { 
          request: log.request?.substring(0, 500),
          duration_ms: log.duration_ms,
          error: log.error
        }
      }]);
  } catch (e) {
    console.error('Failed to log AI request:', e);
  }
}

// Fetch AI logs for monitoring
export function useAILogs(limit = 50) {
  return useQuery({
    queryKey: ['ai-logs', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      return data || [];
    }
  });
}

// Process daily log with AI
export async function processDailyLogWithAI(
  rawNotes: string,
  childId: string,
  date: string
): Promise<{
  success: boolean;
  structured?: {
    mood: string;
    behaviour: string;
    action: string;
    outcome: string;
    summary: string;
  };
  error?: string;
}> {
  const result = await callGeminiAI(
    `Analyze this daily log from a foster placement and structure it. 
    Raw notes: "${rawNotes}"
    
    Extract and organize:
    - Mood/emotional state
    - Behaviour observations
    - Actions taken
    - Outcomes
    
    Important rules:
    - Do NOT invent facts not in the notes
    - Do NOT make medical diagnoses
    - Do NOT make safeguarding decisions
    - If unsure, say "not specified"
    
    Return structured JSON only with keys: mood, behaviour, action, outcome, summary`,
    { type: 'daily_log', childId, date }
  );
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  try {
    // Try to parse JSON from response
    const jsonMatch = result.response?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const structured = JSON.parse(jsonMatch);
      return { success: true, structured };
    }
    
    return { 
      success: false, 
      error: 'Could not parse AI response' 
    };
  } catch (e) {
    return { 
      success: false, 
      error: 'Failed to process response' 
    };
  }
}

// Process incident summary with AI
export async function processIncidentWithAI(
  reportData: Record<string, unknown>
): Promise<{
  success: boolean;
  summary?: string;
  keyPoints?: string[];
  requiresReview?: boolean;
  error?: string;
}> {
  const result = await callGeminiAI(
    `Summarize this incident report concisely.
    
    Incident data: ${JSON.stringify(reportData)}
    
    Provide:
    - A 1-2 sentence summary
    - Key points (array of 3-5 items)
    - Whether this "requires review" (true/false) based on severity
    
    Important:
    - Do NOT classify risk levels
    - Do NOT make decisions
    - Flag for review = true if involves injury, police, social worker notification, or unknown persons
    
    Return JSON with keys: summary, keyPoints, requiresReview`,
    { type: 'incident_report' }
  );
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  try {
    const jsonMatch = result.response?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch);
      return { 
        success: true, 
        summary: parsed.summary,
        keyPoints: parsed.keyPoints,
        requiresReview: parsed.requiresReview
      };
    }
    
    return { success: false, error: 'Could not parse response' };
  } catch (e) {
    return { success: false, error: 'Failed to process' };
  }
}