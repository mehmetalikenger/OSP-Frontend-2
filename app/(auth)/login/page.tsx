"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from './login.module.css';

export default function LoginPage() {
  const t = useTranslations('Login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     if (params.get('deleted') === 'true') {
         setIsDeleted(true);
     }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userRole', data.role);
        if (data.reactivated) {
            router.push('/products?reactivated=true');
        } else {
            router.push('/products');
        }
      } else {
        try {
            const errorData = await res.json();
            if (errorData.message && errorData.message.includes("deleted")) {
                setError(t('errorAccountDeleted'));
            } else if (errorData.error && errorData.error.includes("deleted")) {
                setError(t('errorAccountDeleted'));
            } else {
                setError(t('errorInvalidCredentials'));
            }
        } catch {
            setError(t('errorInvalidCredentials'));
        }
      }
    } catch {
      setError(t('errorNetwork'));
    } finally {
      setLoading(false);
    }
  };

  if (isDeleted) {
    return (
      <div className={`${styles.container} ${styles.deletedWrapper}`}>
        <div className={styles.deletedBox}>
          <h2>{t('deletionStartedTitle')}</h2>
          <p>{t('deletionStartedBody')}</p>
          <button onClick={() => window.location.href = '/login'}>
             {t('backToLogin')}
          </button>
        </div>
      </div>
    );
  }

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
            <>
              <h2>{t('title')}</h2>
              <form onSubmit={handleLogin}>
                {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <div className={styles.passwordArea}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder={t('passwordPlaceholder')}
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
                    {t('rememberMe')}
                  </label>
                  <span
                    className={styles.forgotPassword}
                    onClick={() => router.push('/forgot-password')}
                    style={{ cursor: 'pointer', margin: 0 }}
                  >
                    {t('forgotPassword')}
                  </span>
                </div>
                <button className={styles.submitButton} type="submit" disabled={loading}>
                  {loading ? t('submitting') : t('submit')}
                </button>
              </form>
            </>
        </div>
        <div className={styles.bottomLogo}>
          <img src="/logo/logo.png" alt="OffiTec Logo" />
        </div>
      </div>
    </div>
  )
}
