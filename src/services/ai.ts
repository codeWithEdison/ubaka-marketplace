import { supabase } from '@/integrations/supabase/client';
import { Product, CartItem } from '@/lib/utils';
import { fetchProductById, fetchProductsByCategory } from './ProductService';
import { fetchCart } from './CartService';
import { fetchCategoryById } from './CategoryService';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface ChatContext {
    pathname: string;
    productId?: string;
    categoryId?: string;
    productData?: Product;
    categoryData?: any;
    cartItems?: CartItem[];
    searchParams?: URLSearchParams;
    currentQuestion?: string;
}

const UBAKA_INFO = {
    name: "UBAKA CONSTRUCTION & HARDWARE SUPPLY",
    address: "KG 7 Ave, Kigali, Rwanda",
    phone: "+250 788 240 303",
    email: "info@ubaka.com",
    website: "https://ubaka.codewithedison.com",
    vat: 18,
    paymentMethods: ["Mobile Money", "Bank Transfer", "crypto Etherum"],
    deliveryAreas: ["Kigali", "Rwanda"],
    businessHours: "Mon-Sat: 8:00 AM - 6:00 PM",
    specialties: [
        "Construction Materials",
        "Hardware Supplies",
        "Building Tools",
        "Construction Services"
    ]
};

const CONSTRUCTION_EXPERTISE = `
You are UBAKA's specialized AI assistant focused on construction and building materials. Your expertise includes:
- Construction materials and equipment specifications
- Building supplies and tools applications
- Construction services and consultations
- Project planning and estimation
- Building regulations and standards
- Construction safety guidelines
- Material specifications and applications

IMPORTANT GUIDELINES:
1. Always use the provided database context to give accurate information
2. Never make up or guess information about products and prices
3. If asked about non-construction topics, politely redirect to construction-related matters
4. Use specific product data when available
5. Reference actual specifications and prices from the database
6. Provide construction-specific advice based on the actual products
7. When discussing materials, always mention their construction applications
8. Include safety considerations when discussing construction materials
9. ALWAYS respond to the most recent question from the user
10. Maintain conversation context but prioritize the current question
11. If asked about cart contents, check the cartItems in the context
12. If no cart data is available, clearly state that you cannot access the cart
13. Always use UBAKA's actual business information when providing details
14. Include relevant construction standards and safety guidelines
15. Reference local building codes and regulations when applicable

UBAKA BUSINESS INFORMATION:
- Company: ${UBAKA_INFO.name}
- Address: ${UBAKA_INFO.address}
- Phone: ${UBAKA_INFO.phone}
- Email: ${UBAKA_INFO.email}
- Website: ${UBAKA_INFO.website}
- VAT Rate: ${UBAKA_INFO.vat}%
- Payment Methods: ${UBAKA_INFO.paymentMethods.join(', ')}
- Delivery Areas: ${UBAKA_INFO.deliveryAreas.join(', ')}
- Business Hours: ${UBAKA_INFO.businessHours}
- Specialties: ${UBAKA_INFO.specialties.join(', ')}
`;

export async function chatWithAI(messages: Message[], context?: ChatContext) {
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
        throw new Error('UBAKA AI API Key is not configured');
    }

    // Get the most recent user message
    const currentQuestion = messages
        .filter(m => m.role === 'user')
        .pop()?.content;

    // Fetch relevant data based on context
    let productData: Product | undefined;
    let categoryData: { id: string; name: string; description: string } | undefined;
    let cartItems: CartItem[] | undefined;
    let relatedProducts: Product[] | undefined;

    try {
        if (context?.productId) {
            productData = await fetchProductById(context.productId);
            if (productData.category?.id) {
                relatedProducts = await fetchProductsByCategory(productData.category.id);
                relatedProducts = relatedProducts
                    .filter(p => p.id !== context.productId)
                    .slice(0, 3);
            }
        }

        if (context?.categoryId) {
            categoryData = await fetchCategoryById(context.categoryId);
            const categoryProducts = await fetchProductsByCategory(context.categoryId);
            relatedProducts = categoryProducts.slice(0, 5);
        }

        if (context?.pathname === '/cart') {
            cartItems = await fetchCart();
        }
    } catch (error) {
        console.error('Error fetching context data:', error);
    }

    // Build detailed context for the AI
    const contextDetails = [
        currentQuestion ? `Current Question: ${currentQuestion}` : '',

        context?.productData ? `
Current Product:
- Name: ${context.productData.name}
- Price: ${context.productData.price}
- Description: ${context.productData.description}
- Specifications: ${JSON.stringify(context.productData.specifications)}
- Category: ${context.productData.category?.name}
- In Stock: ${context.productData.inStock ? 'Yes' : 'No'}
${relatedProducts ? `
Related Products:
${relatedProducts.map(p => `- ${p.name} (${p.price})`).join('\n')}` : ''}` : '',

        context?.categoryData ? `
Current Category:
- Name: ${context.categoryData.name}
- Description: ${context.categoryData.description}
${relatedProducts ? `
Top Products in Category:
${relatedProducts.map(p => `- ${p.name} (${p.price})`).join('\n')}` : ''}` : '',

        context?.cartItems ? `
Cart Contents:
${context.cartItems.map(item => `- ${item.product.name} (${item.product.price}) x ${item.quantity}`).join('\n')}` : '',

        context?.searchParams ? `
Search Parameters:
${Array.from(context.searchParams.entries()).map(([key, value]) => `- ${key}: ${value}`).join('\n')}` : ''
    ].filter(Boolean).join('\n');

    const systemPrompt = `${CONSTRUCTION_EXPERTISE}

Current Context:
${contextDetails}

IMPORTANT: Always respond to the most recent question: "${currentQuestion}"

Remember to:
1. Use exact prices and specifications from the database
2. Reference actual products and categories
3. Provide construction-specific advice
4. Include safety considerations
5. Suggest related products when relevant
6. Stay focused on construction and building materials
7. If asked about cart contents, check the cartItems in the context
8. If no cart data is available, clearly state that you cannot access the cart
9. Always use UBAKA's actual business information
10. Include relevant construction standards and safety guidelines`;

    try {
        const response = await fetch('https://api.deepseek.ai/v1/chat/completions', {
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
            const errorData = await response.json().catch(() => ({}));
            console.error('DeepSeek API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('DeepSeek API Error:', error);
        if (error instanceof Error) {
            if (error.message.includes('ENOTFOUND')) {
                throw new Error('Unable to connect to AI service. Please check your internet connection.');
            }
            if (error.message.includes('401')) {
                throw new Error('Invalid API key. Please check your configuration.');
            }
        }
        throw new Error('Failed to get response from AI service. Please try again later.');
    }
}  