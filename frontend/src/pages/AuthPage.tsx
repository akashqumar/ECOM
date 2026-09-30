import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AppContext';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (activeTab === 'signin') {
        await login(email, password);
      } else {
        await register(firstName, lastName, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        {/* Left Editorial Panel */}
        <div className="auth-editorial">
          <div className="editorial-content">
            <h1 className="editorial-logo">LUMÉ</h1>
            <p className="editorial-quote">
              "Style is a way to say who you are without having to speak."
            </p>
          </div>
          <div className="editorial-bg"></div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signin'); setError(''); }}
              >
                Sign in
              </button>
              <button 
                className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => { setActiveTab('register'); setError(''); }}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {activeTab === 'register' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input 
                      id="firstName"
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input 
                      id="lastName"
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {activeTab === 'signin' && (
                <p className="auth-hint">Try: demo@example.com / password123</p>
              )}

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="spinner" size={20} /> : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          background: var(--c-bg);
        }
        
        .auth-container {
          display: flex;
          width: 100%;
          min-height: 100vh;
        }

        /* Editorial Left Panel */
        .auth-editorial {
          flex: 1;
          position: relative;
          background: #111;
          color: #FFF;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 10%;
          overflow: hidden;
        }
        .editorial-content {
          position: relative;
          z-index: 2;
          max-width: 500px;
        }
        .editorial-logo {
          font-size: 48px;
          font-weight: 800;
          letter-spacing: 4px;
          margin-bottom: 40px;
          margin-top: 0;
        }
        .editorial-quote {
          font-size: 32px;
          font-weight: 300;
          line-height: 1.4;
          opacity: 0.9;
        }
        .editorial-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(28,28,30,0.9) 0%, rgba(10,10,12,0.95) 100%);
          z-index: 1;
        }

        /* Form Right Panel */
        .auth-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: var(--c-bg);
        }
        .auth-form-wrapper {
          width: 100%;
          max-width: 420px;
          background: var(--c-surface);
          padding: 48px;
          border-radius: var(--r-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--c-border);
        }

        .auth-tabs {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--c-border-subtle);
        }
        .auth-tab {
          background: none;
          border: none;
          padding: 0 0 12px 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--c-text-2);
          cursor: pointer;
          position: relative;
          transition: color var(--transition);
        }
        .auth-tab:hover {
          color: var(--c-text-1);
        }
        .auth-tab.active {
          color: var(--c-text-1);
          font-weight: 600;
        }
        .auth-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--c-text-1);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          flex: 1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: var(--c-text-2);
        }
        .form-group input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--c-border);
          border-radius: var(--r-md);
          background: var(--c-surface);
          color: var(--c-text-1);
          font-size: 15px;
          transition: border-color var(--transition), box-shadow var(--transition);
          box-sizing: border-box;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--c-accent-2);
          box-shadow: 0 0 0 2px rgba(196, 151, 74, 0.1);
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--c-text-3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .password-toggle:hover {
          color: var(--c-text-2);
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(220, 38, 38, 0.1);
          color: var(--c-error);
          border-radius: var(--r-md);
          font-size: 14px;
          font-weight: 500;
        }

        .auth-hint {
          font-size: 13px;
          color: var(--c-text-3);
          margin: -8px 0 0 0;
        }

        .auth-submit {
          width: 100%;
          height: 48px;
          margin-top: 12px;
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          border-radius: var(--r-full);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity var(--transition), transform var(--transition);
        }
        .auth-submit:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .auth-editorial {
            display: none;
          }
          .auth-form-panel {
            padding: 20px;
          }
          .auth-form-wrapper {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
}
