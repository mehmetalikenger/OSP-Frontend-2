"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../login/login.module.css';

function DeleteAccountContent() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const handleDelete = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid link. No token provided.');
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
        setMessage('Your account has been successfully deleted. You can reactivate your account by logging in within 30 days.');
      } else {
        const errorText = await res.text();
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch (e) {
          // It's plain text
        }
        setStatus('error');
        setMessage(errorMessage || 'Failed to delete account. The link may have expired.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again later.');
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
          <h2>Confirm Account Deletion</h2>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: 'green', marginBottom: '20px' }}>{message}</p>
              <button className={styles.submitButton} onClick={() => router.push('/login')}>
                Go to Login
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: '#d7292e', textAlign: 'center', marginTop: '40px', marginBottom: '20px', fontSize: '0.9rem' }}>
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              {status === 'error' && <p style={{ color: '#d7292e', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', width: '100%', marginTop: '10px' }}>
                <button 
                  className={styles.submitButton} 
                  onClick={handleDelete}
                  disabled={status === 'loading'}
                  style={{ flex: 1 }}
                >
                  {status === 'loading' ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button 
                  className={styles.secondaryButton} 
                  onClick={() => router.push('/login')}
                  disabled={status === 'loading'}
                  style={{ flex: 1 }}
                >
                  Cancel
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

export default function DeleteAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DeleteAccountContent />
    </Suspense>
  );
}
