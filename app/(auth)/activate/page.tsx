"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from '../login/login.module.css';

function ActivateContent() {
  const t = useTranslations('Activate');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleActivate = async () => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage(t('errorNoToken'));
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage(t('errorPasswordsMismatch'));
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage(t('errorPasswordTooShort'));
      return;
    }

    setStatus('loading');
    setMessage(t('activating'));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: password })
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
        setMessage(errorMessage || t('errorActivateFailed'));
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

          {status !== 'success' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleActivate(); }}>
              <p className={styles.description}>
                {t('description')}
              </p>
              {status === 'error' && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>{message}</p>}

              <div className={styles.passwordArea}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('newPasswordPlaceholder')}
                  required
                  minLength={8}
                />
                <div className={styles.passwordEye} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                  <img
                    src="/icons/pass-eye.png"
                    alt="Toggle Visibility"
                    style={{ opacity: showPassword ? 0.4 : 1, transition: 'opacity 0.2s' }}
                  />
                </div>
              </div>

              <div className={styles.passwordArea}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                  minLength={8}
                />
                <div className={styles.passwordEye} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }}>
                  <img
                    src="/icons/pass-eye.png"
                    alt="Toggle Visibility"
                    style={{ opacity: showConfirmPassword ? 0.4 : 1, transition: 'opacity 0.2s' }}
                  />
                </div>
              </div>



              <button 
                className={styles.submitButton} 
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? t('submitting') : t('submit')}
              </button>
            </form>
          ) : (
            <>
              <p style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center', color: 'green' }}>
                {message}
              </p>
              <button
                className={styles.submitButton}
                onClick={() => router.push('/login')}
              >
                {t('goToLogin')}
              </button>
            </>
          )}
        </div>
        <div className={styles.bottomLogo}>
          <img src="/logo/logo.png" alt="OffiTec Logo" />
        </div>
      </div>
    </div>
  );
}

function ActivateFallback() {
  const t = useTranslations('Activate');
  return <div>{t('loading')}</div>;
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<ActivateFallback />}>
      <ActivateContent />
    </Suspense>
  );
}
