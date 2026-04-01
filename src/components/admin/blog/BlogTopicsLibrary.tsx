import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search, Sparkles, Square, CheckCircle2, Clock, AlertTriangle,
  FileText, Loader2, Calendar,
  Zap, BarChart3, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminBlogPosts, useCreateBlogPost } from '@/hooks/useAdminBlog';
import { generateSlug } from '@/hooks/useBlogManagement';

// ─── Topic data ───────────────────────────────────────────
export interface BlogTopic {
  id: number;
  title: string;
  primaryKeyword: string;
  intent: 'Informational' | 'Commercial' | 'Transactional';
  category: string;
  priority: 'High' | 'Med' | 'Low';
  wordCount: number;
  month: number; // 1-12 for the calendar
}

const TOPICS: BlogTopic[] = [
  // CATEGORY 1 — BECOMING A FOSTER CARER
  { id: 1, title: "How to Become a Foster Carer in the UK — Complete Step-by-Step Guide 2026", primaryKeyword: "how to become a foster carer", intent: "Informational", category: "Becoming a Carer", priority: "High", wordCount: 2000, month: 1 },
  { id: 2, title: "Foster Carer Requirements UK 2026 — Who Can Foster?", primaryKeyword: "foster carer requirements UK", intent: "Informational", category: "Becoming a Carer", priority: "High", wordCount: 2000, month: 1 },
  { id: 3, title: "Form F Assessment Explained — What to Expect During Fostering Approval", primaryKeyword: "form f assessment fostering", intent: "Informational", category: "Becoming a Carer", priority: "High", wordCount: 1500, month: 2 },
  { id: 4, title: "Skills to Foster Course — What You Learn & How to Prepare 2026", primaryKeyword: "skills to foster course", intent: "Informational", category: "Becoming a Carer", priority: "High", wordCount: 1200, month: 2 },
  { id: 5, title: "Can Single People Foster? Everything You Need to Know in 2026", primaryKeyword: "can single people foster", intent: "Informational", category: "Becoming a Carer", priority: "High", wordCount: 1200, month: 3 },
  { id: 6, title: "Fostering as a Same-Sex Couple — Your Rights & How to Apply", primaryKeyword: "fostering same sex couple UK", intent: "Informational", category: "Becoming a Carer", priority: "Med", wordCount: 1200, month: 3 },
  { id: 7, title: "How Long Does It Take to Become a Foster Carer? Timeline Explained", primaryKeyword: "how long to become foster carer", intent: "Informational", category: "Becoming a Carer", priority: "High", wordCount: 1200, month: 4 },
  { id: 8, title: "DBS Checks for Foster Carers — What's Checked & How Long It Takes", primaryKeyword: "DBS check foster carer", intent: "Informational", category: "Becoming a Carer", priority: "Med", wordCount: 1200, month: 4 },
  { id: 9, title: "Fostering Panel — What Happens & How to Prepare for Approval", primaryKeyword: "fostering panel UK", intent: "Informational", category: "Becoming a Carer", priority: "Med", wordCount: 1200, month: 5 },
  { id: 10, title: "Working and Fostering — Can You Keep Your Job? A Practical Guide", primaryKeyword: "working and fostering UK", intent: "Informational", category: "Becoming a Carer", priority: "High", wordCount: 1500, month: 5 },

  // CATEGORY 2 — TYPES OF FOSTERING
  { id: 11, title: "Types of Fostering Explained — Which Is Right for You? 2026 Guide", primaryKeyword: "types of fostering", intent: "Informational", category: "Types of Fostering", priority: "High", wordCount: 2000, month: 1 },
  { id: 12, title: "Emergency Fostering — What It Involves & How to Become an Emergency Carer", primaryKeyword: "emergency fostering UK", intent: "Informational", category: "Types of Fostering", priority: "High", wordCount: 1500, month: 2 },
  { id: 13, title: "Respite Foster Care — Providing Short Breaks for Families & Carers", primaryKeyword: "respite foster care UK", intent: "Informational", category: "Types of Fostering", priority: "High", wordCount: 1200, month: 3 },
  { id: 14, title: "Long-Term Fostering — Giving Children a Stable Family for Years", primaryKeyword: "long term fostering", intent: "Informational", category: "Types of Fostering", priority: "High", wordCount: 1500, month: 3 },
  { id: 15, title: "Therapeutic Fostering — Supporting Children with Complex Needs", primaryKeyword: "therapeutic fostering UK", intent: "Informational", category: "Types of Fostering", priority: "High", wordCount: 1500, month: 4 },
  { id: 16, title: "Parent and Child Fostering — What It Is & Who It Helps", primaryKeyword: "parent and child fostering", intent: "Informational", category: "Types of Fostering", priority: "Med", wordCount: 1200, month: 4 },
  { id: 17, title: "Fostering Teenagers — Challenges, Rewards & Expert Advice", primaryKeyword: "fostering teenagers UK", intent: "Informational", category: "Types of Fostering", priority: "High", wordCount: 1500, month: 5 },
  { id: 18, title: "Fostering Sibling Groups — Keeping Brothers & Sisters Together", primaryKeyword: "fostering sibling groups", intent: "Informational", category: "Types of Fostering", priority: "High", wordCount: 1200, month: 6 },
  { id: 19, title: "Short-Term Fostering — What to Expect from Temporary Placements", primaryKeyword: "short term fostering UK", intent: "Informational", category: "Types of Fostering", priority: "Med", wordCount: 1200, month: 6 },
  { id: 20, title: "Fostering Children with Disabilities — Support, Training & Specialist Agencies", primaryKeyword: "fostering children with disabilities", intent: "Informational", category: "Types of Fostering", priority: "Med", wordCount: 1500, month: 7 },

  // CATEGORY 3 — FOSTERING ALLOWANCES & FINANCES
  { id: 21, title: "Fostering Allowance UK 2026 — How Much Do Foster Carers Get Paid?", primaryKeyword: "fostering allowance UK", intent: "Commercial", category: "Allowances & Finances", priority: "High", wordCount: 2000, month: 1 },
  { id: 22, title: "National Minimum Fostering Allowance 2026 — Rates by Age Group", primaryKeyword: "national minimum fostering allowance", intent: "Commercial", category: "Allowances & Finances", priority: "High", wordCount: 1500, month: 1 },
  { id: 23, title: "Foster Carer Tax Relief — How the £10,000 Tax Exemption Works", primaryKeyword: "foster carer tax relief UK", intent: "Informational", category: "Allowances & Finances", priority: "High", wordCount: 1500, month: 2 },
  { id: 24, title: "Independent Fostering Agencies vs Local Authority — Pay & Support Compared", primaryKeyword: "IFA vs local authority fostering", intent: "Commercial", category: "Allowances & Finances", priority: "High", wordCount: 2000, month: 2 },
  { id: 25, title: "Do Foster Carers Get a Pension? Financial Planning for Carers", primaryKeyword: "foster carer pension UK", intent: "Informational", category: "Allowances & Finances", priority: "Med", wordCount: 1200, month: 7 },
  { id: 26, title: "Additional Financial Support for Foster Carers — Equipment, Holidays & More", primaryKeyword: "financial support foster carers", intent: "Informational", category: "Allowances & Finances", priority: "Med", wordCount: 1200, month: 8 },

  // CATEGORY 4 — OFSTED & REGULATIONS
  { id: 27, title: "Understanding Ofsted Ratings for Fostering Agencies — What They Mean", primaryKeyword: "Ofsted ratings fostering agencies", intent: "Informational", category: "Ofsted & Regulations", priority: "High", wordCount: 2000, month: 1 },
  { id: 28, title: "How to Read an Ofsted Fostering Inspection Report — A Carer's Guide", primaryKeyword: "Ofsted fostering inspection report", intent: "Informational", category: "Ofsted & Regulations", priority: "High", wordCount: 1500, month: 3 },
  { id: 29, title: "Children Act 1989 & Fostering — What Carers Need to Know", primaryKeyword: "children act 1989 fostering", intent: "Informational", category: "Ofsted & Regulations", priority: "Med", wordCount: 1500, month: 8 },
  { id: 30, title: "Safeguarding in Foster Care — Your Responsibilities as a Carer", primaryKeyword: "safeguarding foster care UK", intent: "Informational", category: "Ofsted & Regulations", priority: "High", wordCount: 1500, month: 4 },
  { id: 31, title: "Fostering Regulations 2011 — Key Standards Every Carer Should Know", primaryKeyword: "fostering services regulations 2011", intent: "Informational", category: "Ofsted & Regulations", priority: "Med", wordCount: 1200, month: 8 },
  { id: 32, title: "Independent Reviewing Officers in Foster Care — Their Role Explained", primaryKeyword: "independent reviewing officer foster care", intent: "Informational", category: "Ofsted & Regulations", priority: "Med", wordCount: 1200, month: 9 },

  // CATEGORY 5 — REGIONAL FOSTERING GUIDES
  { id: 33, title: "Fostering in London — Agencies, Allowances & How to Get Started 2026", primaryKeyword: "fostering agencies London", intent: "Commercial", category: "Regional Guides", priority: "High", wordCount: 2000, month: 2 },
  { id: 34, title: "Fostering in Birmingham — Top Agencies & Local Support Guide 2026", primaryKeyword: "fostering agencies Birmingham", intent: "Commercial", category: "Regional Guides", priority: "High", wordCount: 1500, month: 2 },
  { id: 35, title: "Fostering in Manchester — Complete Guide for Prospective Carers 2026", primaryKeyword: "fostering agencies Manchester", intent: "Commercial", category: "Regional Guides", priority: "High", wordCount: 1500, month: 3 },
  { id: 36, title: "Fostering in Yorkshire — Agencies, Support & Local Resources 2026", primaryKeyword: "fostering agencies Yorkshire", intent: "Commercial", category: "Regional Guides", priority: "High", wordCount: 1500, month: 3 },
  { id: 37, title: "Fostering in Hampshire — Local Agencies & Carer Experiences 2026", primaryKeyword: "fostering children Hampshire", intent: "Commercial", category: "Regional Guides", priority: "High", wordCount: 1500, month: 4 },
  { id: 38, title: "Fostering in the West Midlands — Agencies & Opportunities 2026", primaryKeyword: "fostering West Bromwich", intent: "Commercial", category: "Regional Guides", priority: "High", wordCount: 1500, month: 4 },
  { id: 39, title: "Fostering in Scotland — How It Differs from England & Wales", primaryKeyword: "fostering in Scotland", intent: "Informational", category: "Regional Guides", priority: "Med", wordCount: 1500, month: 5 },
  { id: 40, title: "Fostering in Wales — Regulations, Agencies & Support Networks", primaryKeyword: "fostering in Wales", intent: "Informational", category: "Regional Guides", priority: "Med", wordCount: 1500, month: 5 },
  { id: 41, title: "Fostering in Northern Ireland — How the Process Works", primaryKeyword: "fostering Northern Ireland", intent: "Informational", category: "Regional Guides", priority: "Med", wordCount: 1500, month: 6 },
  { id: 42, title: "Fostering in the North East — Agencies & Community Support 2026", primaryKeyword: "fostering agencies North East", intent: "Commercial", category: "Regional Guides", priority: "Med", wordCount: 1200, month: 6 },
  { id: 43, title: "Fostering in Kent — Local Agencies & Carer Opportunities 2026", primaryKeyword: "fostering agencies Kent", intent: "Commercial", category: "Regional Guides", priority: "Med", wordCount: 1200, month: 7 },
  { id: 44, title: "Fostering in Essex — Agencies, Rates & How to Apply 2026", primaryKeyword: "fostering agencies Essex", intent: "Commercial", category: "Regional Guides", priority: "Med", wordCount: 1200, month: 7 },

  // CATEGORY 6 — CHOOSING AN AGENCY
  { id: 45, title: "Top 10 Fostering Agencies in the UK — How to Compare & Choose 2026", primaryKeyword: "top 10 fostering agencies", intent: "Commercial", category: "Choosing an Agency", priority: "High", wordCount: 2000, month: 1 },
  { id: 46, title: "Independent Fostering Agency vs Local Authority — Which Should You Choose?", primaryKeyword: "foster care agency UK", intent: "Commercial", category: "Choosing an Agency", priority: "High", wordCount: 2000, month: 1 },
  { id: 47, title: "What to Look for in a Fostering Agency — 10 Questions to Ask", primaryKeyword: "foster agencies", intent: "Informational", category: "Choosing an Agency", priority: "High", wordCount: 1500, month: 2 },
  { id: 48, title: "Transferring Between Fostering Agencies — How & Why Carers Switch", primaryKeyword: "transferring fostering agencies", intent: "Informational", category: "Choosing an Agency", priority: "High", wordCount: 1200, month: 5 },
  { id: 49, title: "How to Compare Fostering Agency Support Packages — A Practical Guide", primaryKeyword: "fostering agency support", intent: "Informational", category: "Choosing an Agency", priority: "Med", wordCount: 1200, month: 9 },
  { id: 50, title: "Fostering Agency Reviews — What Other Carers Say & How to Find Them", primaryKeyword: "fostering agency reviews", intent: "Commercial", category: "Choosing an Agency", priority: "Med", wordCount: 1200, month: 9 },

  // CATEGORY 7 — TRAINING & DEVELOPMENT
  { id: 51, title: "Foster Carer Training — What Courses Are Available & Which Are Mandatory?", primaryKeyword: "foster carer training UK", intent: "Informational", category: "Training & Development", priority: "High", wordCount: 1500, month: 4 },
  { id: 52, title: "Level 3 Diploma in Children & Young People's Workforce for Foster Carers", primaryKeyword: "level 3 diploma foster carer", intent: "Informational", category: "Training & Development", priority: "Med", wordCount: 1200, month: 8 },
  { id: 53, title: "Therapeutic Parenting Training — Courses & Resources for Foster Carers", primaryKeyword: "therapeutic parenting training", intent: "Informational", category: "Training & Development", priority: "Med", wordCount: 1200, month: 8 },
  { id: 54, title: "Attachment Theory for Foster Carers — Understanding Trauma-Informed Care", primaryKeyword: "attachment theory foster care", intent: "Informational", category: "Training & Development", priority: "High", wordCount: 1500, month: 6 },
  { id: 55, title: "Online Safety Training for Foster Carers — Keeping Children Safe Online", primaryKeyword: "online safety training foster carers", intent: "Informational", category: "Training & Development", priority: "Med", wordCount: 1200, month: 10 },

  // CATEGORY 8 — CARER WELLBEING & SUPPORT
  { id: 56, title: "Foster Carer Burnout — Signs, Prevention & Getting Support", primaryKeyword: "foster carer burnout", intent: "Informational", category: "Carer Wellbeing", priority: "High", wordCount: 1500, month: 6 },
  { id: 57, title: "Foster Carer Support Groups — Finding Your Local Community", primaryKeyword: "foster carer support groups", intent: "Informational", category: "Carer Wellbeing", priority: "Med", wordCount: 1200, month: 7 },
  { id: 58, title: "Self-Care for Foster Carers — Practical Tips from Experienced Carers", primaryKeyword: "self care foster carers", intent: "Informational", category: "Carer Wellbeing", priority: "Med", wordCount: 1200, month: 10 },
  { id: 59, title: "Staying Put Arrangements — Supporting Young People Beyond 18", primaryKeyword: "staying put arrangements fostering", intent: "Informational", category: "Carer Wellbeing", priority: "High", wordCount: 1500, month: 7 },
  { id: 60, title: "Dealing with Allegations in Foster Care — Your Rights & What to Do", primaryKeyword: "allegations foster care UK", intent: "Informational", category: "Carer Wellbeing", priority: "High", wordCount: 1500, month: 11 },

  // CATEGORY 9 — FOSTERING & EDUCATION
  { id: 61, title: "Education for Looked-After Children — The Foster Carer's Role", primaryKeyword: "education looked after children", intent: "Informational", category: "Fostering & Education", priority: "High", wordCount: 1500, month: 9 },
  { id: 62, title: "Pupil Premium Plus for Foster Children — How It Works & How to Access It", primaryKeyword: "pupil premium plus foster children", intent: "Informational", category: "Fostering & Education", priority: "Med", wordCount: 1200, month: 9 },
  { id: 63, title: "Personal Education Plans (PEPs) for Fostered Children — A Carer's Guide", primaryKeyword: "personal education plan foster child", intent: "Informational", category: "Fostering & Education", priority: "Med", wordCount: 1200, month: 10 },
  { id: 64, title: "School Admissions for Foster Children — Priority, Appeals & Your Rights", primaryKeyword: "school admissions foster children", intent: "Informational", category: "Fostering & Education", priority: "Med", wordCount: 1200, month: 10 },

  // CATEGORY 10 — SEASONAL & AWARENESS
  { id: 65, title: "Foster Care Fortnight 2026 — Events, Stories & How to Get Involved", primaryKeyword: "foster care fortnight 2026", intent: "Informational", category: "Seasonal & Awareness", priority: "High", wordCount: 1200, month: 5 },
  { id: 66, title: "Christmas with Foster Children — Tips for a Happy, Inclusive Holiday", primaryKeyword: "christmas foster children", intent: "Informational", category: "Seasonal & Awareness", priority: "Med", wordCount: 1200, month: 11 },
  { id: 67, title: "Back to School Tips for Foster Carers — Preparing for September 2026", primaryKeyword: "back to school foster carers", intent: "Informational", category: "Seasonal & Awareness", priority: "Med", wordCount: 1200, month: 8 },
  { id: 68, title: "National Adoption Week & Fostering — Understanding the Difference", primaryKeyword: "adoption vs fostering UK", intent: "Informational", category: "Seasonal & Awareness", priority: "High", wordCount: 1500, month: 10 },
  { id: 69, title: "Fostering Statistics UK 2026 — Key Numbers Every Prospective Carer Should Know", primaryKeyword: "fostering statistics UK", intent: "Informational", category: "Seasonal & Awareness", priority: "High", wordCount: 1500, month: 1 },
  { id: 70, title: "Why Are More Foster Carers Needed in the UK? The 2026 Outlook", primaryKeyword: "foster carers needed UK", intent: "Informational", category: "Seasonal & Awareness", priority: "High", wordCount: 1500, month: 3 },

  // CATEGORY 11 — INDUSTRY GUIDES
  { id: 71, title: "Foster Care UK — A Complete Guide for Prospective Carers 2026", primaryKeyword: "foster care UK", intent: "Informational", category: "Industry Guides", priority: "High", wordCount: 2000, month: 1 },
  { id: 72, title: "The Fostering Process Explained — From Enquiry to First Placement", primaryKeyword: "fostering agency", intent: "Informational", category: "Industry Guides", priority: "High", wordCount: 2000, month: 2 },
  { id: 73, title: "Fostering vs Adoption — Key Differences Every Family Should Know", primaryKeyword: "fostering vs adoption", intent: "Informational", category: "Industry Guides", priority: "High", wordCount: 1500, month: 3 },
  { id: 74, title: "Life as a Foster Carer — A Day in the Life & Real Carer Stories", primaryKeyword: "foster care services", intent: "Informational", category: "Industry Guides", priority: "High", wordCount: 1500, month: 4 },
  { id: 75, title: "The Future of Foster Care in the UK — Trends & Predictions for 2026-2030", primaryKeyword: "foster care agencies", intent: "Informational", category: "Industry Guides", priority: "Med", wordCount: 1500, month: 12 },
  { id: 76, title: "Unaccompanied Asylum-Seeking Children — How Foster Carers Can Help", primaryKeyword: "fostering asylum seeking children UK", intent: "Informational", category: "Industry Guides", priority: "High", wordCount: 1500, month: 11 },
  { id: 77, title: "Contact Visits in Foster Care — How They Work & Supporting the Child", primaryKeyword: "contact visits foster care", intent: "Informational", category: "Industry Guides", priority: "Med", wordCount: 1200, month: 12 },
  { id: 78, title: "The Role of the Supervising Social Worker in Foster Care", primaryKeyword: "supervising social worker foster care", intent: "Informational", category: "Industry Guides", priority: "Med", wordCount: 1200, month: 12 },
  { id: 79, title: "Foster Care Leavers — Support Available After Leaving Care", primaryKeyword: "foster care leavers support", intent: "Informational", category: "Industry Guides", priority: "Med", wordCount: 1500, month: 11 },
  { id: 80, title: "Special Guardianship Orders vs Fostering — What's the Difference?", primaryKeyword: "special guardianship order vs fostering", intent: "Informational", category: "Industry Guides", priority: "Med", wordCount: 1200, month: 12 },
];

const CATEGORIES = [...new Set(TOPICS.map(t => t.category))];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Component ────────────────────────────────────────────
export default function BlogTopicsLibrary() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [intentFilter, setIntentFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0, errors: 0 });
  const [stopRequested, setStopRequested] = useState(false);
  const [generatedIds, setGeneratedIds] = useState<Set<number>>(new Set());
  const [previewTopic, setPreviewTopic] = useState<BlogTopic | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [calendarView, setCalendarView] = useState(false);
  
  const { data: existingPosts } = useAdminBlogPosts();
  const createPost = useCreateBlogPost();

  // Check which topics already have posts (by matching slug)
  const existingSlugs = useMemo(() => {
    return new Set((existingPosts || []).map(p => p.slug));
  }, [existingPosts]);

  const getTopicSlug = (topic: BlogTopic) => generateSlug(topic.title);
  
  const isTopicGenerated = (topic: BlogTopic) => {
    return existingSlugs.has(getTopicSlug(topic)) || generatedIds.has(topic.id);
  };

  const filtered = useMemo(() => {
    return TOPICS.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.primaryKeyword.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (intentFilter !== 'all' && t.intent !== intentFilter) return false;
      if (monthFilter !== 'all' && t.month !== parseInt(monthFilter)) return false;
      return true;
    });
  }, [search, categoryFilter, priorityFilter, intentFilter, monthFilter]);

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const selectAll = () => {
    const ids = filtered.filter(t => !isTopicGenerated(t)).map(t => t.id);
    setSelected(new Set(ids));
  };

  const selectNone = () => setSelected(new Set());

  // Generate a single blog post from a topic
  const generatePost = async (topic: BlogTopic): Promise<boolean> => {
    try {
      // Step 1: Generate full content
      const { data: contentData, error: contentError } = await supabase.functions.invoke('blog-ai-assistant', {
        body: {
          action: 'generate_full_post',
          title: topic.title,
          content: `Primary Keyword: ${topic.primaryKeyword}\nSearch Intent: ${topic.intent}\nTarget Word Count: ${topic.wordCount}\nCategory: ${topic.category}`,
        },
      });
      if (contentError) throw contentError;

      // Extract clean markdown content from AI response
      // The AI may return content in various formats - handle all cases
      let body = '';
      let excerpt = '';
      let seoTitle = topic.title.slice(0, 60);
      let seoDesc = '';

      if (contentData?.content && typeof contentData.content === 'string') {
        body = contentData.content;
      } else if (contentData?.raw) {
        // Try to extract content from raw response (may contain code fences)
        const raw = String(contentData.raw);
        const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        try {
          const parsed = JSON.parse(cleaned.slice(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1));
          body = parsed.content || '';
          excerpt = parsed.excerpt || '';
          seoTitle = parsed.seo_title || seoTitle;
          seoDesc = parsed.seo_description || '';
        } catch {
          // Use raw content as-is but strip code fences
          body = cleaned;
        }
      }

      // Convert [LINK: /path/] placeholders to markdown links
      body = body.replace(/\[LINK:\s*([^\]]+)\]/g, (_, path) => {
        const cleanPath = path.trim().replace(/\/$/, '');
        const label = cleanPath.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || cleanPath;
        return `[${label}](${cleanPath})`;
      });

      excerpt = excerpt || contentData?.excerpt || '';
      seoTitle = contentData?.seo_title || seoTitle;
      seoDesc = seoDesc || contentData?.seo_description || '';

      // Step 2: Generate featured image
      let imageUrl = '';
      try {
        const { data: imgData } = await supabase.functions.invoke('blog-ai-assistant', {
          body: { action: 'generate_image', title: topic.title },
        });
        imageUrl = imgData?.imageUrl || '';
      } catch {
        console.warn('Image generation failed for:', topic.title);
      }

      // Step 3: Create the post
      await createPost.mutateAsync({
        title: topic.title,
        slug: getTopicSlug(topic),
        content: body,
        excerpt,
        seo_title: seoTitle,
        seo_description: seoDesc,
        featured_image_url: imageUrl,
        category: topic.category,
        status: 'published',
        published_at: new Date().toISOString(),
        tags: [topic.primaryKeyword, topic.intent.toLowerCase()],
      });

      setGeneratedIds(prev => new Set([...prev, topic.id]));
      return true;
    } catch (err) {
      console.error('Failed to generate post for:', topic.title, err);
      return false;
    }
  };

  // Bulk generate
  const handleBulkGenerate = async () => {
    const topics = TOPICS.filter(t => selected.has(t.id) && !isTopicGenerated(t));
    if (topics.length === 0) {
      toast.error('No un-generated topics selected');
      return;
    }

    setGenerating(true);
    setStopRequested(false);
    setGenerationProgress({ current: 0, total: topics.length, errors: 0 });

    let errors = 0;
    for (let i = 0; i < topics.length; i++) {
      if (stopRequested) {
        toast.info(`Stopped after ${i} of ${topics.length} topics`);
        break;
      }
      
      const success = await generatePost(topics[i]);
      if (!success) errors++;
      
      setGenerationProgress({ current: i + 1, total: topics.length, errors });
    }

    setGenerating(false);
    toast.success(`Generated ${topics.length - errors} posts (${errors} errors)`);
    setSelected(new Set());
  };

  // Single generate with preview
  const handlePreviewGenerate = async (topic: BlogTopic) => {
    setPreviewTopic(topic);
    setPreviewLoading(true);
    setPreviewContent('');

    try {
      const { data, error } = await supabase.functions.invoke('blog-ai-assistant', {
        body: {
          action: 'generate_full_post',
          title: topic.title,
          content: `Primary Keyword: ${topic.primaryKeyword}\nSearch Intent: ${topic.intent}\nTarget Word Count: ${topic.wordCount}\nCategory: ${topic.category}`,
        },
      });
      if (error) throw error;
      setPreviewContent(data?.content || data?.raw || 'No content generated');
    } catch (err) {
      setPreviewContent('Error generating preview. Please try again.');
      toast.error('Preview generation failed');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePublishPreview = async () => {
    if (!previewTopic || !previewContent) return;
    const success = await generatePost(previewTopic);
    if (success) {
      toast.success('Post created as draft');
      setPreviewTopic(null);
    }
  };

  // Stats
  const totalTopics = TOPICS.length;
  const generatedCount = TOPICS.filter(t => isTopicGenerated(t)).length;
  const highPriorityRemaining = TOPICS.filter(t => t.priority === 'High' && !isTopicGenerated(t)).length;
  const selectedCount = selected.size;

  // Calendar grouping
  const topicsByMonth = useMemo(() => {
    const map = new Map<number, BlogTopic[]>();
    for (let m = 1; m <= 12; m++) map.set(m, []);
    filtered.forEach(t => map.get(t.month)?.push(t));
    return map;
  }, [filtered]);

  const priorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'Med': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'Low': return 'bg-muted text-muted-foreground border-border';
      default: return '';
    }
  };

  const intentColor = (i: string) => {
    switch (i) {
      case 'Commercial': return 'bg-primary/10 text-primary';
      case 'Transactional': return 'bg-teal/10 text-teal';
      case 'Informational': return 'bg-blue-500/10 text-blue-700';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-modern">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalTopics}</p>
              <p className="text-xs text-muted-foreground">Total Topics</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-teal" />
            </div>
            <div>
              <p className="text-2xl font-bold">{generatedCount}</p>
              <p className="text-xs text-muted-foreground">Generated</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highPriorityRemaining}</p>
              <p className="text-xs text-muted-foreground">High Priority Left</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round((generatedCount / totalTopics) * 100)}%</p>
              <p className="text-xs text-muted-foreground">Coverage</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Generation Progress */}
      {generating && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="font-medium">Generating posts...</span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setStopRequested(true)}>
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
            </div>
            <Progress value={(generationProgress.current / generationProgress.total) * 100} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{generationProgress.current} / {generationProgress.total} completed</span>
              {generationProgress.errors > 0 && (
                <span className="text-destructive">{generationProgress.errors} errors</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card className="card-modern">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics or keywords..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Med">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={intentFilter} onValueChange={setIntentFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Intent" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intent</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Transactional">Transactional</SelectItem>
                <SelectItem value="Informational">Informational</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              variant={calendarView ? "default" : "outline"}
              size="sm"
              onClick={() => setCalendarView(!calendarView)}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>
          
          <div className="flex items-center gap-3 border-t pt-3">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All ({filtered.filter(t => !isTopicGenerated(t)).length})
            </Button>
            <Button variant="ghost" size="sm" onClick={selectNone}>Clear</Button>
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
            <Button
              onClick={handleBulkGenerate}
              disabled={selectedCount === 0 || generating}
              className="bg-primary"
            >
              <Zap className="h-4 w-4 mr-1" />
              Generate {selectedCount} Post{selectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {calendarView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(topicsByMonth.entries()).map(([month, topics]) => (
            <Card key={month} className="card-modern">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{MONTHS[month - 1]} 2026</span>
                  <Badge variant="outline">{topics.length} topics</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-[300px] overflow-y-auto">
                {topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No topics scheduled</p>
                ) : topics.map(topic => (
                  <div
                    key={topic.id}
                    className={`flex items-start gap-2 p-2 rounded-md text-sm cursor-pointer hover:bg-accent/50 transition-colors ${
                      isTopicGenerated(topic) ? 'opacity-50' : ''
                    }`}
                    onClick={() => !isTopicGenerated(topic) && handlePreviewGenerate(topic)}
                  >
                    {isTopicGenerated(topic) ? (
                      <CheckCircle2 className="h-4 w-4 text-teal mt-0.5 flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <span className="flex-1 line-clamp-2">{topic.title}</span>
                    <Badge variant="outline" className={`text-[10px] ${priorityColor(topic.priority)}`}>
                      {topic.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className="card-modern">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Topic Title</TableHead>
                  <TableHead className="w-[130px]">Keyword</TableHead>
                  <TableHead className="w-[100px]">Intent</TableHead>
                  <TableHead className="w-[80px]">Priority</TableHead>
                  <TableHead className="w-[80px]">Words</TableHead>
                  <TableHead className="w-[70px]">Month</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(topic => {
                  const generated = isTopicGenerated(topic);
                  return (
                    <TableRow key={topic.id} className={generated ? 'opacity-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(topic.id)}
                          onCheckedChange={() => toggleSelect(topic.id)}
                          disabled={generated}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{topic.id}</TableCell>
                      <TableCell>
                        <div className="max-w-[400px]">
                          <p className="font-medium text-sm line-clamp-2">{topic.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{topic.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{topic.primaryKeyword}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${intentColor(topic.intent)}`}>
                          {topic.intent}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${priorityColor(topic.priority)}`}>
                          {topic.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{topic.wordCount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{MONTHS[topic.month - 1]}</TableCell>
                      <TableCell>
                        {generated ? (
                          <Badge className="bg-teal/10 text-teal border-teal/30 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Generated
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            <Clock className="h-3 w-3 mr-1" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!generated && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => handlePreviewGenerate(topic)}
                            >
                              <Sparkles className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTopic} onOpenChange={open => !open && setPreviewTopic(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{previewTopic?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{previewTopic?.primaryKeyword}</Badge>
              <Badge variant="outline" className={intentColor(previewTopic?.intent || '')}>{previewTopic?.intent}</Badge>
              <Badge variant="outline" className={priorityColor(previewTopic?.priority || '')}>{previewTopic?.priority}</Badge>
              <Badge variant="outline">{previewTopic?.wordCount.toLocaleString()} words target</Badge>
            </div>

            {previewLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating content with AI...</p>
              </div>
            ) : previewContent ? (
              <div className="border rounded-lg p-4 bg-muted/30">
                <pre className="whitespace-pre-wrap text-sm font-sans">{previewContent}</pre>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreviewTopic(null)}>Cancel</Button>
              <Button
                onClick={handlePublishPreview}
                disabled={previewLoading || !previewContent}
                className="bg-primary"
              >
                <FileText className="h-4 w-4 mr-1" />
                Create as Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
