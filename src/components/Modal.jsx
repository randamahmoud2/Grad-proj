import React, { useEffect } from 'react';
import './Modal.css';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const Modal = ({ 
    isVisible, 
    title,
    message, 
    type = 'info', // 'success', 'error', 'info', 'warning'
    onClose,
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    autoClose = false,
    duration = 3000 
}) => {
    useEffect(() => {
        if (isVisible && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, duration, onClose]);

    // Close modal when clicking outside
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isVisible) {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="modal-icon success" />;
            case 'error':
                return <FaTimesCircle className="modal-icon error" />;
            case 'warning':
                return <FaExclamationTriangle className="modal-icon warning" />;
            default:
                return <FaInfoCircle className="modal-icon info" />;
        }
    };

    const getTitle = () => {
        if (title) return title;
        
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

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title-section">
                        {getIcon()}
                        <h3 className="modal-title">{getTitle()}</h3>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="modal-body">
                    <p className="modal-message">{message}</p>
                </div>
                
                <div className="modal-footer">
                    {showCancel && (
                        <button className="modal-button modal-button-secondary" onClick={onClose}>
                            {cancelText}
                        </button>
                    )}
                    <button className="modal-button modal-button-primary" onClick={handleConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal; 