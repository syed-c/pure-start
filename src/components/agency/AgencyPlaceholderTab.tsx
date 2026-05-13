import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowRight } from 'lucide-react';

interface AgencyPlaceholderTabProps {
  title: string;
  description: string;
  plannedFeatures?: string[];
}

export default function AgencyPlaceholderTab({ title, description, plannedFeatures }: AgencyPlaceholderTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            This feature is currently in development. The full {title.toLowerCase()} module 
            will be available in an upcoming release.
          </p>
          {plannedFeatures && plannedFeatures.length > 0 && (
            <div className="text-left w-full max-w-md">
              <p className="text-sm font-medium mb-2">Planned features:</p>
              <ul className="space-y-1">
                {plannedFeatures.map((feature, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
