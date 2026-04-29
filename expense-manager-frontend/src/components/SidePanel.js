import { Link, useLocation } from "react-router-dom";
import "./SidePanel.css";

function SidePanel() {
    const location = useLocation();

    const items = [
        {
            path: '/',
            label: 'Home',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            )
        },
        {
            path: '/history',
            label: 'History',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            )
        },

        {
            path: '/analyze',
            label: 'Analyze',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            )
        },
        {
            path: '/add',
            label: 'Add',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
            )
        }
    ];

    return (
        <div className="side-panel" id="side-panel">
            {items.map((item) => (
                <Link
                    to={item.path}
                    key={item.path}
                    className={`side-panel-item ${location.pathname === item.path ? 'active' : ''}`}
                    id={`side-panel-${item.label.toLowerCase()}`}
                >
                    <div className="side-panel-icon">{item.icon}</div>
                    <span className="side-panel-label">{item.label}</span>
                </Link>
            ))}
        </div>
    );
}

export default SidePanel;
