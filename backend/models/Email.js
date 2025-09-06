const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  sender: String,
  subject: String,
  body: String,
  receivedAt: Date,
  sentiment: {
    type: String,
    enum: ['Positive', 'Negative', 'Neutral']
  },
  priority: {
    type: String,
    enum: ['Urgent', 'Normal']
  },
  status: {
    type: String,
    enum: ['Pending', 'Responded']
  },
  autoResponse: String,
  metadata: {
    contactDetails: Object,
    requirements: [String]
  }
});

module.exports = mongoose.model('Email', emailSchema);
