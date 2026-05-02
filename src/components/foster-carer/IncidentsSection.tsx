/**
 * Incidents Section
 * Quick incident reporting for stressful moments
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Save, 
  Loader2,
  Phone,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

const INCIDENT_TYPES = [
  { id: ' runaway', label: 'Child ran away', severity: 'critical' },
  { id: ' aggression', label: 'Aggressive behaviour', severity: 'high' },
  { id: ' self_harm', label: 'Self-harm', severity: 'critical' },
  { id: ' safeguarding', label: 'Safeguarding concern', severity: 'critical' },
  { id: ' accident', label: 'Accident/Injury', severity: 'high' },
  { id: ' medication', label: 'Medication issue', severity: 'medium' },
  { id: ' verbal', label: 'Verbal abuse', severity: 'medium' },
  { id: ' other', label: 'Other', severity: 'low' },
];

export default function IncidentsSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [incidentType, setIncidentType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  // Submit incident mutation
  const submitIncident = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!incidentType || !description) {
        throw new Error('Please fill in required fields');
      }

      const { error } = await supabase
        .from('incident_reports')
        .insert({
          agency_id: user.id,
          foster_carer_id: user.id,
          incident_type: incidentType,
          description: description,
          incident_date: new Date().toISOString(),
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foster-incidents'] });
      setIncidentType(null);
      setDescription('');
      toast.success('Incident reported. Agency has been notified.');
    },
    onError: (error: any) => {
      toast.error('Failed to submit incident report');
      console.error(error);
    },
  });

  return (
    <div className="space-y-6">
      {/* Emergency Banner */}
      <Card className="border-red-500 bg-red-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-800">Emergency?</h3>
              <p className="text-sm text-red-700">
                If a child is in immediate danger, call 999
              </p>
            </div>
            <Button variant="destructive" className="ml-auto">
              Call 999
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Card */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Report an Incident
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Incident Type - Big clear buttons */}
          <div>
            <Label className="text-base font-medium mb-2 block">What happened?</Label>
            <div className="grid grid-cols-2 gap-2">
              {INCIDENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setIncidentType(type.id)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    incidentType === type.id 
                      ? 'bg-orange-100 border-2 border-orange-500' 
                      : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                  }`}
                >
                  <span className="font-medium">{type.label}</span>
                  {type.severity === 'critical' && (
                    <Badge variant="destructive" className="ml-2">Urgent</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-base font-medium mb-2 block">
              What happened? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened in as much detail as you can..."
              className="min-h-[120px]"
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={() => submitIncident.mutate()}
            disabled={submitIncident.isPending || !incidentType || !description}
            className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700"
          >
            {submitIncident.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Shield className="w-5 h-5 mr-2" />
            )}
            Submit Incident Report
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your report will be sent to your agency immediately. 
            If it's urgent, they'll contact you within the hour.
          </p>
        </CardContent>
      </Card>

      {/* Past Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Incident Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No incident reports yet. That's good!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}