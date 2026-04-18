import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendAgentMessage } from '../services/api';
import './AgentChat.css';

const SUGGESTIONS = [
    { label: '📊 Show summary', message: "What's my balance this month?" },
    { label: '📋 Recent expenses', message: 'Show my recent transactions' },
    { label: '💰 Add income', message: 'I received ₹5000 salary' },
    { label: '🛒 Add expense', message: 'I spent ₹200 on groceries' },
];

const TypingIndicator = () => (
    <div className="agent-chat__msg agent-chat__msg--agent agent-chat__typing">
        <div className="typing-dots">
            <span></span><span></span><span></span>
        </div>
    </div>
);

const AgentChat = ({ onTransactionChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'agent', text: '👋 Hey! I\'m your AI expense assistant. Tell me what you spent or earned — I\'ll handle the rest.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const send = useCallback(async (overrideMsg) => {
        const userMsg = (overrideMsg || input).trim();
        if (!userMsg) return;
        if (!overrideMsg) setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const data = await sendAgentMessage(userMsg);
            setMessages(prev => [...prev, { role: 'agent', text: data.reply }]);
            // Refresh dashboard if the agent confirmed an action
            if (data.reply && (
                data.reply.includes('✅') ||
                data.reply.includes('🗑️') ||
                data.reply.includes('Added') ||
                data.reply.includes('added') ||
                data.reply.includes('deleted') ||
                data.reply.includes('Deleted') ||
                data.reply.includes('removed') ||
                data.reply.includes('recorded')
            )) {
                onTransactionChange?.();
            }
        } catch {
            setMessages(prev => [...prev, { role: 'agent', text: '⚠️ Something went wrong. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    }, [input, onTransactionChange]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                className={`agent-fab ${isOpen ? 'agent-fab--open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                id="agent-chat-toggle"
                aria-label="Toggle AI Chat"
            >
                <span className="agent-fab__icon">
                    {isOpen ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5.1 7.5L8 22l4.5-3h-.5a8 8 0 0 0 0-16z"></path>
                            <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
                            <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
                            <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
                        </svg>
                    )}
                </span>
                {!isOpen && <span className="agent-fab__pulse"></span>}
            </button>

            {/* Chat Panel */}
            <div className={`agent-panel ${isOpen ? 'agent-panel--open' : ''}`} id="agent-chat-panel">
                {/* Header */}
                <div className="agent-panel__header">
                    <div className="agent-panel__header-left">
                        <div className="agent-panel__avatar">
                            <span>🤖</span>
                            <span className="agent-panel__status-dot"></span>
                        </div>
                        <div>
                            <h3 className="agent-panel__title">Expense AI</h3>
                            <p className="agent-panel__subtitle">Powered by Groq Llama 3</p>
                        </div>
                    </div>
                    <button className="agent-panel__close" onClick={() => setIsOpen(false)} aria-label="Close">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="agent-panel__messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`agent-chat__msg agent-chat__msg--${m.role}`}>
                            {m.role === 'agent' && <span className="agent-chat__msg-avatar">🤖</span>}
                            <div className="agent-chat__msg-bubble">
                                {m.text.split('\n').map((line, j) => (
                                    <span key={j}>{line}{j < m.text.split('\n').length - 1 && <br />}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {loading && <TypingIndicator />}
                    <div ref={bottomRef} />
                </div>

                {/* Suggestion Chips */}
                {messages.length <= 2 && !loading && (
                    <div className="agent-panel__suggestions">
                        {SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                className="agent-suggestion-chip"
                                onClick={() => send(s.message)}
                                disabled={loading}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="agent-panel__input-area">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. spent ₹200 on groceries..."
                        disabled={loading}
                        className="agent-panel__input"
                        id="agent-chat-input"
                    />
                    <button
                        onClick={() => send()}
                        disabled={loading || !input.trim()}
                        className="agent-panel__send"
                        id="agent-chat-send"
                        aria-label="Send message"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && <div className="agent-backdrop" onClick={() => setIsOpen(false)} />}
        </>
    );
};

export default AgentChat;