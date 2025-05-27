interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export async function chatWithAI(messages: Message[], context?: string) {
    const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key is not configured');
    }

    const systemPrompt = context
        ? `You are a helpful AI assistant for an e-commerce platform. The user is currently viewing: ${context}. Use this context to provide more relevant and specific information.`
        : 'You are a helpful AI assistant for an e-commerce platform.';

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({ 
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 1000,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to get response from DeepSeek API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
} 