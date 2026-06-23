"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from '../login/login.module.css';

function ResetPasswordContent() {
  const t = useTranslations('ResetPassword');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage(t('errorNoToken'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage(t('errorPasswordsMismatch'));
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (res.ok) {
        setStatus('success');
        setMessage(t('successMessage'));
      } else {
        const errorText = await res.text();
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors && errorJson.errors.length > 0) {
            errorMessage = errorJson.errors[0].defaultMessage;
          } else {
            errorMessage = errorJson.message || errorJson.error || errorText;
          }
        } catch {
          // It's plain text
        }
        setStatus('error');
        setMessage(errorMessage || t('errorResetFailed'));
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
              <button className={styles.submitButton} onClick={() => router.push('/login')}>
                {t('goToLogin')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset}>
              <p className={styles.description}>
                {t('description')}
              </p>
              {status === 'error' && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{message}</p>}
              
              <div className={styles.passwordArea}>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder={t('newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                  minLength={6}
                />
                <div className={styles.passwordEye} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                  <img
                    src="/icons/pass-eye.png"
                    alt="Eye"
                    style={{ opacity: showPassword ? 0.4 : 1, transition: 'opacity 0.2s' }}
                  />
                </div>
              </div>

              <div className={styles.passwordArea}>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  minLength={6}
                />
                <div className={styles.passwordEye} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }}>
                  <img
                    src="/icons/pass-eye.png"
                    alt="Eye"
                    style={{ opacity: showConfirmPassword ? 0.4 : 1, transition: 'opacity 0.2s' }}
                  />
                </div>
              </div>

              <button className={styles.submitButton} type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? t('submitting') : t('submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  const t = useTranslations('ResetPassword');
  return <div>{t('loading')}</div>;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
