"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from '../login/login.module.css';

function DeleteAccountContent() {
  const t = useTranslations('DeleteAccount');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const handleDelete = async () => {
    if (!token) {
      setStatus('error');
      setMessage(t('errorNoToken'));
      return;
    }

    setStatus('loading');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        setMessage(errorMessage || t('errorDeleteFailed'));
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
            <div>
              <p style={{ color: '#d7292e', textAlign: 'center', marginTop: '40px', marginBottom: '20px', fontSize: '0.9rem' }}>
                {t('confirmText')}
              </p>
              {status === 'error' && <p style={{ color: '#d7292e', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', width: '100%', marginTop: '10px' }}>
                <button 
                  className={styles.submitButton} 
                  onClick={handleDelete}
                  disabled={status === 'loading'}
                  style={{ flex: 1 }}
                >
                  {status === 'loading' ? t('deleting') : t('confirmDelete')}
                </button>
                <button
                  className={styles.secondaryButton}
                  onClick={() => router.push('/login')}
                  disabled={status === 'loading'}
                  style={{ flex: 1 }}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className={styles.bottomLogo}>
          <img src="/logo/logo.png" alt="OffiTec Logo" />
        </div>
      </div>
    </div>
  );
}

function DeleteAccountFallback() {
  const t = useTranslations('DeleteAccount');
  return <div>{t('loading')}</div>;
}

export default function DeleteAccountPage() {
  return (
    <Suspense fallback={<DeleteAccountFallback />}>
      <DeleteAccountContent />
    </Suspense>
  );
}
