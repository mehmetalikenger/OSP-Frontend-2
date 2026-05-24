"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState<'en' | 'de'>('en');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    
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
        document.body.style.backgroundColor = isDarkMode ? '#262626' : 'white';
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
                <div className={`${styles.logo} ${isDarkMode ? styles.logoDark : ''}`}>
                    <Link href="/chiller" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h1>OffiSelect</h1>
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
                    <div className={styles.userIcon} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} ref={userMenuRef}>
                        <img src={isDarkMode ? "/icons/user-icon-second.png" : "/icons/user-icon.png"} alt="User" style={{ cursor: 'pointer' }} />
                        {isUserMenuOpen && (
                            <div className={styles.dropdownMenu}>
                                <button className={styles.dropdownItem}>Profile</button>
                                <button className={styles.dropdownItem}>Log out</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}