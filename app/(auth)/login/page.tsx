"use client";
import { useState } from 'react';
import styles from './login.module.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.vectors}>
        <img className={styles.vectorLeft} src="/images/login-bg-left-2.png" alt="Login Vector Left" />
        <img className={styles.vectorRight} src="/images/login-bg-right-2.png" alt="Login Vector Right" />
      </div>
      <div className={styles.loginMain}>
        <div className={styles.logo}>
          <h1>OffiSelect</h1>
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
              <form onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Email" required />
                <div className={styles.passwordArea}>
                  <input type={showPassword ? "text" : "password"} placeholder="Password" required />
                  <div className={styles.passwordEye} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                    <img 
                      src="/icons/pass-eye.png" 
                      alt="Eye" 
                      style={{ opacity: showPassword ? 0.4 : 1, transition: 'opacity 0.2s' }} 
                    />
                  </div>
                </div>
                <span 
                  className={styles.forgotPassword} 
                  onClick={() => setIsForgotMode(true)}
                  style={{ cursor: 'pointer' }}
                >
                  Forgot password?
                </span>
                <button className={styles.submitButton} type="submit">Log in</button>
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
