const BASE_URL = 'https://api.openrouter.ai/api/v1/chat/completions';

export const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    console.log('Starting API request to:', BASE_URL);
    console.log('API Key:', process.env.EXPO_PUBLIC_API_KEY?.substring(0, 10) + '...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const requestBody = {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful birthday assistant that provides birthday ideas, wishes, and party planning advice. Be creative, positive, and thoughtful in your responses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Shreevatsatg/happybirthday',
        'X-Title': 'HappyBirthday App',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response that failed to parse:', responseText);
      throw new Error('Failed to parse API response');
    }

    const result = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';
    console.log('AI Response:', result);
    return result;
  } catch (err) {
    const error = err as Error;
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      // Check if running in development
      if (__DEV__) {
        console.log('Development environment detected, checking CORS and network...');
        try {
          const response = await fetch('https://api.openrouter.ai/api/v1/auth/key_details', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
            },
          });
          console.log('Auth test response:', await response.text());
        } catch (testError) {
          console.error('Auth test failed:', testError);
        }
      }
      throw new Error('Network connection error. Please check your internet connection and try again.');
    }
    throw new Error(`API Error: ${error.message || 'An unexpected error occurred'}`);
  }
};
