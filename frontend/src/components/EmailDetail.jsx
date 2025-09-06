import React, { useState, useEffect } from "react";
import "./EmailDetail.css";

const EmailDetail = ({ email, onClose }) => {
  const [aiResponse, setAiResponse] = useState("");
  const [editedResponse, setEditedResponse] = useState("");
  const [metadata, setMetadata] = useState({
    requirements: [],
    keywords: [],
    sentimentIndicators: {
      positive: [],
      negative: [],
    },
  });
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    const analyzeEmail = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: email.body }),
        });
        const data = await response.json();
        setMetadata(data.metadata);
        setAiResponse(data.suggestedResponse);
        setEditedResponse(data.suggestedResponse);
      } catch (error) {
        console.error("Error analyzing email:", error);
      }
    };
    analyzeEmail();
  }, [email]);

  const handleSendResponse = () => {
    setIsSent(true);
    // Reset after animation
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Email Details</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="email-info">
            <div className="info-badge sender">
              <span className="label">From</span>
              <span className="value">{email.sender}</span>
            </div>
            <div className="info-badge subject">
              <span className="label">Subject</span>
              <span className="value">{email.subject}</span>
            </div>
            <div className="info-badge priority">
              <span className="label">Priority</span>
              <span className={`value ${email.priority.toLowerCase()}`}>
                {email.priority}
              </span>
            </div>
          </div>

          <div className="email-content">
            <div className="message-box">
              <h3>Message</h3>
              <p>{email.body}</p>
            </div>

            <div className="response-box">
              <h3>AI Response</h3>
              <textarea
                value={aiResponse}
                onChange={(e) => setAiResponse(e.target.value)}
                rows={6}
              />
              <button
                className={`send-button ${isSent ? "sent" : ""}`}
                onClick={handleSendResponse}
                disabled={isSent}
              >
                {isSent ? (
                  <>
                    <span className="check">✓</span> Sent!
                  </>
                ) : (
                  "Send Response"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
       
