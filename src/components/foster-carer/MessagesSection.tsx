/**
 * Messages Section
 * Messages from agency and team
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send,
  Search,
  Paperclip,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const MOCK_MESSAGES = [
  {
    id: '1',
    from: 'Sarah Smith',
    role: 'Social Worker',
    subject: 'Placement Review',
    preview: 'Thank you for the update on Jamie. I wanted to discuss...',
    time: '2 hours ago',
    unread: true,
    urgent: false
  },
  {
    id: '2',
    from: 'Fostering Team',
    role: 'Agency',
    subject: 'Training Reminder',
    preview: 'Your Safeguarding training expires next week...',
    time: 'Yesterday',
    unread: true,
    urgent: false
  },
  {
    id: '3',
    from: 'Local Authority',
    role: 'LA Contact',
    subject: 'Care Plan Meeting',
    preview: 'The care plan review meeting has been scheduled...',
    time: '3 days ago',
    unread: false,
    urgent: true
  },
];

export default function MessagesSection() {
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = MOCK_MESSAGES.filter(m => m.unread).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="default">{unreadCount} unread</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-2">
          {MOCK_MESSAGES.map(msg => (
            <button
              key={msg.id}
              onClick={() => setSelectedMsg(msg.id)}
              className={`w-full text-left p-3 rounded-lg border ${
                selectedMsg === msg.id 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{msg.from}</p>
                    {msg.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {msg.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {msg.time}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          {selectedMsg ? (
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{MOCK_MESSAGES.find(m => m.id === selectedMsg)?.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4" />
                      {MOCK_MESSAGES.find(m => m.id === selectedMsg)?.from}
                      <span>•</span>
                      {MOCK_MESSAGES.find(m => m.id === selectedMsg)?.role}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p>{MOCK_MESSAGES.find(m => m.id === selectedMsg)?.preview}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Write a reply..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4 mr-1" />
                    Attach
                  </Button>
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-1" />
                    Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a message to read</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}