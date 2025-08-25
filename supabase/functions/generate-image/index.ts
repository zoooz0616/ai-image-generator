import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageGenerationRequest {
  prompt: string
  aspect_ratio?: string
  safety_filter_level?: string
  output_format?: string
  conversation_id?: string
  message_id?: string
}

interface ReplicateResponse {
  id: string
  status: string
  output?: string
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const body: ImageGenerationRequest = await req.json()
    const { 
      prompt, 
      aspect_ratio = '4:3', 
      safety_filter_level = 'block_medium_and_above', 
      output_format = 'png',
      conversation_id,
      message_id
    } = body

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required and cannot be empty' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Replicate API token from environment
    const replicateToken = Deno.env.get('REPLICATE_API_TOKEN')
    if (!replicateToken) {
      return new Response(
        JSON.stringify({ error: 'Replicate API token not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🎨 Generating image with Imagen-4:', { 
      prompt, 
      aspect_ratio, 
      safety_filter_level, 
      output_format,
      user_id: user.id
    })

    const startTime = Date.now()

    // Create Replicate prediction
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${replicateToken}`,
      },
      body: JSON.stringify({
        version: 'google/imagen-4',
        input: {
          prompt: prompt.trim(),
          aspect_ratio,
          safety_filter_level,
          output_format,
        },
      }),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      console.error('❌ Replicate API error:', errorData)
      return new Response(
        JSON.stringify({ 
          error: errorData.error || `Replicate API error: ${createResponse.status}` 
        }),
        { 
          status: createResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const prediction = await createResponse.json()
    console.log('⏳ Prediction created:', prediction.id)

    // Poll for completion
    const maxAttempts = 60 // 5 minutes max (5s intervals)
    let attempts = 0

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateToken}`,
        },
      })

      if (!statusResponse.ok) {
        return new Response(
          JSON.stringify({ 
            error: `Failed to check prediction status: ${statusResponse.status}` 
          }),
          { 
            status: statusResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const result: ReplicateResponse = await statusResponse.json()
      console.log(`⏳ Prediction status: ${result.status} (attempt ${attempts + 1}/${maxAttempts})`)

      if (result.status === 'succeeded') {
        const generationTime = Date.now() - startTime
        console.log('✅ Image generated successfully:', result.output)

        // Save to generated_images table
        const { error: insertError } = await supabase
          .from('generated_images')
          .insert({
            user_id: user.id,
            conversation_id,
            message_id,
            prompt: prompt.trim(),
            image_url: result.output,
            aspect_ratio,
            safety_filter_level,
            output_format,
            model_used: 'imagen-4',
            generation_time_ms: generationTime,
          })

        if (insertError) {
          console.error('Failed to save generated image:', insertError)
          // Don't fail the request, just log the error
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            image_url: result.output,
            generation_time_ms: generationTime,
            prediction_id: prediction.id,
            metadata: {
              prompt,
              aspect_ratio,
              safety_filter_level,
              output_format,
              model_used: 'imagen-4'
            }
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (result.status === 'failed') {
        console.error('❌ Image generation failed:', result.error)
        return new Response(
          JSON.stringify({ 
            error: result.error || 'Image generation failed' 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (result.status === 'canceled') {
        console.warn('⚠️ Image generation was canceled')
        return new Response(
          JSON.stringify({ 
            error: 'Image generation was canceled' 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000))
      attempts++
    }

    console.error('⏰ Image generation timed out')
    return new Response(
      JSON.stringify({ 
        error: 'Image generation timed out. Please try again.' 
      }),
      { 
        status: 408,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error: ' + error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})