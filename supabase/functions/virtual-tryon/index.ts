import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
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

    // Validate image formats - Gemini doesn't support GIF
    const isValidFormat = (dataUrl: string): boolean => {
      const mimeMatch = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,/);
      if (!mimeMatch) return false;
      const mime = mimeMatch[1].toLowerCase();
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mime);
    };

    if (!isValidFormat(userPhoto)) {
      console.error("Invalid user photo format");
      return new Response(
        JSON.stringify({ error: "User photo format not supported. Please use JPG, PNG, or WebP." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidFormat(clothingPhoto)) {
      console.error("Invalid clothing photo format");
      return new Response(
        JSON.stringify({ error: "Clothing photo format not supported. Please use JPG, PNG, or WebP." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Starting virtual try-on with Gemini 3...");
    console.log("Category:", category || "upper_body");
    console.log("Description:", garmentDescription || "clothing item");

    const categoryDescriptions: Record<string, string> = {
      upper_body: "top, shirt, or upper body garment",
      lower_body: "pants, skirt, or lower body garment",
      dresses: "dress or full body outfit"
    };

    const garmentType = categoryDescriptions[category] || categoryDescriptions.upper_body;
    const description = garmentDescription || "the clothing item";

    const prompt = `You are a professional fashion AI. Create a realistic virtual try-on image.

Take the person from the first image and dress them in the ${garmentType} shown in the second image (${description}).

Requirements:
- Keep the person's face, body shape, pose, and background exactly the same
- Replace only the ${garmentType} area with the clothing from the second image
- Make the clothing fit naturally on the person's body
- Maintain realistic lighting, shadows, and fabric draping
- The result should look like a real photograph, not edited

Generate a single photorealistic image of the person wearing the new clothing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: userPhoto } },
              { type: "image_url", image_url: { url: clothingPhoto } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("AI response received");

    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!generatedImage) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No image was generated. Please try with different photos." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Virtual try-on completed successfully!");

    return new Response(
      JSON.stringify({ 
        success: true,
        image: generatedImage,
        message: "Virtual try-on generated successfully!"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
