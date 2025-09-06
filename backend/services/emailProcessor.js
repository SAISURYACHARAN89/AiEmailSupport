const { Configuration, OpenAIApi } = require('openai');
const dataService = require('./dataService');

class EmailProcessor {
  constructor() {
    this.openai = new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY
      })
    );
  }

  async processEmail(emailData) {
    const sentiment = await this.analyzeSentiment(emailData.body);
    const priority = this.determinePriority(emailData.subject, emailData.body);
    const metadata = this.extractMetadata(emailData.body);
    const autoResponse = await this.generateResponse(emailData, sentiment);

    return {
      ...emailData,
      sentiment,
      priority,
      metadata,
      autoResponse,
      status: 'Pending'
    };
  }

  determinePriority(subject, body) {
    const urgentKeywords = ['immediately', 'urgent', 'critical', 'cannot access'];
    const text = (subject + ' ' + body).toLowerCase();
    return urgentKeywords.some(keyword => text.includes(keyword)) ? 'Urgent' : 'Normal';
  }

  async analyzeSentiment(text) {
    const completion = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Analyze the sentiment of this text: "${text}". Reply with only: Positive, Negative, or Neutral`
    });
    return completion.data.choices[0].text.trim();
  }

  extractMetadata(body) {
    // Add implementation for extracting contact details and requirements
    return {
      contactDetails: {},
      requirements: []
    };
  }

  async generateResponse(emailData, sentiment) {
    // Implement response generation using OpenAI
    return '';
  }

  async processAllEmails() {
    const emails = await dataService.getEmails();
    return Promise.all(emails.map(email => this.processEmail(email)));
  }
}

module.exports = new EmailProcessor();
