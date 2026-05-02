/**
 * Daily Logs Section
 * Quick and simple logging for busy foster carers
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  Clock, 
  Loader2,
  CheckCircle,
  Calendar,
  Sun,
  Moon,
  Cloud,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'bg-green-100' },
  { id: 'content', label: 'Content', emoji: '🙂', color: 'bg-blue-100' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-yellow-100' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'bg-gray-100' },
  { id: 'angry', label: 'Angry', emoji: '😠', color: 'bg-red-100' },
  { id: 'quiet', label: 'Quiet', emoji: '😶', color: 'bg-purple-100' },
];

const ACTIVITIES = [
  'School',
  'Play',
  'Sports',
  'TV/Games',
  'Reading',
  'Art/Crafts',
  'Cooking',
  'Outdoor',
  'Social',
  'Therapy',
];

export default function DailyLogsSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isQuickLog, setIsQuickLog] = useState(true);

  // Fetch recent logs
  const { data: recentLogs, isLoading } = useQuery({
    queryKey: ['foster-daily-logs', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .order('log_date', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Submit log mutation
  const submitLog = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('daily_logs')
        .insert({
          agency_id: user.id,
          foster_carer_id: user.id,
          log_date: new Date().toISOString().split('T')[0],
          log_type: 'daily',
          mood: selectedMood,
          activities: selectedActivities.join(', '),
          content: notes,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foster-daily-logs'] });
      setSelectedMood(null);
      setSelectedActivities([]);
      setNotes('');
      toast.success('Daily log saved!');
    },
    onError: (error: any) => {
      toast.error('Failed to save log');
      console.error(error);
    },
  });

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = () => {
    if (!notes.trim() && !selectedMood && selectedActivities.length === 0) {
      toast.error('Please add some notes, mood, or activities');
      return;
    }
    submitLog.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Quick Log Card - Most Important */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" />
            Quick Daily Log
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Mood Selection - Big and clear */}
          <div>
            <Label className="text-base font-medium mb-2 block">How is the child feeling today?</Label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all ${
                    selectedMood === mood.id 
                      ? 'bg-primary text-white' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activities - Quick taps */}
          <div>
            <Label className="text-base font-medium mb-2 block">What did they do today?</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITIES.map(activity => (
                <Badge
                  key={activity}
                  variant={selectedActivities.includes(activity) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-2 text-sm"
                  onClick={() => toggleActivity(activity)}
                >
                  {activity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <Label className="text-base font-medium mb-2 block">Any notes? (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was the day? Any highlights or concerns..."
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={submitLog.isPending}
            className="w-full py-6 text-lg"
          >
            {submitLog.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Save Daily Log
          </Button>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !recentLogs?.length ? (
            <p className="text-muted-foreground text-center py-8">
              No daily logs yet. Add your first log above!
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log: any) => (
                <div key={log.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(log.log_date).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    {log.mood && (
                      <Badge variant="outline">
                        {MOODS.find(m => m.id === log.mood)?.emoji} {MOODS.find(m => m.id === log.mood)?.label}
                      </Badge>
                    )}
                  </div>
                  {log.activities && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {log.activities.split(', ').map((act: string) => (
                        <Badge key={act} variant="secondary" className="text-xs">{act}</Badge>
                      ))}
                    </div>
                  )}
                  {log.content && (
                    <p className="text-sm text-muted-foreground">{log.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}