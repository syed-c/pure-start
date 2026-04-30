import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Building2, Heart, Calendar, FileText, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { subDays, format } from 'date-fns';

interface ReportData {
  title: string;
  description: string;
  icon: any;
  color: string;
  data?: any[];
}

export default function ReportsTab() {
  // Platform-wide statistics
  const { data: platformStats } = useQuery({
    queryKey: ['platform-report-stats'],
    queryFn: async () => {
      const [
        agenciesResult,
        fosterCarersResult,
        applicantsResult,
        enquiriesResult,
        trainersResult,
      ] = await Promise.all([
        supabaseAdmin.from('agencies').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('foster_carer_profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('applicant_profiles').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('enquiries').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('trainer_profiles').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalAgencies: agenciesResult.count || 0,
        activeFosterCarers: fosterCarersResult.count || 0,
        totalApplicants: applicantsResult.count || 0,
        totalEnquiries: enquiriesResult.count || 0,
        trainingProviders: trainersResult.count || 0,
      };
    },
  });

  // Weekly trends data
  const { data: weeklyTrends } = useQuery({
    queryKey: ['weekly-trends-report'],
    queryFn: async () => {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const [enquiriesCount, applicantsCount] = await Promise.all([
          supabaseAdmin.from('enquiries').select('id', { count: 'exact', head: true })
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString()),
          supabaseAdmin.from('applicant_profiles').select('id', { count: 'exact', head: true })
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString()),
        ]);

        data.push({
          date: format(dayStart, 'EEE'),
          enquiries: enquiriesCount.count || 0,
          applicants: applicantsCount.count || 0,
        });
      }
      return data;
    },
  });

  // Agency performance data
  const { data: topAgencies } = useQuery({
    queryKey: ['top-agencies-report'],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from('agencies')
        .select('id, name, city, average_rating, total_reviews, total_enquiries')
        .order('total_enquiries', { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const reportCards: ReportData[] = [
    {
      title: 'Platform Overview',
      description: 'Summary of all fostering platform metrics',
      icon: BarChart3,
      color: 'text-primary',
    },
    {
      title: 'Foster Carer Statistics',
      description: 'Active carers, approvals, and demographics',
      icon: Heart,
      color: 'text-teal',
    },
    {
      title: 'Application Pipeline',
      description: 'Applicant stages and conversion rates',
      icon: Users,
      color: 'text-gold',
    },
    {
      title: 'Enquiry Analysis',
      description: 'Source, status, and response times',
      icon: Calendar,
      color: 'text-coral',
    },
    {
      title: 'Agency Performance',
      description: 'Rankings and engagement metrics',
      icon: Building2,
      color: 'text-purple',
    },
    {
      title: 'Export Reports',
      description: 'Download detailed CSV reports',
      icon: FileText,
      color: 'text-blue',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Platform-wide fostering metrics and insights</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{platformStats?.totalAgencies || 0}</p>
              <p className="text-sm text-muted-foreground">Agencies</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal/10 rounded-lg">
              <Heart className="h-5 w-5 text-teal" />
            </div>
            <div>
              <p className="text-2xl font-bold">{platformStats?.activeFosterCarers || 0}</p>
              <p className="text-sm text-muted-foreground">Active Carers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-lg">
              <Users className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold">{platformStats?.totalApplicants || 0}</p>
              <p className="text-sm text-muted-foreground">Applicants</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-coral/10 rounded-lg">
              <Calendar className="h-5 w-5 text-coral" />
            </div>
            <div>
              <p className="text-2xl font-bold">{platformStats?.totalEnquiries || 0}</p>
              <p className="text-sm text-muted-foreground">Enquiries</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{platformStats?.trainingProviders || 0}</p>
              <p className="text-sm text-muted-foreground">Trainers</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Trends Chart */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Weekly Enquiry & Application Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrends || []}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="enquiries" name="Enquiries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="applicants" name="Applicants" fill="hsl(var(--teal))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Report Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-primary/5`}>
                  <Icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold">{report.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Top Agencies Table */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Top Performing Agencies</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Agency</th>
                <th className="text-left py-3 px-4 font-semibold">Location</th>
                <th className="text-center py-3 px-4 font-semibold">Rating</th>
                <th className="text-center py-3 px-4 font-semibold">Reviews</th>
                <th className="text-center py-3 px-4 font-semibold">Enquiries</th>
              </tr>
            </thead>
            <tbody>
              {topAgencies?.map((agency: any, index: number) => (
                <tr key={agency.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{agency.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{agency.city || 'N/A'}</td>
                  <td className="py-3 px-4 text-center">
                    {agency.average_rating ? (
                      <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20">
                        {agency.average_rating.toFixed(1)} ★
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">{agency.total_reviews || 0}</td>
                  <td className="py-3 px-4 text-center font-medium">{agency.total_enquiries || 0}</td>
                </tr>
              ))}
              {(!topAgencies || topAgencies.length === 0) && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No agency data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}