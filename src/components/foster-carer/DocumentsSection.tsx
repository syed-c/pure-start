/**
 * Documents Section
 * Access important fostering documents
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Upload,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  FolderOpen
} from 'lucide-react';

const REQUIRED_DOCUMENTS = [
  { id: '审批', title: 'Approval Certificate', description: 'Your fostering approval document', required: true },
  { id: ' Safer Recruiting', title: 'Safer Recruiting Certificate', description: 'Background check certification', required: true },
  { id: '福利', title: 'First Aid Certificate', description: 'Valid first aid training certification', required: true },
  { id: '培训', title: 'Training Record', description: 'Your completed training courses', required: false },
  { id: '政策', title: 'Policies & Procedures', description: 'Agency policies document', required: false },
];

const CHILD_DOCUMENTS = [
  { id: 'placement', title: 'Placement Agreement', description: 'Current placement details', required: true },
  { id: 'plan', title: 'Care Plan', description: 'Child\'s care plan from LA', required: true },
  { id: 'health', title: 'Health Information', description: 'Medical and health records', required: false },
  { id: 'education', title: 'Education Report', description: 'School reports and plans', required: false },
];

export default function DocumentsSection() {
  const [activeTab, setActiveTab] = useState<'my' | 'child'>('my');

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button 
          variant={activeTab === 'my' ? 'default' : 'outline'}
          onClick={() => setActiveTab('my')}
        >
          My Documents
        </Button>
        <Button 
          variant={activeTab === 'child' ? 'default' : 'outline'}
          onClick={() => setActiveTab('child')}
        >
          Child's Documents
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {activeTab === 'my' ? 'My Fostering Documents' : 'Child Documents'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'my' 
              ? 'Important documents for your fostering role'
              : 'Documents related to your current placement'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(activeTab === 'my' ? REQUIRED_DOCUMENTS : CHILD_DOCUMENTS).map(doc => (
              <div 
                key={doc.id} 
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  doc.required ? 'bg-blue-50 border border-blue-200' : 'bg-muted'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  doc.required ? 'bg-blue-100' : 'bg-muted'
                }`}>
                  <FileText className={`w-6 h-6 ${doc.required ? 'text-blue-600' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{doc.title}</p>
                    {doc.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">Drag and drop files here</p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <Button variant="outline">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}