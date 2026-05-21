import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.vectors}>
        <img className={styles.vectorLeft} src="/images/login-bg-left.png" alt="Login Vector Left" />
        <img className={styles.vectorRight} src="/images/login-bg-right.png" alt="Login Vector Right" />
      </div>
      <div className={styles.loginMain}>
        <div className={styles.logo}>
          <h1>OffiSelect</h1>
        </div>
        <div className={styles.loginContainer}>
          <h2>Log in</h2>
          <form>
            <input type="text" placeholder="Email" />
            <div className={styles.passwordArea}>
              <input type="password" placeholder="Password" />
              <div className={styles.passwordEye}>
                <img src="/icons/pass-eye.png" alt="Eye" />
              </div>
            </div>
            <Link href="" className={styles.forgotPassword}>Forgot password?</Link>
            <button className={styles.submitButton} type="submit">Log in</button>
          </form>
        </div>
        <div className={styles.bottomLogo}>
          <img src="/logo/logo.png" alt="OffiTec Logo" />
        </div>
      </div>
    </div>
  )
}
