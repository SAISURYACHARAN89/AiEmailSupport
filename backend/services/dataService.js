const fs = require('fs').promises;
const csv = require('csv-parse/sync');
const path = require('path');

class DataService {
  constructor() {
    this.dataPath = path.join(__dirname, '..', '..', '68b1acd44f393_Sample_Support_Emails_Dataset.csv');
  }

  async getEmails() {
    const content = await fs.readFile(this.dataPath, 'utf-8');
    const records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true
    });
    return records.map(record => ({
      sender: record.sender,
      subject: record.subject,
      body: record.body,
      receivedAt: new Date(record.sent_date)
    }));
  }

  async saveProcessedEmail(processedEmail) {
    // Implementation for saving processed results if needed
    // Could save to a separate CSV for processed emails
  }
}

module.exports = new DataService();
