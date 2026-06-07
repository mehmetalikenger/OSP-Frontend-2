"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './login.module.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:8080/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userRole', data.role);
        router.push('/chiller');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.vectors}>
        <img className={styles.vectorLeft} src="/images/login-bg-left-2.png" alt="Login Vector Left" />
        <img className={styles.vectorRight} src="/images/login-bg-right-2.png" alt="Login Vector Right" />
      </div>
      <div className={styles.loginMain}>
        <div className={styles.logo}>
          <img src="/logo/logo-2.png" alt="OSP Logo" className={styles.logoLight} />
          <img src="/logo/logo-1.png" alt="OSP Logo" className={styles.logoDark} />
        </div>
        <div className={styles.loginContainer}>
          {isForgotMode ? (
            <>
              <h2>Reset Password</h2>
              <form onSubmit={(e) => e.preventDefault()}>
                <p className={styles.description}>
                  Enter your email address and we will send you a link to reset your password.
                </p>
                <input type="email" placeholder="Email" required />
                <button className={styles.submitButton} type="submit">Send Reset Link</button>
                <span
                  className={styles.forgotPassword}
                  onClick={() => setIsForgotMode(false)}
                  style={{ cursor: 'pointer', textAlign: 'center', marginTop: '10px' }}
                >
                  Back to Log in
                </span>
              </form>
            </>
          ) : (
            <>
              <h2>Log in</h2>
              <form onSubmit={handleLogin}>
                {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <div className={styles.passwordArea}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <div className={styles.passwordEye} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                    <img
                      src="/icons/pass-eye.png"
                      alt="Eye"
                      style={{ opacity: showPassword ? 0.4 : 1, transition: 'opacity 0.2s' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-color, #333)' }}>
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                      style={{ margin: 0, cursor: 'pointer' }}
                    />
                    Remember me
                  </label>
                  <span
                    className={styles.forgotPassword}
                    onClick={() => setIsForgotMode(true)}
                    style={{ cursor: 'pointer', margin: 0 }}
                  >
                    Forgot password?
                  </span>
                </div>
                <button className={styles.submitButton} type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>
            </>
          )}
        </div>
        <div className={styles.bottomLogo}>
          <img src="/logo/logo.png" alt="OffiTec Logo" />
        </div>
      </div>
    </div>
  )
}
