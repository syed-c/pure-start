/**
 * Medication Section
 * Simple medication logging for foster carers
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Pill, 
  Save, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const COMMON_MEDICATIONS = [
  { id: 'calpol', name: 'Calpol/Paracetamol', dose: '5ml-10ml' },
  { id: 'nurofen', name: 'Nurofen/Ibuprofen', dose: '5ml' },
  { id: 'piriton', name: 'Piriton/Chlorphenamine', dose: '2.5ml' },
  { id: 'rinset', name: 'Rinset/Sodium Citrate', dose: '5ml' },
  { id: 'creon', name: 'Creon/Pancreatin', dose: '1-2 capsules' },
];

export default function MedicationSection() {
  const { user } = useAuth();
  const [selectedMed, setSelectedMed] = useState<string | null>(null);
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loggedMeds, setLoggedMeds] = useState<any[]>([]);

  const handleLogMedication = () => {
    if (!selectedMed || !time) {
      toast.error('Please fill in medication and time');
      return;
    }

    const med = COMMON_MEDICATIONS.find(m => m.id === selectedMed);
    const newLog = {
      id: Date.now(),
      medication: med?.name || selectedMed,
      dose,
      time,
      notes,
      loggedAt: new Date().toISOString()
    };

    setLoggedMeds([newLog, ...loggedMeds]);
    setSelectedMed(null);
    setDose('');
    setTime('');
    setNotes('');
    toast.success('Medication logged successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-green-600" />
            Log Medication
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label className="text-base font-medium mb-2 block">Medication</Label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_MEDICATIONS.map(med => (
                <button
                  key={med.id}
                  onClick={() => {
                    setSelectedMed(med.id);
                    setDose(med.dose);
                  }}
                  className={`p-3 rounded-lg text-left transition-all ${
                    selectedMed === med.id 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                  }`}
                >
                  <span className="font-medium block">{med.name}</span>
                  <span className="text-sm text-muted-foreground">{med.dose}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium mb-2 block">Time Given</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="py-6"
              />
            </div>
            <div>
              <Label className="text-base font-medium mb-2 block">Dose/Amount</Label>
              <Input
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g., 5ml"
                className="py-6"
              />
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-2 block">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations or side effects..."
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={handleLogMedication}
            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
          >
            <Save className="w-5 h-5 mr-2" />
            Log Medication
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Medication Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loggedMeds.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No medications logged today
            </p>
          ) : (
            <div className="space-y-3">
              {loggedMeds.map(log => (
                <div key={log.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">{log.medication}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.dose} at {log.time}
                    </p>
                  </div>
                  <Badge variant="outline">{log.time}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}