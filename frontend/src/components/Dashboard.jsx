import React, { useState, useEffect } from "react";
import EmailList from "./EmailList";
import Analytics from "./Analytics";
import EmailDetail from "./EmailDetail";
import { fetchEmails } from "../api/emails";
import "./Dashboard.css";

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    urgent: 0,
    sentiment: { positive: 0, negative: 0, neutral: 0 },
    last24Hours: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const filterAndSortEmails = (emailData) => {
    const supportKeywords = ["support", "query", "request", "help"];
    return emailData
      .filter((email) =>
        supportKeywords.some((keyword) =>
          email.subject.toLowerCase().includes(keyword)
        )
      )
      .sort(
        (a, b) =>
          (b.priority === "Urgent" ? 1 : 0) - (a.priority === "Urgent" ? 1 : 0)
      );
  };

  useEffect(() => {
    const loadEmails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchEmails();
        const filteredEmails = filterAndSortEmails(data);
        setEmails(filteredEmails);
        updateStats(filteredEmails);
      } catch (error) {
        console.error("Error loading emails:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEmails();
  }, []);

  const updateStats = (emailData) => {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    setStats({
      total: emailData.length,
      resolved: emailData.filter((e) => e.status === "Responded").length,
      pending: emailData.filter((e) => e.status === "Pending").length,
      urgent: emailData.filter((e) => e.priority === "Urgent").length,
      sentiment: {
        positive: emailData.filter((e) => e.sentiment === "Positive").length,
        negative: emailData.filter((e) => e.sentiment === "Negative").length,
        neutral: emailData.filter((e) => e.sentiment === "Neutral").length,
      },
      last24Hours: emailData.filter((e) => new Date(e.sent_date) > last24Hours)
        .length,
    });
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
  };

  return (
    <div className="dashboard">
      {isLoading ? (
        <div className="loading-skeleton">
          <div className="skeleton analytics"></div>
          <div className="skeleton list"></div>
        </div>
      ) : (
        <>
          <Analytics stats={stats} />
          <div className="dashboard-content">
            <EmailList emails={emails} onEmailSelect={handleEmailSelect} />
            {selectedEmail && (
              <EmailDetail
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
