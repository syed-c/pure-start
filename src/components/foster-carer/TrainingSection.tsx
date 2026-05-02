/**
 * Training Section
 * Training progress and courses for foster carers
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Award,
  Calendar
} from 'lucide-react';

const MANDATORY_COURSES = [
  { id: 'safeguarding', title: 'Safeguarding Children', progress: 100, required: true },
  { id: 'first_aid', title: 'First Aid', progress: 100, required: true },
  { id: 'child_dev', title: 'Child Development', progress: 75, required: true },
  { id: 'attachment', title: 'Attachment Theory', progress: 50, required: false },
];

const RECOMMENDED_COURSES = [
  { id: 'therapeutic', title: 'Therapeutic Parenting', progress: 0, type: 'recommended' },
  { id: 'behavior', title: 'Understanding Behavior', progress: 0, type: 'recommended' },
  { id: 'contact', title: 'Contact Arrangements', progress: 0, type: 'recommended' },
];

export default function TrainingSection() {
  const totalProgress = Math.round(
    MANDATORY_COURSES.reduce((acc, c) => acc + c.progress, 0) / MANDATORY_COURSES.length
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white rounded-full">
              <GraduationCap className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Your Training Progress</h2>
              <p className="text-muted-foreground">
                Complete mandatory training to maintain your approval
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">{totalProgress}%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={totalProgress} className="mt-4 h-3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Mandatory Training
          </CardTitle>
          <CardDescription>
            Required courses for all foster carers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MANDATORY_COURSES.map(course => (
              <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <div className={`p-2 rounded-full ${
                  course.progress === 100 ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {course.progress === 100 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Play className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{course.title}</p>
                  <Progress value={course.progress} className="mt-2 h-2" />
                </div>
                <div className="text-right">
                  <Badge variant={course.progress === 100 ? 'default' : 'outline'}>
                    {course.progress === 100 ? 'Completed' : `${course.progress}%`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recommended Training
          </CardTitle>
          <CardDescription>
            Additional courses to enhance your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RECOMMENDED_COURSES.map(course => (
              <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="p-2 rounded-full bg-blue-50">
                  <Play className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{course.title}</p>
                </div>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming training sessions scheduled</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}