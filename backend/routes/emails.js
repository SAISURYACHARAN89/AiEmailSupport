const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const csv = require('csv-parse/sync');

// Read emails from CSV file
async function getEmails() {
    const csvPath = path.join(__dirname, '..', '..', '68b1acd44f393_Sample_Support_Emails_Dataset.csv');
    const content = await fs.readFile(csvPath, 'utf-8');
    const emails = csv.parse(content, {
        columns: true,
        skip_empty_lines: true
    });

    // Process each email with AI analysis
    const processedEmails = emails.map(email => {
        const priority = determinePriority(email.subject + ' ' + email.body);
        const sentiment = analyzeSentiment(email.body);
        
        return {
            ...email,
            priority,
            sentiment,
            status: 'Pending'
        };
    });

    // Sort by priority
    return processedEmails.sort((a, b) => 
        (b.priority === 'Urgent' ? 1 : 0) - (a.priority === 'Urgent' ? 1 : 0)
    );
}

// Reuse the helper functions from ai.js
function determinePriority(text) {
    const urgentKeywords = ['immediately', 'urgent', 'critical', 'cannot access', 'emergency'];
    return urgentKeywords.some(keyword => text.toLowerCase().includes(keyword)) ? 'Urgent' : 'Normal';
}

function analyzeSentiment(text) {
    const negativeWords = ['cannot', 'error', 'issue', 'problem', 'frustrated', 'disappointed'];
    const positiveWords = ['thanks', 'great', 'appreciate', 'good', 'helpful'];
    
    const textLower = text.toLowerCase();
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    
    return positiveCount > negativeCount ? 'Positive' : 
           negativeCount > positiveCount ? 'Negative' : 'Neutral';
}

router.get('/', async (req, res) => {
    try {
        const emails = await getEmails();
        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
