const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/** Maps backend / DB duplicate-email wording to one clear message (covers stale servers and raw SQL errors). */
function normalizeRegisterError(raw) {
    if (raw == null || typeof raw !== 'string') return 'Something went wrong. Please try again.';
    const t = raw.trim();
    const lower = t.toLowerCase();
    if (
        lower.includes('duplicate entry') ||
        lower.includes('already taken') ||
        (lower.includes('email') &&
            (lower.includes('taken') ||
                lower.includes('exists') ||
                lower.includes('unique') ||
                lower.includes('already')))
    ) {
        return 'This email is already registered.';
    }
    return t;
}

const getToken = () => {
    const user = JSON.parse(localStorage.getItem('expense_manager_current_user'));
    return user ? user.token : null;
};

export const api = {
    /**
     * Register a new user
     */
    register: async (username, email, password, countryId) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, countryId })
            });
            const text = await response.text();
            if (!response.ok) return { success: false, message: normalizeRegisterError(text) };
            return { success: true, message: text };
        } catch (err) {
            return { success: false, message: 'Network error' };
        }
    },

    getCountries: async (search = '') => {
        try {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            const response = await fetch(`${BASE_URL}/countries${query}`);
            if (!response.ok) return [];
            return await response.json();
        } catch (err) {
            return [];
        }
    },

    /**
     * Login an existing user
     */
    login: async (email, password) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                const text = await response.text();
                return { success: false, message: text };
            }
            const data = await response.json();
            return { success: true, user: data };
        } catch (err) {
            return { success: false, message: 'Network error' };
        }
    },

    getSummary: async (filterType, month, year, startDate, endDate) => {
        const token = getToken();
        let query = new URLSearchParams();
        if (filterType) query.append('filterType', filterType);
        if (month) query.append('month', month);
        if (year) query.append('year', year);
        if (startDate) query.append('startDate', startDate);
        if (endDate) query.append('endDate', endDate);

        try {
            const response = await fetch(`${BASE_URL}/transactions/summary?${query.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching summary:', error);
            return null;
        }
    },

    /**
     * Get transactions with optional filters and pagination
     */
    getTransactions: async (filterType, month, year, startDate, endDate, page = 0, size = 10) => {
        const token = getToken();
        let query = new URLSearchParams();
        if (filterType) query.append('filterType', filterType);
        if (month) query.append('month', month);
        if (year) query.append('year', year);
        if (startDate) query.append('startDate', startDate);
        if (endDate) query.append('endDate', endDate);
        query.append('page', page);
        query.append('size', size);

        try {
            const response = await fetch(`${BASE_URL}/transactions?${query.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return null;
            return await response.json();
        } catch (err) {
            return null;
        }
    },

    /**
     * Add a transaction
     */
    addTransaction: async (transaction) => {
        const token = getToken();
        try {
            const response = await fetch(`${BASE_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transaction)
            });
            if (!response.ok) return { success: false };
            const data = await response.json();
            return { success: true, transaction: data };
        } catch (err) {
            return { success: false };
        }
    },

    updateTransaction: async (id, transaction) => {
        const token = getToken();
        try {
            const response = await fetch(`${BASE_URL}/transactions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transaction)
            });
            if (!response.ok) return { success: false };
            const data = await response.json();
            return { success: true, transaction: data };
        } catch (err) {
            return { success: false };
        }
    },

    deleteTransaction: async (id) => {
        const token = getToken();
        try {
            const response = await fetch(`${BASE_URL}/transactions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return { success: false };
            return { success: true };
        } catch (err) {
            return { success: false };
        }
    }
};

export const sendAgentMessage = async (message) => {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/agent/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
    });
    if (!response.ok) {
        const text = await response.text();
        console.error('Agent chat error:', response.status, text);
        if (response.status === 401) {
            return { reply: '🔒 Session expired. Please log in again.' };
        }
        // Try parsing as JSON (our controller returns JSON errors)
        try {
            return JSON.parse(text);
        } catch {
            return { reply: `⚠️ Server error (${response.status}). Please try again.` };
        }
    }
    return response.json();
};
