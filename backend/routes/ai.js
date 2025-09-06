const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Ensure API key is properly loaded
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Validate API key format
if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
    console.error('ERROR: Invalid or missing GEMINI_API_KEY in environment variables');
    throw new Error('GEMINI_API_KEY configuration error');
}

// Fallback functions
function localAnalyzeSentiment(text) {
    const negativeWords = ['cannot', 'error', 'issue', 'problem', 'frustrated', 'disappointed'];
    const positiveWords = ['thanks', 'great', 'appreciate', 'good', 'helpful'];
    
    const textLower = text.toLowerCase();
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    
    return positiveCount > negativeCount ? 'Positive' : 
           negativeCount > positiveCount ? 'Negative' : 'Neutral';
}

function localDeterminePriority(text) {
    const urgentKeywords = ['immediately', 'urgent', 'critical', 'cannot access', 'emergency'];
    return urgentKeywords.some(keyword => text.toLowerCase().includes(keyword)) ? 'Urgent' : 'Normal';
}

function localExtractMetadata(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g;
    
    return {
        contactDetails: {
            emails: text.match(emailRegex) || [],
            phones: text.match(phoneRegex) || []
        },
        requirements: text.toLowerCase().includes('help') ? ['Customer requires assistance'] : []
    };
}

async function queryGemini(prompt) {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ 
                    role: "user", 
                    parts: [{ 
                        text: prompt + "\nRespond with valid JSON only, no markdown or code blocks." 
                    }] 
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        // Clean up the response text
        text = text.replace(/```json\s*|\s*```/g, '') // Remove markdown code blocks
                  .replace(/^\s*{\s*/, '{')           // Clean up start
                  .replace(/\s*}\s*$/, '}')           // Clean up end
                  .trim();

        return text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

function analyzeSentimentWithIndicators(text) {
    const sentimentWords = {
        positive: ['thanks', 'great', 'appreciate', 'good', 'helpful', 'excellent', 'pleased', 'perfect', 'resolved'],
        negative: ['cannot', 'error', 'issue', 'problem', 'frustrated', 'disappointed', 'urgent', 'failed', 'wrong', 'bad']
    };
    
    const textLower = text.toLowerCase();
    const foundPositive = sentimentWords.positive.filter(word => textLower.includes(word));
    const foundNegative = sentimentWords.negative.filter(word => textLower.includes(word));
    
    const sentiment = foundPositive.length > foundNegative.length ? 'Positive' : 
                     foundNegative.length > foundPositive.length ? 'Negative' : 'Neutral';
    
    // Calculate sentiment score (-1 to 1)
    const sentimentScore = (foundPositive.length - foundNegative.length) / 
                          Math.max(foundPositive.length + foundNegative.length, 1);
    
    return {
        sentiment,
        score: sentimentScore.toFixed(2),
        summary: `${sentiment} (${Math.abs(sentimentScore * 100)}% ${sentiment.toLowerCase()} sentiment)`,
        indicators: {
            positive: foundPositive,
            negative: foundNegative
        }
    };
}

function determinePriorityWithReason(text) {
    const priorityFactors = {
        urgent: ['immediately', 'urgent', 'critical', 'emergency', 'asap'],
        impact: ['cannot access', 'system down', 'blocked', 'broken', 'error'],
        business: ['revenue', 'customer', 'production', 'deadline', 'lost']
    };
    
    const textLower = text.toLowerCase();
    const foundFactors = Object.entries(priorityFactors)
        .map(([category, words]) => ({
            category,
            matches: words.filter(word => textLower.includes(word))
        }))
        .filter(factor => factor.matches.length > 0);
    
    const isPriority = foundFactors.length > 0;
    const reasons = foundFactors.map(f => 
        `${f.category}: ${f.matches.join(', ')}`
    );

    return {
        priority: isPriority ? 'Urgent' : 'Normal',
        reasons: reasons,
        summary: isPriority 
            ? `Urgent due to ${reasons.join(' and ')}`
            : 'Normal priority'
    };
}

router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        // Validate request
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Invalid input: text is required' });
        }

        let analysis;
        try {
            // Try Gemini API first
            const analysisPrompt = `
            Analyze this customer message and return a JSON object (no markdown, just pure JSON) with these fields:
            - sentiment: one of ["Positive", "Negative", "Neutral"]
            - priority: one of ["Urgent", "Normal"]
            - metadata: { contactDetails: { emails: [], phones: [] }, requirements: [] }

            Message: "${text}"
            `;

            const analysisText = await queryGemini(analysisPrompt);
            
            try {
                analysis = JSON.parse(analysisText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError, 'Raw Text:', analysisText);
                throw new Error('Invalid JSON response from Gemini');
            }
        } catch (error) {
            // Fallback to local processing
            console.log('Falling back to local processing:', error.message);
            analysis = {
                sentiment: localAnalyzeSentiment(text),
                priority: localDeterminePriority(text),
                metadata: localExtractMetadata(text)
            };
        }

        const sentimentAnalysis = analyzeSentimentWithIndicators(text);
        const priorityAnalysis = determinePriorityWithReason(text);

        // Generate response (fallback to template if Gemini fails)
        let suggestedResponse;
        try {
            const responsePrompt = `
            Customer email: "${text}"
            Sentiment: ${analysis.sentiment}
            Priority: ${analysis.priority}
            Write a professional, empathetic response to the customer.
            `;
            suggestedResponse = await queryGemini(responsePrompt);
        } catch (error) {
            suggestedResponse = `Thank you for contacting us. We have received your message and will ${analysis.priority === 'Urgent' ? 'address it immediately' : 'respond as soon as possible'}. ${analysis.sentiment === 'Negative' ? 'We apologize for any inconvenience caused.' : ''}`;
        }

        res.json({
            sentiment: analysis.sentiment,
            sentimentDetails: {
                score: sentimentAnalysis.score,
                summary: sentimentAnalysis.summary,
                indicators: sentimentAnalysis.indicators
            },
            priority: analysis.priority,
            priorityDetails: {
                reasons: priorityAnalysis.reasons,
                summary: priorityAnalysis.summary
            },
            metadata: {
                ...localExtractMetadata(text),
                sentimentIndicators: sentimentAnalysis.indicators,
                priorityIndicators: priorityAnalysis.reasons
            },
            suggestedResponse
        });

    } catch (error) {
        console.error("Error in /analyze:", error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
