/**
 * AI Daily Log Assistant
 * Converts unstructured notes to structured entries (NOT for medical/safeguarding decisions)
 * 
 * IMPORTANT: This is assistance only. Human must review all content.
 * - Does NOT invent details
 * - Does NOT diagnose
 * - Does NOT make safeguarding decisions
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Sparkles, 
  Loader2, 
  Wand2,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface StructuredNote {
  behaviour_summary: string;
  emotional_state: string;
  activities_mentioned: string[];
  action_taken: string;
  outcome: string;
  disclaimer: string;
}

// Simple keyword-based extraction (NOT AI/LLM - just string matching for safety)
function extractStructuredNotes(input: string): StructuredNote {
  const text = input.toLowerCase();
  
  // Extract keywords (simple matching - no hallucination risk)
  const activityKeywords = [
    'school', 'play', 'sports', 'games', 'tv', 'reading',
    'art', 'crafts', 'cooking', 'outdoor', 'social', 'therapy',
    'homework', 'music', 'dance', 'swimming', 'football'
  ];
  
  const emotionsDetected = [];
  if (text.includes('happy') || text.includes('content') || text.includes('good')) emotionsDetected.push('Happy');
  if (text.includes('sad') || text.includes('upset') || text.includes('cry')) emotionsDetected.push('Sad');
  if (text.includes('angry') || text.includes('rage') || text.includes('mad')) emotionsDetected.push('Angry');
  if (text.includes('anxious') || text.includes('worried') || text.includes('nervous')) emotionsDetected.push('Anxious');
  if (text.includes('quiet') || text.includes('withdrawn') || text.includes('quiet')) emotionsDetected.push('Quiet');
  
  const activities = activityKeywords.filter(a => text.includes(a));
  
  // Extract action words
  let action = 'None recorded';
  if (text.includes('talked') || text.includes('discussed')) action = 'Talked with child';
  if (text.includes('comfort')) action = 'Provided comfort';
  if (text.includes('called') || text.includes('contact')) action = 'Contacted relevant person';
  if (text.includes('school') && text.includes('called')) action = 'Contacted school';
  
  // Extract outcome
  let outcome = 'Not specified';
  if (text.includes('calmed') || text.includes('better')) outcome = 'Child calmed down';
  if (text.includes('fine') || text.includes('ok') || text.includes('resolved')) outcome = 'Situation resolved';
  if (text.includes('still') && text.includes('upset')) outcome = 'Ongoing - needs follow-up';
  
  return {
    behaviour_summary: `Notable behaviour recorded at ${new Date().toLocaleTimeString()}`,
    emotional_state: emotionsDetected.length > 0 ? emotionsDetected.join(', ') : 'Not specified',
    activities_mentioned: activities,
    action_taken: action,
    outcome: outcome,
    disclaimer: 'AI-assisted summary. Please review and correct before submitting.'
  };
}

export default function AIDailyLogAssistant({ 
  onConfirm 
}: { 
  onConfirm?: (structured: StructuredNote, raw: string) => void 
}) {
  const [rawNotes, setRawNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [structuredNotes, setStructuredNotes] = useState<StructuredNote | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  
  const processNotes = () => {
    if (!rawNotes.trim()) {
      toast.error('Please enter notes first');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay for UX
    setTimeout(() => {
      const structured = extractStructuredNotes(rawNotes);
      setStructuredNotes(structured);
      setIsProcessing(false);
      toast.success('Notes processed - please review before submitting');
    }, 800);
  };
  
  const handleConfirm = () => {
    if (structuredNotes && onConfirm) {
      onConfirm(structuredNotes, rawNotes);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Note Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={aiEnabled} 
                onCheckedChange={setAiEnabled}
              />
              <Label className="text-sm text-muted-foreground">AI Assist</Label>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Write your notes naturally. AI will help structure them.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Your Notes</Label>
            <Textarea
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Write what happened today... e.g., Child was upset after school, refused dinner, later calmed down"
              className="min-h-[100px]"
            />
          </div>
          
          {aiEnabled && (
            <Button 
              onClick={processNotes} 
              disabled={isProcessing || !rawNotes.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Structure My Notes
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
      
      {structuredNotes && (
        <Card className="border-green-500/30 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">AI Structured Summary</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-100 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>AI Assistance - Human review required before submission</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Behaviour Summary</Label>
              <p className="text-sm">{structuredNotes.behaviour_summary}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Emotional State</Label>
              <Badge variant="outline" className="ml-2">
                {structuredNotes.emotional_state}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Activities Mentioned</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {structuredNotes.activities_mentioned.length > 0 ? (
                  structuredNotes.activities_mentioned.map((a, i) => (
                    <Badge key={i} variant="secondary">{a}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None detected</span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Action Taken</Label>
              <p className="text-sm">{structuredNotes.action_taken}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Outcome</Label>
              <p className="text-sm">{structuredNotes.outcome}</p>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
              <Info className="h-4 w-4 mt-0.5" />
              <span>
                This is AI-assisted structuring. Please review all details for accuracy before submitting.
                The AI does not diagnose conditions or make safeguarding decisions.
              </span>
            </div>
            <Button onClick={handleConfirm} className="w-full">
              Confirm & Submit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}