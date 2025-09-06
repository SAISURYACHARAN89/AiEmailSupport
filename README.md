# 📧 AI-Powered Email Support Assistant

An **AI-powered communication assistant** that automatically retrieves, filters, prioritizes, and responds to customer support emails.  
It helps organizations handle large volumes of incoming emails efficiently while improving **response quality** and **customer satisfaction**.

---

## ✨ Features

### 🔍 Email Retrieval & Filtering
- Fetches incoming emails from **IMAP/Gmail/Outlook APIs**.
- Filters emails containing keywords such as:
  - `Support`, `Query`, `Request`, `Help`
- Displays:
  - Sender’s email address  
  - Subject  
  - Email body  
  - Date/time received  

### 🏷 Categorization & Prioritization
- **Sentiment Analysis**: Positive / Negative / Neutral  
- **Priority Detection**: Urgent / Not urgent  
  - Keywords like *immediately, critical, cannot access, urgent* mark high-priority emails.  
- **Priority Queue** ensures urgent emails are processed first.  

### 🤖 Context-Aware Auto-Responses
- Generates **draft replies** using an **LLM** (Gemini / Hugging Face / OpenAI).  
- Responses are:
  - Professional and empathetic  
  - Context-aware (RAG + Prompt Engineering)  
  - Tailored to customer sentiment and content  
- Example: If the customer is frustrated, the AI acknowledges it empathetically.  

### 🧩 Information Extraction
- Extracts:
  - Contact details (email, phone numbers)  
  - Customer requirements or requests  
  - Sentiment indicators  
  - Actionable metadata  
- Displays extracted info alongside raw email.  

### 📊 Dashboard / User Interface
- Simple, **intuitive dashboard** built with React.  
- Key features:
  - List of filtered emails with structured details  
  - AI-generated response preview (editable before sending)  
  - Analytics & Stats:
    - Total emails (24h)  
    - Urgent vs. Non-urgent  
    - Resolved vs. Pending  
    - Interactive charts (Pie/Bar Graphs)  

---

## 🛠️ Tech Stack

- **Backend:** Node.js + Express  
- **Frontend:** React.js
- **AI Models:**  
  - Priority Detection: Custom keywords  
  - Response Generation: Gemini API / Hugging Face / GPT  
- **Email Retrieval:** Gmail API / Outlook Graph API / IMAP  
- **Visualization:** Recharts / Chart.js  

---

## 🚀 Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/your-username/AiEmailSupport.git
cd AiEmailSupport
