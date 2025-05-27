import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.VITE_DEEPSEEK_API_KEY
});

// Company knowledge base
const companyKnowledge = {
  about: {
    name: "Ubaka",
    founded: "2020",
    description: "Ubaka is Rwanda's premier construction and hardware supply store, transforming how the world sources construction materials through technology and exceptional service.",
    mission: "Building excellence, one project at a time",
    values: [
      "Quality First - We never compromise on quality, sourcing only from trusted manufacturers",
      "Customer-Centric - Every decision is guided by our commitment to exceptional customer experiences",
      "Integrity - We operate with transparency and honesty",
      "Innovation - We continually seek new ways to improve our services",
      "Reliability - Our customers can depend on us for consistent service quality",
      "Sustainability - We are committed to environmentally responsible practices"
    ]
  },
  services: [
    {
      name: "Fast Delivery",
      description: "Same-day delivery within city limits, or 1-3 business days nationwide with real-time tracking"
    },
    {
      name: "Installation Services",
      description: "Professional installation of materials and systems by certified technicians"
    },
    {
      name: "Custom Cutting & Sizing",
      description: "Custom cutting and sizing for wood, glass, metal, and other materials to exact specifications"
    },
    {
      name: "Contractor Support",
      description: "Special pricing, dedicated account managers, and bulk ordering options for professional contractors"
    },
    {
      name: "Project Consultation",
      description: "Expert advice on material selection, quantity estimation, and project planning"
    },
    {
      name: "Technical Support",
      description: "24/7 technical support for product inquiries, troubleshooting, and application guidance"
    }
  ],
  contact: {
    phone: "+1 (800) 555-UBAKA",
    email: ["support@ubaka.com", "sales@ubaka.com"],
    address: "1234 Construction Ave, New York, NY 10001",
    hours: ["Mon-Fri: 8am-8pm EST", "Sat: 9am-5pm EST"]
  },
  products: {
    categories: [
      "Building Materials",
      "Structural Components",
      "Flooring",
      "Insulation",
      "Windows & Doors"
    ]
  }
};

app.post('/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!process.env.VITE_DEEPSEEK_API_KEY) {
      console.error('DeepSeek API key is not configured');
      return res.status(500).json({ message: 'AI service is not configured properly' });
    }

    const systemPrompt = `You are Ubaka's AI assistant, a helpful and knowledgeable guide for Ubaka, Rwanda's premier construction and hardware supply store. Your primary goal is to provide clear, concise, and accurate information.

Key Guidelines:
1. Keep responses brief and to the point by default
2. Only provide detailed explanations when specifically requested
3. Use bullet points or numbered lists for multiple items
4. Prioritize direct answers over lengthy explanations
5. If a question requires a detailed response, ask the user if they'd like more information

Company Information:
${companyKnowledge}

Remember to:
- Be concise and clear
- Use simple language
- Focus on the most relevant information
- Ask if more details are needed
- Maintain a friendly and professional tone`;

    console.log('Sending request to DeepSeek API...');
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log('Successfully received response from DeepSeek API');
    res.json({ message: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('DeepSeek API Key configured:', !!process.env.VITE_DEEPSEEK_API_KEY);
}); 