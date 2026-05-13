import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAiImage(prompt: string, enabled = false) {
  return useQuery({
    queryKey: ["ai-image", prompt],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("blog-ai-assistant", {
        body: { action: "generate_image", title: prompt },
      });
      if (error) throw error;
      return (data?.imageUrl as string) || null;
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}
