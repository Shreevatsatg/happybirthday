import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Retry fetch with exponential backoff
async function fetchWithRetry(url, options, retries = 3) {
  for(let i = 0; i < retries; i++){
    try {
      console.log(`Attempt ${i + 1}: Fetching ${url}`);
      const response = await fetch(url, options);
      console.log(`Success! Status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, i) * 1000 // 1s, 2s, 4s
      ;
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve)=>setTimeout(resolve, waitTime));
    }
  }
  throw new Error('All retries failed');
}
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { prompt, likes, dislikes, tone } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not found in environment');
      throw new Error('API key not configured');
    }
    console.log('API Key found:', OPENROUTER_API_KEY.substring(0, 15) + '...');
    // Build prompt
    let userPrompt = prompt;
    if (!prompt && likes) {
      const tones = {
        friendly: 'warm and friendly',
        formal: 'elegant and respectful',
        funny: 'humorous and hilarious',
        heartfelt: 'deeply emotional and touching'
      };
      userPrompt = `Generate a ${tones[tone] || 'friendly'} birthday wish for someone who likes "${likes}"`;
      if (dislikes) userPrompt += ` and dislikes "${dislikes}"`;
      userPrompt += '. Keep it under 50 words.';
    }
    console.log('Generated prompt:', userPrompt);
    // Try multiple endpoints
    const endpoints = [
      'https://api.openrouter.ai/api/v1/chat/completions',
      'https://openrouter.ai/api/v1/chat/completions'
    ];
    let lastError = null;
    for (const endpoint of endpoints){
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const requestBody = {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful birthday assistant. Be creative, positive, and thoughtful.'
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        };
        console.log('Request body:', JSON.stringify(requestBody));
        const response = await fetchWithRetry(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://happybirthday.app',
            'X-Title': 'HappyBirthday App'
          },
          body: JSON.stringify(requestBody)
        }, 2) // 2 retries per endpoint
        ;
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API returned error: ${response.status}`, errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log('API Response received successfully');
        const result = data.choices?.[0]?.message?.content || 'Could not generate response';
        return new Response(JSON.stringify({
          success: true,
          result,
          usage: data.usage,
          endpoint_used: endpoint
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        });
      } catch (error) {
        console.error(`Endpoint ${endpoint} failed:`, error.message);
        lastError = error;
        continue; // Try next endpoint
      }
    }
    // All endpoints failed
    throw lastError || new Error('All endpoints failed');
  } catch (error) {
    console.error('Function error:', error);
    // Return detailed error for debugging
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
