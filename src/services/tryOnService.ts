import { supabase } from "@/integrations/supabase/client";

export interface TryOnResult {
  success: boolean;
  image?: string;
  message?: string;
  error?: string;
  details?: string;
}

export async function generateTryOn(
  userPhoto: string,
  clothingPhoto: string
): Promise<TryOnResult> {
  try {
    const { data, error } = await supabase.functions.invoke('virtual-tryon', {
      body: { userPhoto, clothingPhoto }
    });

    if (error) {
      console.error("Try-on function error:", error);
      return {
        success: false,
        error: error.message || "Failed to connect to AI service"
      };
    }

    if (data.error) {
      return {
        success: false,
        error: data.error,
        details: data.details
      };
    }

    return {
      success: true,
      image: data.image,
      message: data.message
    };
  } catch (err) {
    console.error("Try-on service error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred"
    };
  }
}
