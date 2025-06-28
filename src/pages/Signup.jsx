import './Login.css';
import React, { useState } from 'react';
import logo from "../image/tooth.png";
import emailIcon from "../image/email.png";
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const Signup = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        specialty: '',
        experience: '',
        age: '',
        gender: '',
        nationalId: '',
        address: '',
        phoneNumber: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Notification state
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'info'
    });

    const styles = {
        buttonGroup: {
            display: 'flex',
            marginTop: '10px',
            justifyContent: 'space-between',
        },
        backButton: {
            width: '30%',
            color: '#fff',
            height: '35px',
            border: 'none',
            outline: 'none',
            fontWeight: 600,
            fontSize: '16px',
            padding: '8px 0',
            cursor: 'pointer',
            marginTop: '10px',
            marginRight: '2%',
            overflow: 'hidden',
            borderRadius: '12px',
            position: 'relative',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(26, 35, 126, 0.15)',
            background: 'linear-gradient(120deg, #2ecc71, #2697e2)',
        },
        container: {
            height: 'auto',
            maxHeight: '100vh',
            overflow: 'hidden',
        },
        formContainer: {
            padding: '10px',
            height: 'auto',
            overflow: 'hidden',
        },
        inputGroup: {
            marginBottom: '8px',
        },
        inputField: {
            height: '32px',
        },
        logo: {
            maxWidth: '40px',
            maxHeight: '40px',
        },
        heading: {
            fontSize: '1.5rem',
            marginBottom: '10px',
        },
        label: {
            marginBottom: '2px',
            fontSize: '0.9rem',
        },
        input: {
            padding: '6px',
        },
        loginButton: {
            padding: '8px 0',
            marginTop: '10px',
        },
        welcomeContent: {
            transform: 'scale(0.9)',
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateStepOne = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.gender || !formData.role) {
            setError('Please fill all required fields');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        setError('');
        return true;
    };

    const handleNextStep = () => {
        if (validateStepOne()) {
            setCurrentStep(2);
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({
            isVisible: true,
            message,
            type
        });
    };

    const hideNotification = () => {
        setNotification(prev => ({
            ...prev,
            isVisible: false
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate all fields
        if (!formData.name || !formData.age || !formData.nationalId || !formData.address) {
            setError('Please fill all required fields');
            setIsLoading(false);
            return;
        }

        if (formData.role === 'doctor' && !formData.specialty) {
            setError('Please fill all required fields');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5068/api/Auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    gender: formData.gender,
                    age: parseInt(formData.age),
                    nationalId: formData.nationalId,
                    address: formData.address,
                    specialty: formData.specialty,
                    experience: formData.experience,    
                    phoneNumber: formData.phoneNumber
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            if (formData.role === 'doctor' || formData.role === 'receptionist') {
                showNotification('Your signup request has been submitted. Please wait for manager approval.', 'success');
            } else {
                showNotification('Account created successfully!', 'success');
            }
            
            console.log('Submitting with:', {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                // other fields...
            });
            
            // Navigate after a short delay to show the notification
            setTimeout(() => {
                navigate('/');
            }, 3000); // 3 seconds delay to show the notification
        } catch (err) {
            showNotification(err.message || 'Failed to create account. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepOne = () => (
        <div>
            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <div className='input-field' style={styles.inputField}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <img src={emailIcon} alt="" style={{width: '16px', height: '16px'}} />
                </div>
            </div>

            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div className='input-field' style={styles.inputField}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password (min 6 characters)"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        style={styles.input}
                    />
                </div>
            </div>

            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div className='input-field' style={styles.inputField}>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength="6"
                        style={styles.input}
                    />
                </div>
            </div>

            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>Gender</label>
                <div className='input-field' style={styles.inputField}>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="role-select"
                        style={styles.input}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
            </div>

            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>Role</label>
                <div className='input-field' style={styles.inputField}>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="role-select"
                        style={styles.input}
                    >
                        <option value="">Select Role</option>
                        <option value="doctor">Doctor</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="manager">Manager</option>
                        <option value="patient">Patient</option>
                    </select>
                </div>
            </div>

            <button 
                type="button" 
                className="login-button" 
                onClick={handleNextStep} 
                style={styles.loginButton}
                disabled={isLoading}
            >
                {isLoading ? 'Processing...' : 'Next'}
            </button>
        </div>
    );

    const renderStepTwo = () => (
        <div>
            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <div className='input-field' style={styles.inputField}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
            </div>

            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <div className='input-field' style={styles.inputField}>
                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>
            </div>

            {formData.role === 'doctor' && (
                <>
                    <div className='input-group' style={styles.inputGroup}>
                        <label style={styles.label}>Specialty</label>
                        <div className='input-field' style={styles.inputField}>
                            <input
                                type="text"
                                name="specialty"
                                placeholder="Enter your specialty"
                                value={formData.specialty}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div className='input-group' style={styles.inputGroup}>
                        <label style={styles.label}>Experience (years)</label>
                        <div className='input-field' style={styles.inputField}>
                            <input
                                type="number"
                                name="experience"
                                placeholder="Years of experience"
                                value={formData.experience}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>
                </>
            )}

            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>Age</label>
                <div className='input-field' style={styles.inputField}>
                    <input
                        type="number"
                        name="age"
                        placeholder="Enter your age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
            </div>

            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>National ID</label>
                <div className='input-field' style={styles.inputField}>
                    <input
                        type="text"
                        name="nationalId"
                        placeholder="Enter your national ID"
                        value={formData.nationalId}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
            </div>

            <div className='input-group' style={styles.inputGroup}>
                <label style={styles.label}>Address</label>
                <div className='input-field' style={styles.inputField}>
                    <input
                        type="text"
                        name="address"
                        placeholder="Enter your address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
            </div>

            <div style={styles.buttonGroup}>
                <button 
                    type="button" 
                    className='back-button'
                    style={styles.backButton} 
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading}
                >
                    Back
                </button>
                <button 
                    type="submit" 
                    className="login-button" 
                    style={styles.loginButton}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Sign Up'}
                </button>
            </div>
        </div>
    );

    return (
        <div className='login' style={styles.container}>
            {/* Notification Component */}
            <Notification
                isVisible={notification.isVisible}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
                autoClose={true}
                duration={8000}
            />
            
            <div className='content1'>
                <div className='left'>
                    <div className="login-header">
                        <img src={logo} alt="ToothTone Logo" className="login-logo" style={styles.logo} />
                        <h1 style={styles.heading}>ToothTone</h1>
                    </div>

                    <div className="login-form-container" style={styles.formContainer}>
                        <h2 style={styles.heading}>Create Account {currentStep === 1 ? '- Step 1' : '- Step 2'}</h2>
                        {error && <div className="error-message">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            {currentStep === 1 ? renderStepOne() : renderStepTwo()}
                        </form>

                        <div className="login-footer">
                            <p style={{fontSize: '0.9rem', marginTop: '8px'}}>Already have an account? 
                                <span onClick={() => navigate('/')} className="signup-link">
                                    Login here
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="right">
                    <div className="welcome-content" style={styles.welcomeContent}>
                        <h2 style={styles.heading}>Join ToothTone</h2>
                        <p>Your Journey to Better Dental Care Starts Here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;