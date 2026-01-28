import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// IDM-VTON model on Replicate
const IDM_VTON_MODEL = "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985";

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

    console.log("Starting IDM-VTON virtual try-on...");
    console.log("User photo size:", userPhoto.length);
    console.log("Clothing photo size:", clothingPhoto.length);
    console.log("Category:", category || "upper_body");

    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not configured");
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    // Create prediction with IDM-VTON model
    console.log("Creating Replicate prediction...");
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait"  // Wait for the result (up to 60 seconds)
      },
      body: JSON.stringify({
        version: "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
        input: {
          human_img: userPhoto,
          garm_img: clothingPhoto,
          garment_des: garmentDescription || "clothing item",
          category: category || "upper_body"
        }
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Replicate API error:", createResponse.status, errorText);
      
      if (createResponse.status === 401 || createResponse.status === 403) {
        return new Response(
          JSON.stringify({ error: "Invalid Replicate API token. Please check your API key." }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (createResponse.status === 422) {
        return new Response(
          JSON.stringify({ error: "Invalid input images. Please ensure both images are valid." }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Replicate API error: ${createResponse.status}`);
    }

    let prediction = await createResponse.json();
    console.log("Prediction created:", prediction.id, "Status:", prediction.status);

    // Poll for completion if not already done (Prefer: wait might timeout)
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5 seconds * 60)
    
    while (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
      if (attempts >= maxAttempts) {
        console.error("Prediction timed out after 5 minutes");
        return new Response(
          JSON.stringify({ error: "Generation timed out. Please try again with simpler images." }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        },
      });
      
      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.error("Poll error:", pollResponse.status, errorText);
        throw new Error(`Failed to poll prediction: ${pollResponse.status}`);
      }
      
      prediction = await pollResponse.json();
      console.log("Poll attempt", attempts + 1, "- Status:", prediction.status);
      attempts++;
    }

    if (prediction.status === "failed") {
      console.error("Prediction failed:", prediction.error);
      return new Response(
        JSON.stringify({ 
          error: "AI generation failed",
          details: prediction.error || "Unknown error during processing"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prediction.status === "canceled") {
      return new Response(
        JSON.stringify({ error: "Generation was canceled" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the output image URL
    const outputUrl = prediction.output;
    console.log("IDM-VTON generation successful! Output:", outputUrl);

    if (!outputUrl) {
      console.error("No output URL in prediction result");
      return new Response(
        JSON.stringify({ error: "No image was generated" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the generated image and convert to base64
    console.log("Fetching generated image...");
    const imageResponse = await fetch(outputUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch generated image");
    }
    
    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUrl = `data:image/png;base64,${base64}`;

    console.log("Virtual try-on completed successfully!");

    return new Response(
      JSON.stringify({ 
        success: true,
        image: dataUrl,
        message: "Virtual try-on generated successfully with IDM-VTON!"
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
