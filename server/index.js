const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Image Generation API Server is running' });
});

// Replicate proxy endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspect_ratio, safety_filter_level, output_format } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const replicateToken = process.env.VITE_REPLICATE_API_TOKEN;
    
    if (!replicateToken || replicateToken === 'your_replicate_api_token_here') {
      return res.status(500).json({ error: 'Replicate API token not configured' });
    }

    console.log('🎨 Generating image with Imagen-4:', { prompt, aspect_ratio, safety_filter_level, output_format });

    // Create prediction
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
          aspect_ratio: aspect_ratio || '4:3',
          safety_filter_level: safety_filter_level || 'block_medium_and_above',
          output_format: output_format || 'png',
        },
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('❌ Replicate API error:', errorData);
      return res.status(createResponse.status).json({ 
        error: errorData.error || `Replicate API error: ${createResponse.status}` 
      });
    }

    const prediction = await createResponse.json();
    console.log('⏳ Prediction created:', prediction.id);

    // Poll for completion
    const maxAttempts = 60; // 5 minutes max (5s intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateToken}`,
        },
      });

      if (!statusResponse.ok) {
        return res.status(statusResponse.status).json({ 
          error: `Failed to check prediction status: ${statusResponse.status}` 
        });
      }

      const result = await statusResponse.json();
      console.log(`⏳ Prediction status: ${result.status} (attempt ${attempts + 1}/${maxAttempts})`);

      if (result.status === 'succeeded') {
        console.log('✅ Image generated successfully:', result.output);
        return res.json({ 
          success: true, 
          image_url: result.output,
          metadata: {
            prompt,
            aspect_ratio,
            safety_filter_level,
            output_format,
            prediction_id: prediction.id
          }
        });
      }

      if (result.status === 'failed') {
        console.error('❌ Image generation failed:', result.error);
        return res.status(500).json({ 
          error: result.error || 'Image generation failed' 
        });
      }

      if (result.status === 'canceled') {
        console.warn('⚠️ Image generation was canceled');
        return res.status(500).json({ 
          error: 'Image generation was canceled' 
        });
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    console.error('⏰ Image generation timed out');
    return res.status(408).json({ 
      error: 'Image generation timed out. Please try again.' 
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Image Generation API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🎨 Generate endpoint: http://localhost:${PORT}/api/generate-image`);
});