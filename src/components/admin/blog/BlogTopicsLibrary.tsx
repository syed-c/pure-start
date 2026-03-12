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
  // CATEGORY 1 — DUBAI AREA + SERVICE
  { id: 1, title: "Best Dental Implants in Dubai Marina — Cost, Clinics & DHA Guide 2026", primaryKeyword: "dental implants dubai marina", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 2000, month: 2 },
  { id: 2, title: "Invisalign in Downtown Dubai — Costs, Clinics & What to Expect 2026", primaryKeyword: "invisalign downtown dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 2000, month: 2 },
  { id: 3, title: "Emergency Dentist in Deira Dubai — 24-Hour Clinics & Walk-In Guide", primaryKeyword: "emergency dentist deira dubai", intent: "Transactional", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 2 },
  { id: 4, title: "Teeth Whitening in JBR Dubai — Laser, Zoom & Home Kit Prices (AED)", primaryKeyword: "teeth whitening jbr dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 2 },
  { id: 5, title: "Hollywood Smile Veneers in Business Bay — Cost & Top Clinics 2026", primaryKeyword: "veneers business bay dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 2000, month: 1 },
  { id: 6, title: "Pediatric Dentist in Mirdif Dubai — Child-Friendly Clinics Guide 2026", primaryKeyword: "pediatric dentist mirdif dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 2 },
  { id: 7, title: "Root Canal Treatment in Bur Dubai — Cost, Clinics & Recovery 2026", primaryKeyword: "root canal bur dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 2 },
  { id: 8, title: "Braces & Orthodontist in Al Barsha Dubai — Prices & Options 2026", primaryKeyword: "orthodontist al barsha dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 2000, month: 2 },
  { id: 9, title: "Dental Cleaning & Scaling in Karama Dubai — AED Prices & Clinics", primaryKeyword: "dental cleaning karama dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 800, month: 9 },
  { id: 10, title: "Wisdom Tooth Extraction in JLT Dubai — Cost & Recovery Guide 2026", primaryKeyword: "wisdom tooth extraction jlt dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 2 },
  { id: 11, title: "Dental Implants in Jumeirah Dubai — Premium Clinics & AED Pricing", primaryKeyword: "dental implants jumeirah", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 2000, month: 2 },
  { id: 12, title: "Gum Disease Treatment in Al Nahda Dubai — Periodontist Guide", primaryKeyword: "gum disease treatment al nahda dubai", intent: "Informational", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },
  { id: 13, title: "Dental Crowns & Bridges in DIFC Dubai — Cost for Corporate Expats", primaryKeyword: "dental crowns difc dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 2 },
  { id: 14, title: "Children's Dentist in Arabian Ranches — Family Dental Guide 2026", primaryKeyword: "childrens dentist arabian ranches", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },
  { id: 15, title: "Invisalign in Dubai Hills — Clear Aligner Clinics & Costs 2026", primaryKeyword: "invisalign dubai hills", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },
  { id: 16, title: "Emergency Dentist in International City Dubai — Affordable 24/7 Care", primaryKeyword: "emergency dentist international city", intent: "Transactional", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 2 },
  { id: 17, title: "Teeth Whitening in Palm Jumeirah — Luxury Dental Clinics 2026", primaryKeyword: "teeth whitening palm jumeirah", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },
  { id: 18, title: "Dental Implants in Silicon Oasis Dubai — Affordable Options 2026", primaryKeyword: "dental implants silicon oasis", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },
  { id: 19, title: "Veneers in Al Quoz Dubai — Budget-Friendly Hollywood Smile 2026", primaryKeyword: "veneers al quoz dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },
  { id: 20, title: "Root Canal in Discovery Gardens Dubai — Clinics & AED Costs 2026", primaryKeyword: "root canal discovery gardens dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },
  { id: 21, title: "Braces for Kids in JVC Dubai — Orthodontic Clinics & Prices 2026", primaryKeyword: "braces jvc dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },
  { id: 22, title: "Dental Cleaning in Motor City Dubai — Preventive Care Guide 2026", primaryKeyword: "dental cleaning motor city dubai", intent: "Informational", category: "Dubai Area + Service", priority: "Low", wordCount: 800, month: 9 },
  { id: 23, title: "Dental Implants in Sports City Dubai — Clinics Near You 2026", primaryKeyword: "dental implants sports city dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "Low", wordCount: 1200, month: 9 },
  { id: 24, title: "Pediatric Dentist in Damac Hills Dubai — Kids' Dental Care 2026", primaryKeyword: "pediatric dentist damac hills", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },
  { id: 25, title: "Wisdom Tooth Removal in Deira — What to Expect & Cost 2026", primaryKeyword: "wisdom tooth deira dubai", intent: "Commercial", category: "Dubai Area + Service", priority: "Med", wordCount: 1200, month: 9 },

  // CATEGORY 2 — UAE COST & PRICING GUIDES
  { id: 26, title: "Dental Implant Cost in Dubai vs Abu Dhabi vs Sharjah — AED Comparison 2026", primaryKeyword: "dental implant cost uae", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 2000, month: 1 },
  { id: 27, title: "How Much Does Invisalign Cost in UAE 2026 — Complete AED Price Guide", primaryKeyword: "invisalign cost uae 2026", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 2000, month: 1 },
  { id: 28, title: "Teeth Whitening Prices Across All Dubai Areas — AED Price Map 2026", primaryKeyword: "teeth whitening price dubai", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 2000, month: 3 },
  { id: 29, title: "Cheapest DHA-Licensed Dentists in Dubai — Quality Care Under 200 AED", primaryKeyword: "cheapest dentist dubai dha licensed", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 1200, month: 2 },
  { id: 30, title: "Are Sharjah Dental Clinics Cheaper Than Dubai? Honest AED Comparison", primaryKeyword: "sharjah dental clinics cheaper than dubai", intent: "Informational", category: "Cost & Pricing", priority: "High", wordCount: 1200, month: 3 },
  { id: 31, title: "Dental Veneers Cost UAE 2026 — E-Max vs Composite vs Porcelain (AED)", primaryKeyword: "dental veneers cost uae", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 2000, month: 1 },
  { id: 32, title: "Cost of Braces in UAE 2026 — Metal, Ceramic, Lingual & Invisalign Compared", primaryKeyword: "braces cost uae 2026", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 2000, month: 3 },
  { id: 33, title: "Root Canal Cost in Dubai 2026 — Front Tooth vs Molar AED Prices", primaryKeyword: "root canal cost dubai 2026", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 1200, month: 3 },
  { id: 34, title: "Dental Crown Prices in Abu Dhabi 2026 — Zirconia vs PFM vs Gold", primaryKeyword: "dental crown cost abu dhabi", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 1200, month: 3 },
  { id: 35, title: "Full Mouth Reconstruction Cost in UAE 2026 — What to Budget in AED", primaryKeyword: "full mouth reconstruction cost uae", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 2000, month: 3 },

  // CATEGORY 3 — UAE INSURANCE
  { id: 36, title: "Which UAE Dental Insurance Covers Implants? Complete 2026 Guide", primaryKeyword: "dental insurance covers implants uae", intent: "Informational", category: "Insurance", priority: "High", wordCount: 2000, month: 4 },
  { id: 37, title: "Does Daman Basic Cover Dental Treatment? What Expats Must Know 2026", primaryKeyword: "daman basic dental coverage", intent: "Informational", category: "Insurance", priority: "High", wordCount: 1200, month: 4 },
  { id: 38, title: "AXA Dental Insurance UAE — What Is and Is Not Covered in 2026", primaryKeyword: "axa dental insurance uae", intent: "Informational", category: "Insurance", priority: "Med", wordCount: 1200, month: 4 },
  { id: 39, title: "Cigna Dental Coverage UAE — Complete Expat Guide 2026", primaryKeyword: "cigna dental coverage uae", intent: "Informational", category: "Insurance", priority: "Med", wordCount: 1200, month: 4 },
  { id: 40, title: "MetLife Dental Plan UAE — Benefits, Limits & Claiming Guide 2026", primaryKeyword: "metlife dental plan uae", intent: "Informational", category: "Insurance", priority: "Med", wordCount: 1200, month: 4 },
  { id: 41, title: "How to Claim Dental Treatment on UAE Insurance — Step-by-Step 2026", primaryKeyword: "claim dental insurance uae", intent: "Informational", category: "Insurance", priority: "High", wordCount: 1200, month: 4 },
  { id: 42, title: "Best Dental Insurance in UAE for Families 2026 — Plans Compared", primaryKeyword: "best dental insurance uae families", intent: "Commercial", category: "Insurance", priority: "High", wordCount: 2000, month: 1 },
  { id: 43, title: "Which Dubai Clinics Accept Daman Health Insurance? 2026 Guide", primaryKeyword: "dubai clinics daman health", intent: "Transactional", category: "Insurance", priority: "High", wordCount: 1200, month: 4 },
  { id: 44, title: "Free Dental Treatment in UAE 2026 — Who Qualifies & Where to Go", primaryKeyword: "free dental treatment uae", intent: "Informational", category: "Insurance", priority: "High", wordCount: 1200, month: 1 },
  { id: 45, title: "ADNIC Dental Insurance Review — Coverage & Limits in UAE 2026", primaryKeyword: "adnic dental insurance uae", intent: "Informational", category: "Insurance", priority: "Low", wordCount: 1200, month: 4 },
  { id: 46, title: "Noor Takaful Dental Coverage — UAE Islamic Insurance Guide 2026", primaryKeyword: "noor takaful dental coverage uae", intent: "Informational", category: "Insurance", priority: "Low", wordCount: 1200, month: 4 },
  { id: 47, title: "Does DHA Insurance Cover Orthodontics in Dubai? 2026 Update", primaryKeyword: "dha insurance orthodontics dubai", intent: "Informational", category: "Insurance", priority: "Med", wordCount: 1200, month: 4 },
  { id: 48, title: "Dental Coverage for Domestic Workers in UAE — Employer Guide 2026", primaryKeyword: "dental coverage domestic workers uae", intent: "Informational", category: "Insurance", priority: "Med", wordCount: 1200, month: 4 },

  // CATEGORY 4 — EXPAT & NATIONALITY
  { id: 49, title: "Best Hindi-Speaking Indian Dentists in Dubai — Verified Clinics 2026", primaryKeyword: "hindi speaking dentist dubai", intent: "Commercial", category: "Expat & Community", priority: "High", wordCount: 1200, month: 2 },
  { id: 50, title: "Filipino Dentists in Dubai — Tagalog-Speaking Clinics Guide 2026", primaryKeyword: "filipino dentist dubai tagalog", intent: "Commercial", category: "Expat & Community", priority: "High", wordCount: 1200, month: 2 },
  { id: 51, title: "Russian-Speaking Dentists in Dubai — Where to Find Them 2026", primaryKeyword: "russian speaking dentist dubai", intent: "Commercial", category: "Expat & Community", priority: "Med", wordCount: 1200, month: 11 },
  { id: 52, title: "Arabic-Speaking Dentists for Expats in UAE — Trusted Clinics 2026", primaryKeyword: "arabic speaking dentist uae", intent: "Commercial", category: "Expat & Community", priority: "Med", wordCount: 1200, month: 11 },
  { id: 53, title: "Best Dentist in International City for Expat Communities 2026", primaryKeyword: "dentist international city dubai expats", intent: "Commercial", category: "Expat & Community", priority: "High", wordCount: 1200, month: 2 },
  { id: 54, title: "Pakistani & Urdu-Speaking Dentists in Dubai — Complete List 2026", primaryKeyword: "urdu speaking dentist dubai", intent: "Commercial", category: "Expat & Community", priority: "High", wordCount: 1200, month: 2 },
  { id: 55, title: "British-Standard Dentists in Dubai — UK-Trained Clinics 2026", primaryKeyword: "british dentist dubai uk trained", intent: "Commercial", category: "Expat & Community", priority: "Med", wordCount: 1200, month: 11 },
  { id: 56, title: "Best Dentist for Indian Expat Families with Children in Dubai 2026", primaryKeyword: "dentist indian families dubai", intent: "Commercial", category: "Expat & Community", priority: "Med", wordCount: 1200, month: 11 },
  { id: 57, title: "Best Dentist Near DIFC for Corporate Expats — Lunch-Hour Visits 2026", primaryKeyword: "dentist near difc dubai", intent: "Transactional", category: "Expat & Community", priority: "High", wordCount: 1200, month: 2 },
  { id: 58, title: "Dental Tourism in UAE 2026 — Is It Worth It vs Flying Home?", primaryKeyword: "dental tourism uae", intent: "Informational", category: "Expat & Community", priority: "High", wordCount: 2000, month: 1 },

  // CATEGORY 5 — REGULATORY
  { id: 59, title: "DHA vs DOH vs MOHAP License — UAE Dental Licensing Explained 2026", primaryKeyword: "dha doh mohap license difference", intent: "Informational", category: "Regulatory", priority: "High", wordCount: 2000, month: 1 },
  { id: 60, title: "How to Verify Your Dentist Is DHA Licensed in Dubai 2026", primaryKeyword: "verify dha licensed dentist dubai", intent: "Informational", category: "Regulatory", priority: "High", wordCount: 1200, month: 1 },
  { id: 61, title: "What Happens If You Visit an Unlicensed Dentist in UAE?", primaryKeyword: "unlicensed dentist uae risks", intent: "Informational", category: "Regulatory", priority: "High", wordCount: 1200, month: 8 },
  { id: 62, title: "How DHA Regulates Dental Clinics in Dubai — Patient Rights 2026", primaryKeyword: "dha dental clinic regulation dubai", intent: "Informational", category: "Regulatory", priority: "Med", wordCount: 1200, month: 8 },
  { id: 63, title: "DOH Dental Regulations in Abu Dhabi — What Patients Should Know", primaryKeyword: "doh dental regulations abu dhabi", intent: "Informational", category: "Regulatory", priority: "Med", wordCount: 1200, month: 8 },
  { id: 64, title: "How to File a Complaint Against a Dentist in UAE — Step by Step", primaryKeyword: "complaint against dentist uae", intent: "Informational", category: "Regulatory", priority: "High", wordCount: 1200, month: 8 },
  { id: 65, title: "MOHAP Dental Rules for Northern Emirates — Sharjah, Ajman, RAK 2026", primaryKeyword: "mohap dental rules northern emirates", intent: "Informational", category: "Regulatory", priority: "Med", wordCount: 1200, month: 8 },
  { id: 66, title: "Specialist vs General Dentist in UAE — When You Need a Referral", primaryKeyword: "specialist vs general dentist uae", intent: "Informational", category: "Regulatory", priority: "Med", wordCount: 1200, month: 8 },
  { id: 67, title: "How to Check If a Clinic Is DOH Approved in Abu Dhabi 2026", primaryKeyword: "check clinic doh approved abu dhabi", intent: "Informational", category: "Regulatory", priority: "Med", wordCount: 800, month: 8 },

  // CATEGORY 6 — OTHER EMIRATES
  { id: 68, title: "Best Dentists in Khalidiyah Abu Dhabi — Top Clinics & Prices 2026", primaryKeyword: "dentist khalidiyah abu dhabi", intent: "Commercial", category: "Other Emirates", priority: "High", wordCount: 1200, month: 5 },
  { id: 69, title: "Dental Implants in Al Ain — Affordable Clinics & AED Cost Guide 2026", primaryKeyword: "dental implants al ain", intent: "Commercial", category: "Other Emirates", priority: "Med", wordCount: 1200, month: 5 },
  { id: 70, title: "Invisalign in Al Reem Island Abu Dhabi — Clinics & Costs 2026", primaryKeyword: "invisalign al reem island abu dhabi", intent: "Commercial", category: "Other Emirates", priority: "Med", wordCount: 1200, month: 5 },
  { id: 71, title: "Emergency Dentist in Sharjah Al Nahda — 24-Hour Clinics 2026", primaryKeyword: "emergency dentist sharjah al nahda", intent: "Transactional", category: "Other Emirates", priority: "High", wordCount: 1200, month: 5 },
  { id: 72, title: "Best Pediatric Dentist in Sharjah — Child-Friendly Clinics 2026", primaryKeyword: "pediatric dentist sharjah", intent: "Commercial", category: "Other Emirates", priority: "Med", wordCount: 1200, month: 5 },
  { id: 73, title: "Teeth Whitening in Ajman — Affordable Clinics & AED Prices 2026", primaryKeyword: "teeth whitening ajman", intent: "Commercial", category: "Other Emirates", priority: "Med", wordCount: 1200, month: 5 },
  { id: 74, title: "Dental Clinics in Ras Al Khaimah — Top 10 Licensed Options 2026", primaryKeyword: "dental clinics ras al khaimah", intent: "Commercial", category: "Other Emirates", priority: "Med", wordCount: 1200, month: 5 },
  { id: 75, title: "Best Dentist in Fujairah — MOHAP-Licensed Care Guide 2026", primaryKeyword: "dentist fujairah", intent: "Commercial", category: "Other Emirates", priority: "Low", wordCount: 1200, month: 5 },
  { id: 76, title: "Dental Implants in Sharjah Al Majaz — Clinics & Costs 2026", primaryKeyword: "dental implants sharjah al majaz", intent: "Commercial", category: "Other Emirates", priority: "Med", wordCount: 1200, month: 5 },
  { id: 77, title: "Veneers in Abu Dhabi Corniche — Premium Smile Makeover Clinics 2026", primaryKeyword: "veneers abu dhabi corniche", intent: "Commercial", category: "Other Emirates", priority: "Med", wordCount: 1200, month: 5 },

  // CATEGORY 7 — SYMPTOM & EMERGENCY
  { id: 78, title: "Toothache at Night in Dubai — What to Do & Where to Go Now 2026", primaryKeyword: "toothache at night dubai", intent: "Transactional", category: "Symptom & Emergency", priority: "High", wordCount: 1200, month: 6 },
  { id: 79, title: "Dental Emergency in Dubai — 24-Hour Clinics by Area 2026", primaryKeyword: "dental emergency dubai 24 hours", intent: "Transactional", category: "Symptom & Emergency", priority: "High", wordCount: 2000, month: 1 },
  { id: 80, title: "Broken Tooth in Dubai — Emergency Dentist & Cost Guide 2026", primaryKeyword: "broken tooth dubai emergency", intent: "Transactional", category: "Symptom & Emergency", priority: "High", wordCount: 1200, month: 6 },
  { id: 81, title: "Sensitive Teeth Treatment in Dubai 2026 — Options & AED Costs", primaryKeyword: "sensitive teeth treatment dubai", intent: "Informational", category: "Symptom & Emergency", priority: "Med", wordCount: 1200, month: 6 },
  { id: 82, title: "Bad Breath Causes & Treatment — Dubai Dentists Explain 2026", primaryKeyword: "bad breath treatment dubai", intent: "Informational", category: "Symptom & Emergency", priority: "Med", wordCount: 1200, month: 6 },
  { id: 83, title: "Teeth Grinding (Bruxism) Treatment in UAE — Night Guard & More", primaryKeyword: "bruxism treatment uae", intent: "Informational", category: "Symptom & Emergency", priority: "Med", wordCount: 1200, month: 6 },
  { id: 84, title: "Dental Abscess in Dubai — Cost, Treatment & When to Rush to ER", primaryKeyword: "dental abscess treatment dubai", intent: "Informational", category: "Symptom & Emergency", priority: "High", wordCount: 1200, month: 6 },

  // CATEGORY 8 — COSMETIC
  { id: 85, title: "Hollywood Smile in Dubai — Complete AED Cost Guide 2026", primaryKeyword: "hollywood smile cost dubai 2026", intent: "Commercial", category: "Cosmetic Dentistry", priority: "High", wordCount: 2000, month: 1 },
  { id: 86, title: "Veneers in Dubai: E-Max vs Composite vs Lumineers Compared 2026", primaryKeyword: "veneers dubai emax composite lumineers", intent: "Commercial", category: "Cosmetic Dentistry", priority: "High", wordCount: 2000, month: 1 },
  { id: 87, title: "Teeth Whitening in Dubai: Laser vs Zoom vs Home Kit 2026", primaryKeyword: "teeth whitening dubai laser zoom", intent: "Commercial", category: "Cosmetic Dentistry", priority: "High", wordCount: 1200, month: 1 },
  { id: 88, title: "Smile Makeover in Dubai — What Does It Actually Cost in AED? 2026", primaryKeyword: "smile makeover cost dubai", intent: "Commercial", category: "Cosmetic Dentistry", priority: "High", wordCount: 2000, month: 3 },
  { id: 89, title: "Invisalign vs Braces in Dubai — Cost, Time & Results Compared 2026", primaryKeyword: "invisalign vs braces dubai", intent: "Commercial", category: "Cosmetic Dentistry", priority: "High", wordCount: 2000, month: 1 },
  { id: 90, title: "Gummy Smile Treatment in Dubai — Gingival Contouring Cost 2026", primaryKeyword: "gummy smile treatment dubai", intent: "Commercial", category: "Cosmetic Dentistry", priority: "Med", wordCount: 1200, month: 6 },
  { id: 91, title: "Same-Day Veneers in Dubai — CEREC Clinics & AED Prices 2026", primaryKeyword: "same day veneers dubai", intent: "Commercial", category: "Cosmetic Dentistry", priority: "Med", wordCount: 1200, month: 6 },

  // CATEGORY 9 — CHILDREN & FAMILY
  { id: 92, title: "Best Pediatric Dentists in Dubai for Toddlers & Young Children 2026", primaryKeyword: "pediatric dentist dubai toddlers", intent: "Commercial", category: "Children & Family", priority: "High", wordCount: 2000, month: 4 },
  { id: 93, title: "Child's First Dental Visit in UAE — Age, What to Expect & Cost", primaryKeyword: "first dental visit child uae", intent: "Informational", category: "Children & Family", priority: "High", wordCount: 1200, month: 4 },
  { id: 94, title: "Dental Anxiety in Children — Dubai Clinics with Sedation Options", primaryKeyword: "dental anxiety children dubai", intent: "Informational", category: "Children & Family", priority: "Med", wordCount: 1200, month: 7 },
  { id: 95, title: "Braces for Teenagers in Dubai — Cost, Options & Best Age 2026", primaryKeyword: "braces teenagers dubai cost", intent: "Commercial", category: "Children & Family", priority: "High", wordCount: 1200, month: 4 },
  { id: 96, title: "Family Dental Packages in Dubai — Clinics with Group Discounts 2026", primaryKeyword: "family dental packages dubai", intent: "Commercial", category: "Children & Family", priority: "Med", wordCount: 1200, month: 7 },

  // CATEGORY 10 — SEASONAL
  { id: 97, title: "Best Dental Deals in Dubai During Ramadan 2026", primaryKeyword: "dental deals dubai ramadan 2026", intent: "Commercial", category: "Seasonal & Trending", priority: "High", wordCount: 1200, month: 7 },
  { id: 98, title: "Pre-Wedding Smile Makeover Checklist — Dubai Brides & Grooms 2026", primaryKeyword: "pre wedding smile makeover dubai", intent: "Commercial", category: "Seasonal & Trending", priority: "Med", wordCount: 1200, month: 7 },
  { id: 99, title: "Dental Care Tips During Ramadan Fasting in UAE 2026", primaryKeyword: "dental care ramadan fasting uae", intent: "Informational", category: "Seasonal & Trending", priority: "Med", wordCount: 800, month: 7 },
  { id: 100, title: "Back-to-School Dental Checkup Guide for Dubai Parents 2026", primaryKeyword: "back to school dental checkup dubai", intent: "Informational", category: "Seasonal & Trending", priority: "Med", wordCount: 800, month: 7 },

  // BONUS — ADDITIONAL HIGH-PRIORITY
  { id: 101, title: "All-on-4 Dental Implants in Dubai — Cost & Best Clinics 2026", primaryKeyword: "all on 4 implants dubai", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 2000, month: 3 },
  { id: 102, title: "Dental Implants vs Dentures in Dubai — Pros, Cons & AED Cost 2026", primaryKeyword: "implants vs dentures dubai", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 2000, month: 3 },
  { id: 103, title: "How to Choose the Right Dentist in Dubai — 10-Point Checklist", primaryKeyword: "how to choose dentist dubai", intent: "Informational", category: "Regulatory", priority: "High", wordCount: 2000, month: 1 },
  { id: 104, title: "Dental Tourism Dubai vs Turkey vs Thailand — AED Cost Comparison 2026", primaryKeyword: "dental tourism dubai vs turkey", intent: "Informational", category: "Cost & Pricing", priority: "High", wordCount: 2000, month: 1 },
  { id: 105, title: "Same-Day Dental Implants in Dubai — Is It Really Possible? 2026", primaryKeyword: "same day dental implants dubai", intent: "Commercial", category: "Cosmetic Dentistry", priority: "High", wordCount: 1200, month: 3 },
  { id: 106, title: "Dental Bridge vs Implant in Dubai — Which Is Right for You? 2026", primaryKeyword: "dental bridge vs implant dubai", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 1200, month: 10 },
  { id: 107, title: "Best Orthodontist in Dubai for Adults — Discreet Braces Options 2026", primaryKeyword: "orthodontist dubai adults", intent: "Commercial", category: "Cosmetic Dentistry", priority: "High", wordCount: 1200, month: 6 },
  { id: 108, title: "Best Cosmetic Dentist in Dubai — How to Choose & Top Picks 2026", primaryKeyword: "best cosmetic dentist dubai", intent: "Commercial", category: "Cosmetic Dentistry", priority: "High", wordCount: 2000, month: 6 },
  { id: 109, title: "Dental Check-Up Cost in Dubai 2026 — What's Included?", primaryKeyword: "dental check up cost dubai 2026", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 1200, month: 3 },
  { id: 110, title: "Best Dental Clinic Near Dubai Mall — Walk-In & Appointment 2026", primaryKeyword: "dental clinic near dubai mall", intent: "Transactional", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 9 },
  { id: 111, title: "Root Canal vs Extraction in Dubai — When to Save the Tooth 2026", primaryKeyword: "root canal vs extraction dubai", intent: "Informational", category: "Regulatory", priority: "High", wordCount: 1200, month: 10 },
  { id: 112, title: "Best Dental Clinic Open on Friday in Dubai 2026", primaryKeyword: "dental clinic open friday dubai", intent: "Transactional", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 9 },
  { id: 113, title: "Emergency Dental Clinics in Abu Dhabi — Open 24/7 List 2026", primaryKeyword: "emergency dental clinic abu dhabi 24", intent: "Transactional", category: "Other Emirates", priority: "High", wordCount: 1200, month: 5 },
  { id: 114, title: "Full Set of Veneers (Upper & Lower) Cost in Dubai 2026", primaryKeyword: "full set veneers cost dubai", intent: "Commercial", category: "Cost & Pricing", priority: "High", wordCount: 1200, month: 3 },
  { id: 115, title: "Composite Veneers vs Porcelain in Dubai — AED Price & Durability 2026", primaryKeyword: "composite vs porcelain veneers dubai", intent: "Commercial", category: "Cosmetic Dentistry", priority: "High", wordCount: 1200, month: 6 },
  { id: 116, title: "Best Dental Clinic in Deira for Budget Dental Work 2026", primaryKeyword: "best dental clinic deira budget", intent: "Commercial", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 9 },
  { id: 117, title: "Dental Implant Brands Used in UAE — Nobel, Straumann & More 2026", primaryKeyword: "dental implant brands uae", intent: "Informational", category: "Regulatory", priority: "Med", wordCount: 1200, month: 8 },
  { id: 118, title: "Best Dental Clinics Near Dubai Metro — Walk-In Friendly 2026", primaryKeyword: "dental clinic near dubai metro", intent: "Transactional", category: "Dubai Area + Service", priority: "High", wordCount: 1200, month: 2 },
  { id: 119, title: "Dentures in Dubai — Types, Cost & Best Clinics 2026", primaryKeyword: "dentures dubai cost", intent: "Commercial", category: "Cost & Pricing", priority: "Med", wordCount: 1200, month: 10 },
  { id: 120, title: "Dental Fillings in Dubai — Amalgam vs Composite vs Ceramic Cost 2026", primaryKeyword: "dental fillings dubai cost", intent: "Commercial", category: "Cost & Pricing", priority: "Med", wordCount: 1200, month: 10 },
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
