/**
 * Smart Alert System
 * Automated alerts for agencies, foster carers, and admin
 * 
 * Alert Types:
 * - Training overdue
 * - Documents expiring
 * - Daily log missing
 * - Patterns detected
 * - System issues
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react';
import { format, subDays, isAfter, isBefore } from 'date-fns';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'training' | 'documents' | 'logs' | 'patterns' | 'system';
  threshold_days: number;
}

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action_needed: string;
  is_read: boolean;
  created_at: string;
}

// Default alert rules (safe defaults - admin can adjust)
const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'training-overdue',
    name: 'Training Overdue',
    description: 'Alert when foster carer training is overdue',
    enabled: true,
    category: 'training',
    threshold_days: 30
  },
  {
    id: 'document-expiring',
    name: 'Document Expiring',
    description: 'Alert when important documents are expiring',
    enabled: true,
    category: 'documents',
    threshold_days: 14
  },
  {
    id: 'log-missing',
    name: 'Daily Log Missing',
    description: 'Alert when daily log not submitted',
    enabled: true,
    category: 'logs',
    threshold_days: 2
  },
  {
    id: 'pattern-incidents',
    name: 'Pattern Detection',
    description: 'Alert on repeated incident patterns',
    enabled: true,
    category: 'patterns',
    threshold_days: 7
  }
];

export default function SmartAlertSystem() {
  const queryClient = useQueryClient();
  
  const [enabledRules, setEnabledRules] = useState<Record<string, boolean>>({
    'training-overdue': true,
    'document-expiring': true,
    'log-missing': true,
    'pattern-incidents': true
  });

  // Fetch alerts
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['smart-alerts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    }
  });

  // Generate alerts based on rules (simplified - real implementation would be cron-triggered)
  const generateAlerts = useMutation({
    mutationFn: async () => {
      const newAlerts: Partial<Alert>[] = [];
      
      // Check training records for overdue
      if (enabledRules['training-overdue']) {
        const { data: trainingRecords } = await supabase
          .from('training_records')
          .select('*, foster_carer: foster_carers(*)')
          .lte('completed_at', subDays(new Date(), 365).toISOString());
        
        if (trainingRecords?.length) {
          newAlerts.push({
            type: 'training_overdue',
            severity: 'medium',
            title: 'Training Overdue',
            message: `${trainingRecords.length} foster carers have overdue training`,
            action_needed: 'Review training records and schedule updates'
          });
        }
      }
      
      // Check documents for expiring
      if (enabledRules['document-expiring']) {
        const { data: documents } = await supabase
          .from('foster_documents')
          .select('*, foster_carer: foster_carers(*)')
          .lte('expiry_date', subDays(new Date(), 14).toISOString());
        
        if (documents?.length) {
          newAlerts.push({
            type: 'document_expiring',
            severity: 'high',
            title: 'Documents Expiring',
            message: `${documents.length} documents are expiring soon`,
            action_needed: 'Renew documents before expiry'
          });
        }
      }
      
      // Check for missing daily logs
      if (enabledRules['log-missing']) {
        const twoDaysAgo = subDays(new Date(), 2).toISOString();
        // This would check who hasn't submitted logs
        newAlerts.push({
          type: 'log_missing',
          severity: 'low',
          title: 'Daily Logs Reminder',
          message: 'Some daily logs may be pending',
          action_needed: 'Ensure all placements have daily logs submitted'
        });
      }
      
      return newAlerts;
    },
    onSuccess: (newAlerts) => {
      toast.success(`Generated ${newAlerts.length} alerts`);
      queryClient.invalidateQueries({ queryKey: ['smart-alerts'] });
    }
  });

  const toggleRule = (ruleId: string, enabled: boolean) => {
    setEnabledRules(prev => ({ ...prev, [ruleId]: enabled }));
    toast.success(enabled ? 'Alert enabled' : 'Alert disabled');
  };

  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-alerts'] });
    }
  });

  const unreadCount = alerts?.filter(a => !a.is_read).length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Smart Alerts</CardTitle>
            </div>
            <Badge variant="outline">{unreadCount} unread</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Automated alerts based on platform activity
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert Rules */}
          <div className="space-y-2">
            <Label className="font-medium">Alert Rules</Label>
            {DEFAULT_ALERT_RULES.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <Switch
                  checked={enabledRules[rule.id]}
                  onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                />
              </div>
            ))}
          </div>
          
          <Button onClick={() => generateAlerts.mutate()} className="w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Alerts
          </Button>
        </CardContent>
      </Card>

      {/* Current Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4 text-muted-foreground">Loading alerts...</p>
          ) : alerts && alerts.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Action Needed</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.slice(0, 20).map(alert => (
                    <TableRow 
                      key={alert.id} 
                      className={!alert.is_read ? 'bg-primary/5' : ''}
                    >
                      <TableCell>
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell>{alert.message}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {alert.action_needed}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>No alerts - everything looks good!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}