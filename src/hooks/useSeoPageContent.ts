import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeStateSlug } from "@/lib/slug/normalizeStateSlug";

export interface SeoPageContent {
  id: string;
  slug: string;
  page_type: string;
  title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  content: string | null;
  og_title: string | null;
  og_description: string | null;
  is_optimized: boolean;
  faq_json?: { question: string; answer: string }[] | null;
  faqs?: { question: string; answer: string }[] | null;
}

export function useSeoPageContent(slug: string | undefined) {
  return useQuery({
    queryKey: ["seo-page-content", slug],
    queryFn: async (): Promise<SeoPageContent | null> => {
      if (!slug) return null;

      try {
        const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
        const parts = normalizedSlug.split("/").filter(Boolean);
        const normalizedStatefulSlug =
          parts.length >= 1
            ? [normalizeStateSlug(parts[0]), ...parts.slice(1)].join("/")
            : normalizedSlug;

        const withTrailingSlash = (s: string) => (s.endsWith("/") ? s : `${s}/`);
        const withoutTrailingSlash = (s: string) => s.replace(/\/+$/g, "");

        const candidates = Array.from(
          new Set([
            normalizedSlug,
            `/${normalizedSlug}`,
            normalizedStatefulSlug,
            `/${normalizedStatefulSlug}`,
            withTrailingSlash(normalizedSlug),
            withTrailingSlash(`/${normalizedSlug}`),
            withoutTrailingSlash(normalizedSlug),
            `/${withoutTrailingSlash(normalizedSlug)}`,
          ].filter(Boolean))
        );

        const { data, error } = await supabase
          .from("seo_pages")
          .select("*")
          .in("slug", candidates)
          .not("content", "is", null)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) return null;

        const parseFaqs = (rawFaqs: unknown): { question: string; answer: string }[] | null => {
          if (!rawFaqs || !Array.isArray(rawFaqs)) return null;
          const validated = rawFaqs.filter(
            (item): item is { question: string; answer: string } =>
              typeof item === 'object' && item !== null &&
              typeof item.question === 'string' && typeof item.answer === 'string'
          );
          return validated.length > 0 ? validated : null;
        };

        if (data) {
          return { ...data, faqs: parseFaqs(data.faqs) } as SeoPageContent;
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function parseMarkdownContent(content: string | null): {
  intro: string;
  sections: { heading: string; content: string; level: number }[];
} {
  if (!content) return { intro: "", sections: [] };
  const lines = content.split("\n");
  let intro = "";
  const sections: { heading: string; content: string; level: number }[] = [];
  let currentSection: { heading: string; content: string; level: number } | null = null;
  let inIntro = true;

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);
    const htmlH2Match = line.match(/<h2[^>]*>(.+?)<\/h2>/i);
    const htmlH3Match = line.match(/<h3[^>]*>(.+?)<\/h3>/i);
    if (h2Match || htmlH2Match) {
      inIntro = false;
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: h2Match ? h2Match[1] : htmlH2Match![1], content: "", level: 2 };
    } else if (h3Match || htmlH3Match) {
      inIntro = false;
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: h3Match ? h3Match[1] : htmlH3Match![1], content: "", level: 3 };
    } else if (inIntro) {
      intro += line + "\n";
    } else if (currentSection) {
      currentSection.content += line + "\n";
    }
  }
  if (currentSection) sections.push(currentSection);
  return { intro: intro.trim(), sections };
}

export function parseFaqFromContent(
  content: string | null,
  faqJson?: { question: string; answer: string }[] | null
): { question: string; answer: string }[] {
  if (faqJson && Array.isArray(faqJson) && faqJson.length > 0) return faqJson;
  if (!content) return [];
  const faqs: { question: string; answer: string }[] = [];
  const lines = content.split("\n");
  let inFaqSection = false;
  let currentQuestion = "";
  let currentAnswer = "";

  for (const line of lines) {
    if (line.match(/^##\s*Frequently Asked Questions/i)) { inFaqSection = true; continue; }
    if (inFaqSection && line.match(/^## (?!Frequently)/)) {
      inFaqSection = false;
      if (currentQuestion && currentAnswer) faqs.push({ question: currentQuestion, answer: currentAnswer.trim() });
      continue;
    }
    if (inFaqSection) {
      const h3Match = line.match(/^### (.+)$/);
      if (h3Match) {
        if (currentQuestion && currentAnswer) faqs.push({ question: currentQuestion, answer: currentAnswer.trim() });
        currentQuestion = h3Match[1];
        currentAnswer = "";
      } else if (currentQuestion) {
        currentAnswer += line + "\n";
      }
    }
  }
  if (currentQuestion && currentAnswer) faqs.push({ question: currentQuestion, answer: currentAnswer.trim() });
  return faqs;
}
