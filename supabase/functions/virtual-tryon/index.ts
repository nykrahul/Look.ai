import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userPhoto, clothingPhoto, garmentDescription, category } = await req.json();
    
    if (!userPhoto || !clothingPhoto) {
      console.error("Missing required images");
      return new Response(
        JSON.stringify({ error: "Both user photo and clothing photo are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Virtual try-on request received");
    console.log("Category:", category || "upper_body");
    console.log("Description:", garmentDescription || "clothing item");

    // Placeholder response - AI integration removed
    return new Response(
      JSON.stringify({ 
        error: "Virtual try-on AI service not configured",
        details: "Please configure an AI provider to enable virtual try-on functionality"
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Virtual try-on error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
