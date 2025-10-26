import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const getAIResponse = async (prompt: string): Promise<string> => {
  if (!SUPABASE_URL) {
    throw new Error('Supabase URL is not configured');
  }

  try {
    console.log('🚀 Calling Supabase Edge Function...');

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-wish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function Error:', errorText);
      throw new Error(`Edge function error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Unknown error occurred');
    }

    console.log('✅ AI Response received');
    return data.result;

  } catch (error) {
    console.error('Error calling edge function:', error);
    throw error;
  }
};

// Enhanced function with more parameters
export const generateBirthdayWish = async (
  likes: string,
  dislikes?: string,
  tone: 'friendly' | 'formal' | 'funny' | 'heartfelt' = 'friendly'
): Promise<string> => {
  try {
    console.log('🚀 Generating birthday wish...');

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-wish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          likes,
          dislikes,
          tone,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function Error:', errorText);
      throw new Error(`Failed to generate wish: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate wish');
    }

    console.log('✅ Birthday wish generated');
    return data.result;

  } catch (error) {
    console.error('Error generating wish:', error);
    
    // Fallback to template if edge function fails
    return `Happy Birthday! 🎉 May your special day be filled with ${likes} and wonderful memories!`;
  }
};

// Generate gift ideas
export const generateGiftIdeas = async (
  likes: string,
  budget?: string
): Promise<string[]> => {
  try {
    const promptText = budget
      ? `Suggest 5 creative gift ideas for someone who likes "${likes}". Budget: ${budget}. List them as numbered items.`
      : `Suggest 5 creative gift ideas for someone who likes "${likes}". List them as numbered items.`;

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-wish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt: promptText }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    // Parse the numbered list
    const ideas = data.result
      .split('\n')
      .filter((line: string) => /^\d+\./.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((idea: string) => idea.length > 0)
      .slice(0, 5);

    return ideas.length > 0 ? ideas : [
      'A personalized gift related to their interests',
      'An experience they would enjoy',
      'Something practical they need'
    ];

  } catch (error) {
    console.error('Error generating gift ideas:', error);
    return [
      'A personalized item related to their hobbies',
      'An experience or activity they love',
      'A gift card to their favorite store'
    ];
  }
};