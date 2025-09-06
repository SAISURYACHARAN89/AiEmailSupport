import React, { useState } from "react";
import "./EmailList.css";

const EmailList = ({ emails, onEmailSelect }) => {
  const [sortBy, setSortBy] = useState("priority");

  const getSortedEmails = () => {
    return [...emails].sort((a, b) => {
      if (sortBy === "priority") {
        return b.priority === "Urgent" ? 1 : -1;
      }
      return new Date(b.sent_date) - new Date(a.sent_date);
    });
  };

  const getPriorityClass = (priority) => {
    return priority === "Urgent" ? "urgent" : "normal";
  };

  const getSentimentClass = (sentiment) => {
    const classes = {
      Positive: "sentiment-positive",
      Negative: "sentiment-negative",
      Neutral: "sentiment-neutral",
    };
    return classes[sentiment] || "";
  };

  return (
    <div className="email-list">
      <div className="email-list-header">
        <h2>Support Emails</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="priority">Sort by Priority</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>
      <div className="email-table">
        <table>
          <thead>
            <tr>
              <th>Sender</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Priority</th>
              <th>Sentiment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedEmails().map((email, index) => (
              <tr
                key={index}
                className={`${getPriorityClass(email.priority)} ${getSentimentClass(
                  email.sentiment
                )}`}
                onClick={() => onEmailSelect(email)}
              >
                <td>{email.sender}</td>
                <td>{email.subject}</td>
                <td>{new Date(email.sent_date).toLocaleDateString()}</td>
                <td className={`priority-${email.priority.toLowerCase()}`}>
                  {email.priority}
                </td>
                <td>{email.sentiment}</td>
                <td>{email.status}</td>
                <td>
                  <button onClick={() => onEmailSelect(email)}>
                    View & Respond
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailList;
