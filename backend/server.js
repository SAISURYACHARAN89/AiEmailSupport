require('dotenv').config();
const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/emails');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/emails', emailRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
