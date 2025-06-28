import React, { useEffect } from 'react';
import './Notification.css';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const Notification = ({ 
    isVisible, 
    message, 
    type = 'info', // 'success', 'error', 'info', 'warning'
    onClose,
    autoClose = true,
    duration = 5000 
}) => {
    useEffect(() => {
        console.log('Notification useEffect - isVisible:', isVisible, 'message:', message, 'type:', type);
        
        if (isVisible && autoClose) {
            console.log('Setting auto-close timer for', duration, 'ms');
            const timer = setTimeout(() => {
                console.log('Auto-closing notification');
                onClose();
            }, duration);

            return () => {
                console.log('Clearing auto-close timer');
                clearTimeout(timer);
            };
        }
    }, [isVisible, autoClose, duration, onClose, message, type]);

    if (!isVisible) {
        console.log('Notification not visible, returning null');
        return null;
    }

    console.log('Rendering notification:', { isVisible, message, type });

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="notification-icon success" />;
            case 'error':
                return <FaTimesCircle className="notification-icon error" />;
            case 'warning':
                return <FaExclamationTriangle className="notification-icon warning" />;
            default:
                return <FaInfoCircle className="notification-icon info" />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'success':
                return 'Success';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Warning';
            default:
                return 'Information';
        }
    };

    return (
        <div className={`notification notification-${type}`}>
            <div className="notification-content">
                {getIcon()}
                <div className="notification-text">
                    <h4 className="notification-title">{getTitle()}</h4>
                    <p className="notification-message">{message}</p>
                </div>
            </div>
            <button className="notification-close" onClick={onClose}>
                <FaTimesCircle />
            </button>
        </div>
    );
};

export default Notification; 