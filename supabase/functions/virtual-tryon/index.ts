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
    const { userPhoto, clothingPhoto } = await req.json();
    
    if (!userPhoto || !clothingPhoto) {
      console.error("Missing required images");
      return new Response(
        JSON.stringify({ error: "Both user photo and clothing photo are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Starting virtual try-on generation...");
    console.log("User photo size:", userPhoto.length);
    console.log("Clothing photo size:", clothingPhoto.length);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use Gemini's image generation model for the try-on
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a professional virtual try-on AI. Your task is to create a realistic image of the person wearing the clothing item.

INSTRUCTIONS:
1. Analyze the person's body pose, shape, and proportions from the first image
2. Extract the clothing item (shirt, pants, dress, etc.) from the second image
3. Generate a new image showing the person wearing this exact clothing item
4. The clothing must be properly warped to match the person's body pose and shape
5. Maintain the person's face, hair, skin tone, and background
6. Apply realistic shadows, folds, and wrinkles to the clothing
7. Ensure the lighting on the clothing matches the original photo's lighting
8. The result should look like a natural photograph, not a collage

IMPORTANT: Generate a full-body or half-body image (matching the input) showing the person naturally wearing the clothing.`
              },
              {
                type: "image_url",
                image_url: {
                  url: userPhoto
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: clothingPhoto
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");

    // Extract the generated image from the response
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!generatedImage) {
      console.error("No image generated in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate try-on image. The AI could not process the images.",
          details: textResponse || "No additional details available"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Virtual try-on image generated successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        image: generatedImage,
        message: textResponse || "Virtual try-on generated successfully!"
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
