"use client";
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState<'en' | 'de'>('en');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setUserRole(localStorage.getItem('userRole'));
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8080/auth/logout', {
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
                        onClick={() => setLanguage(prev => prev === 'en' ? 'de' : 'en')}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={language === 'en' ? "/icons/english-lan-icon.png" : "/icons/german-lan-icon.png"} alt={language.toUpperCase()} />
                    </div>
                    <div className={styles.userIcon} ref={userMenuRef}>
                        <img 
                            src={isDarkMode ? "/icons/user-icon-second.png" : "/icons/user-icon.png"} 
                            alt="User" 
                            style={{ cursor: 'pointer' }} 
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
                                <Link href="/profile" className={styles.dropdownItem} style={{ textDecoration: 'none' }} onClick={() => setIsUserMenuOpen(false)}>Profile</Link>
                                {userRole === 'ADMIN' && (
                                    <Link href="/admin-panel" className={styles.dropdownItem} style={{ textDecoration: 'none' }} onClick={() => setIsUserMenuOpen(false)}>Admin Panel</Link>
                                )}
                                <button className={styles.dropdownItem} onClick={handleLogout}>Log out</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}