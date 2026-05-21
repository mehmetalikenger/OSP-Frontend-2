"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState<'en' | 'de'>('en');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

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
        <nav className={`${styles.nav} ${isDarkMode ? styles.navDark : ''}`}>
            <div className={styles.navContent}>
                <div className={`${styles.logo} ${isDarkMode ? styles.logoDark : ''}`}>
                    <h1>OffiSelect</h1>
                </div>
                <div className={styles.navButtons}>
                    <div className={`${styles.colorModeButtons} ${isDarkMode ? styles.colorModeButtonsDark : ''}`}>
                        <button 
                            className={`${styles.colorModeButton} ${isDarkMode ? styles.darkModeBtnActive : styles.darkModeBtn}`} 
                            type="button"
                            onClick={() => setIsDarkMode(true)}
                        >
                            <img src={isDarkMode ? "/icons/dark-mode-icon-second.png" : "/icons/dark-mode-icon.png"} alt="Moon" />
                        </button>
                        <button 
                            className={`${styles.colorModeButton} ${isDarkMode ? styles.lightModeBtnInactive : styles.lightModeBtn}`} 
                            type="button"
                            onClick={() => setIsDarkMode(false)}
                        >
                            <img src={isDarkMode ? "/icons/light-mode-icon-second.png" : "/icons/light-mode-icon.png"} alt="Sun" />
                        </button>
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