const API_URL = 'http://localhost:5000/api';

export const fetchEmails = async () => {
    try {
        const response = await fetch(`${API_URL}/emails`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching emails:', error);
        return [];
    }
};
