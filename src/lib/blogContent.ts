// Helper functions for handling blog post JSONB content

export interface BlogContent {
  type: 'markdown' | 'html' | 'json';
  body: string;
}

/**
 * Strip code fences and extract clean content from potentially wrapped AI output
 */
function cleanAIContent(raw: string): string {
  let cleaned = raw.trim();

  // Strip AI preamble lines (e.g. "Okay, here's a blog post about...")
  // These are conversational sentences the AI prepends before the actual content.
  // Loop to strip multiple preamble lines in a row.
  for (let p = 0; p < 5; p++) {
    const before = cleaned;
    cleaned = cleaned.replace(
      /^(Okay|Sure|Here['']?s|Certainly|Alright|Great|Of course|Absolutely|Below|I['']?ve|This|Let me|Here is|Here are)[^\n]{0,600}\n+/i,
      ''
    ).trim();
    if (cleaned === before) break;
  }

  // Unwrap nested AI payload formats (code fences, JSON string, {content}, {body}, etc.)
  for (let i = 0; i < 4; i++) {
    cleaned = cleaned
      .replace(/```json\s*/gi, '')
      .replace(/```markdown\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const objStart = cleaned.indexOf('{');
    const objEnd = cleaned.lastIndexOf('}');
    if (objStart === -1 || objEnd <= objStart) break;

    // Try to parse JSON – literal newlines inside string values break JSON.parse,
    // so we sanitise them first.
    const rawJson = cleaned.slice(objStart, objEnd + 1);
    const sanitisedJson = rawJson.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');

    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      try {
        parsed = JSON.parse(sanitisedJson);
      } catch {
        // JSON.parse failed (likely unescaped quotes in values).
        // Use regex to extract the "content" field as a fallback.
        const contentMatch = rawJson.match(/"content"\s*:\s*"([\s\S]*?)"\s*,\s*"(?:excerpt|seo_title|seo_description|title)/);
        if (contentMatch) {
          cleaned = contentMatch[1];
          continue;
        }
        // Try to grab content up to the last sensible boundary
        const contentMatch2 = rawJson.match(/"content"\s*:\s*"([\s\S]*)"\s*\}?\s*$/);
        if (contentMatch2) {
          cleaned = contentMatch2[1];
          continue;
        }
        break;
      }
    }

      if (typeof parsed === 'string') {
        cleaned = parsed;
        continue;
      }

      if (typeof parsed?.content === 'string') {
        cleaned = parsed.content;
        continue;
      }

      if (typeof parsed?.body === 'string') {
        cleaned = parsed.body;
        continue;
      }

      break;
  }

  // Restore literal \n sequences back to real newlines (from sanitised JSON parse)
  cleaned = cleaned.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');

  // Remove dollar signs from content (e.g. "$500" → "500")
  cleaned = cleaned.replace(/\$/g, '');

  // Convert [LINK: /path/] placeholders to markdown links
  cleaned = cleaned.replace(/\[LINK:\s*([^\]]+)\]/g, (_, path) => {
    const cleanPath = path.trim().replace(/\/$/, '');
    const label = cleanPath.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || cleanPath;
    return `[${label}](${cleanPath})`;
  });

  // Keep blog interlinking internal-only by removing external markdown links
  cleaned = cleaned.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, '$1');

  return cleaned;
}

/**
 * Extract the text body from JSONB content
 * Handles both new JSONB format and legacy string format
 */
export function getContentBody(content: unknown): string {
  if (!content) return '';
  
  // Handle legacy string content
  if (typeof content === 'string') {
    return cleanAIContent(content);
  }
  
  // Handle JSONB object format
  if (typeof content === 'object' && content !== null) {
    const jsonContent = content as Record<string, unknown>;
    if (typeof jsonContent.body === 'string') {
      return cleanAIContent(jsonContent.body);
    }
    // If it's just a plain object, try to stringify it
    return JSON.stringify(content);
  }
  
  return '';
}

/**
 * Create a JSONB content object from a string
 */
export function createContentObject(body: string, type: 'markdown' | 'html' | 'json' = 'markdown'): BlogContent {
  return {
    type,
    body,
  };
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: unknown): number {
  const body = getContentBody(content);
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
