"use client";
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from '../login/login.module.css';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPassword');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/forgot-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStatus('success');
        setMessage(t('successMessage'));
      } else {
        const errorText = await res.text();
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          // It's plain text
        }
        setStatus('error');
        setMessage(errorMessage || t('errorSendFailed'));
      }
    } catch {
      setStatus('error');
      setMessage(t('errorNetwork'));
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
          <h2>{t('title')}</h2>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: 'green', marginBottom: '20px' }}>{message}</p>
              <button className={styles.submitButton} onClick={() => window.location.href = '/login'}>
                {t('backToLogin')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className={styles.description}>
                {t('description')}
              </p>
              {status === 'error' && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{message}</p>}
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className={styles.submitButton} type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? t('submitting') : t('submit')}
              </button>
              <div style={{ textAlign: 'center' }}>
                <span
                  className={styles.forgotPassword}
                  onClick={() => window.location.href = '/login'}
                  style={{ cursor: 'pointer' }}
                >
                  {t('backToLoginLink')}
                </span>
              </div>
            </form>
          )}
        </div>
        <div className={styles.bottomLogo}>
          <img src="/logo/logo.png" alt="OffiTec Logo" />
        </div>
      </div>
    </div>
  );
}
