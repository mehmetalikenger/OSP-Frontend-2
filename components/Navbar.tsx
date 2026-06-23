"use client";
import { useState, useEffect, useRef, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { fetchWithAuth } from '@/lib/api';
import { setUserLocale } from '@/i18n/locale';

export default function Navbar({ initialDark = false }: { initialDark?: boolean }) {
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const router = useRouter();
    const [, startLocaleTransition] = useTransition();

    const [isDarkMode, setIsDarkMode] = useState(initialDark);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const [userRole, setUserRole] = useState<string | null>(null);
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

    useEffect(() => {
        setUserRole(localStorage.getItem('userRole'));

        // Show the user's profile picture in place of the default icon when they have one.
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.imageUrl) setProfilePicUrl(data.imageUrl);
            })
            .catch(() => {});
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error("Logout error", e);
        }
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
    };

    // Persist the language choice in a cookie, then refresh so the server
    // re-renders every component with the new locale's messages.
    const toggleLanguage = () => {
        const next = locale === 'en' ? 'de' : 'en';
        startLocaleTransition(async () => {
            await setUserLocale(next);
            router.refresh();
        });
    };

    const pathname = usePathname();
    const isAdmin = pathname.includes('/admin-panel');
    const isProfile = pathname.includes('/profile');

    const userMenuRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show navbar if we are near the top, hide when scrolling down, show when scrolling up
            if (currentScrollY <= 50) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        document.body.style.backgroundColor = isDarkMode ? '#1b1b1b' : 'white';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        document.cookie = `theme=${isDarkMode ? 'dark' : 'light'}; path=/; max-age=31536000; SameSite=Lax`;
    }, [isDarkMode]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className={`${styles.nav} ${isDarkMode ? styles.navDark : ''} ${!isVisible ? styles.navHidden : ''}`}>
            <div className={styles.navContent}>
                <div className={styles.logo}>
                    <Link href="/chiller" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <img src="/logo/logo-2.png" alt="OSP Logo" className={styles.logoLight} />
                        <img src="/logo/logo-1.png" alt="OSP Logo" className={styles.logoDark} />
                    </Link>
                </div>
                <div className={styles.navButtons}>
                    <div className={styles.toggleContainer}>
                        <img
                            src="/icons/light-mode-icon.png"
                            alt="Sun"
                            className={styles.toggleIcon}
                            onClick={() => setIsDarkMode(false)}
                        />
                        <div
                            className={`${styles.toggleTrack} ${isDarkMode ? styles.toggleTrackDark : ''}`}
                            onClick={() => setIsDarkMode(!isDarkMode)}
                        >
                            <div className={`${styles.toggleHandle} ${isDarkMode ? styles.toggleHandleDark : ''}`}></div>
                        </div>
                        <img
                            src="/icons/dark-mode-icon.png"
                            alt="Moon"
                            className={styles.toggleIconMoon}
                            onClick={() => setIsDarkMode(true)}
                        />
                    </div>
                    <div
                        className={styles.languageButtons}
                        onClick={toggleLanguage}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={locale === 'en' ? "/icons/english-lan-icon.png" : "/icons/german-lan-icon.png"} alt={locale.toUpperCase()} />
                    </div>
                    <div className={styles.userIcon} ref={userMenuRef}>
                        <img
                            src={profilePicUrl || (isDarkMode ? "/icons/user-icon-second.png" : "/icons/user-icon.png")}
                            alt="User"
                            style={profilePicUrl
                                ? { cursor: 'pointer', width: '37px', height: '37px', borderRadius: '50%', objectFit: 'cover' }
                                : { cursor: 'pointer' }}
                            className={styles.desktopUserIcon}
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        />
                        <div 
                            className={styles.mobileHamburgerIcon} 
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                if (isAdmin || isProfile) {
                                    window.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
                                } else {
                                    setIsUserMenuOpen(!isUserMenuOpen);
                                }
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </div>
                        {isUserMenuOpen && (
                            <div className={styles.dropdownMenu}>
                                <Link href="/profile" className={styles.dropdownItem} style={{ textDecoration: 'none' }} onClick={() => setIsUserMenuOpen(false)}>{t('profile')}</Link>
                                {userRole === 'ADMIN' && (
                                    <Link href="/admin-panel" className={styles.dropdownItem} style={{ textDecoration: 'none' }} onClick={() => setIsUserMenuOpen(false)}>{t('adminPanel')}</Link>
                                )}
                                <button className={styles.dropdownItem} onClick={handleLogout}>{t('logout')}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}