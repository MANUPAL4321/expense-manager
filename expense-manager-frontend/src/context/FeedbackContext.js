import React, { createContext, useContext, useState, useCallback } from 'react';

const FeedbackContext = createContext(null);

export const FeedbackProvider = ({ children }) => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = useCallback((message, type = 'info') => {
        setToast({ show: true, message, type });
        // Auto-hide after 3 seconds
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, []);

    return (
        <FeedbackContext.Provider value={{ toast, showToast, hideToast }}>
            {children}
        </FeedbackContext.Provider>
    );
};

export const useFeedback = () => useContext(FeedbackContext);
