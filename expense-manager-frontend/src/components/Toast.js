import React from 'react';
import { useFeedback } from '../context/FeedbackContext';
import './Toast.css';

const Toast = () => {
    const { toast } = useFeedback();

    if (!toast.show) return null;

    return (
        <div className={`toast-container ${toast.show ? 'show' : ''} ${toast.type}`}>
            <div className="toast-icon">
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'info' && 'ℹ️'}
            </div>
            <div className="toast-message">{toast.message}</div>
        </div>
    );
};

export default Toast;
