import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed. Verify credentials.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '40px 36px',
          boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
          animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--r-md)',
              background: 'linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              boxShadow: '0 8px 24px var(--accent-glow)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 0 12px rgba(255, 255, 255, 0.9)',
              }}
            />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-text-1)', letterSpacing: '0.04em' }}>
              LUMÉ
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--accent)',
                background: 'var(--accent-light)',
                padding: '2px 8px',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              OPS
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--c-text-3)', marginTop: 4 }}>
            Aero Enterprise Operations & Kafka Telemetry Console
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--c-text-2)',
                textTransform: 'uppercase',
                marginBottom: 8,
                letterSpacing: '0.06em',
              }}
            >
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--c-text-3)',
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="glass-input"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--c-text-2)',
                textTransform: 'uppercase',
                marginBottom: 8,
                letterSpacing: '0.06em',
              }}
            >
              Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--c-text-3)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="glass-input"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 42px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--c-text-3)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-light)',
              border: '1px solid var(--border-subtle)',
              fontSize: 12,
              color: 'var(--c-text-2)',
              lineHeight: 1.5,
            }}
          >
            🔐 <strong>Administrator Credentials:</strong><br />
            <code>admin@example.com</code> / <code>password123</code>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="glass-btn-primary"
            style={{
              padding: '14px',
              borderRadius: 'var(--r-full)',
              fontSize: 14,
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all var(--transition)',
              marginTop: 4,
            }}
          >
            {isLoading ? (
              <span>Authenticating JWT...</span>
            ) : (
              <>
                <span>Enter Operations Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
