const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// CORS 설정
app.use(cors());
app.use(express.json());

// Replicate API 프록시
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspect_ratio = '4:3', safety_filter_level = 'block_medium_and_above', output_format = 'png' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Replicate API token not configured' });
    }
    
    console.log('🎨 Generating image with Imagen-4:', { prompt, aspect_ratio, safety_filter_level, output_format });

    // Call Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: '692f0c3b42eae32b7dc81c4da7ffbd6d6b2c9c107d2e46f74a4e23b43e37fccce',
        input: {
          prompt,
          aspect_ratio,
          safety_filter_level,
          output_format,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Replicate API error:', errorData);
      return res.status(response.status).json({ error: errorData.detail || errorData.error || 'Replicate API error' });
    }

    const prediction = await response.json();
    console.log('✅ Prediction created:', prediction.id);

    // Poll for completion
    let result = prediction;
    const maxAttempts = 60; // 60 seconds timeout
    let attempts = 0;

    while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        },
      });
      
      result = await pollResponse.json();
      console.log(`⏳ Status: ${result.status} (${attempts}/${maxAttempts})`);
    }

    if (result.status === 'failed') {
      console.error('Image generation failed:', result.error);
      return res.status(500).json({ error: result.error || 'Image generation failed' });
    }

    if (result.status === 'canceled' || attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Image generation timed out' });
    }

    if (!result.output || !result.output[0]) {
      return res.status(500).json({ error: 'No image URL returned from Replicate' });
    }

    console.log('✅ Image generated successfully:', result.output[0]);

    res.json({
      success: true,
      image_url: result.output[0],
      generation_time_ms: Date.now(),
      prediction_id: result.id,
      metadata: {
        prompt,
        aspect_ratio,
        safety_filter_level,
        output_format,
        model_used: 'imagen-4',
      },
    });

  } catch (error) {
    console.error('❌ Proxy server error:', error);
    res.status(500).json({ 
      error: error.message || 'Unknown error occurred' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});