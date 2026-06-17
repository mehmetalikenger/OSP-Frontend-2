"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./profile.module.css";
import { fetchWithAuth } from "../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    const picInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        fetchWithAuth(`${API}/user/${userId}`, { credentials: 'include', cache: 'no-store' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                const name = [data.username, data.surname].filter(Boolean).join(' ');
                setUserName(name || '');
                if (data.imageUrl) setProfilePicUrl(data.imageUrl);
            })
            .catch(() => {});
    }, []);

    const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetchWithAuth(`${API}/user/${userId}/upload-profile-picture`, {
                method: 'POST',
                credentials: 'include',
                body: fd,
            });
            if (res.ok) {
                const profileRes = await fetchWithAuth(`${API}/user/${userId}`, { credentials: 'include', cache: 'no-store' });
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    if (data.imageUrl) setProfilePicUrl(data.imageUrl);
                }
            }
        } catch (e) { console.error('Profile picture upload failed', e); }
        e.target.value = '';
    };

    let activeOption = "Projects";
    if (pathname.includes("/saved-units")) {
        activeOption = "Saved Units";
    } else if (pathname.includes("/account-settings")) {
        activeOption = "Account Settings";
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const handleToggle = () => setIsSidebarOpen(prev => !prev);
        window.addEventListener('toggleMobileSidebar', handleToggle as EventListener);
        return () => window.removeEventListener('toggleMobileSidebar', handleToggle as EventListener);
    }, []);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.classList.add('mobile-sidebar-open');
        } else {
            document.body.classList.remove('mobile-sidebar-open');
        }
        return () => {
            document.body.classList.remove('mobile-sidebar-open');
        };
    }, [isSidebarOpen]);

    const handleOptionClick = (path: string, keepOpen: boolean = false) => {
        if (!keepOpen) {
            if (window.innerWidth < 1200 && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        }
        router.push(path);
    };

    return <>
        <div className={styles.container}>
            <div className={styles.sidebarPlaceholder}></div>
            <div className={`${styles.containerFirst} ${!isSidebarOpen ? styles.containerFirstClosed : ""}`}>
                <div className={styles.topIcon}>
                    <img
                        src="/icons/back.png"
                        alt="Toggle Sidebar"
                        className={`${isSidebarOpen ? styles.backIcon : styles.backIconReversed} ${styles.lightIcon}`}
                        onClick={toggleSidebar}
                    />
                    <img
                        src="/icons/back-darkMode.png"
                        alt="Toggle Sidebar"
                        className={`${isSidebarOpen ? styles.backIcon : styles.backIconReversed} ${styles.darkIcon}`}
                        onClick={toggleSidebar}
                    />
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.profilePic}>
                        <div
                            className={styles.profilePicWrapper}
                            onClick={() => picInputRef.current?.click()}
                        >
                            <img
                                className={styles.profilePicAvatar}
                                src={profilePicUrl || "/icons/profilePic.png"}
                                alt="Profile Picture"
                            />
                            <div className={styles.profilePicOverlay}>
                                <img src="/icons/photo.png" alt="Change photo" />
                            </div>
                        </div>
                        <input
                            ref={picInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleProfilePicChange}
                        />
                    </div>
                    <div className={styles.userName}>
                        <h2>{userName}</h2>
                    </div>
                    <div className={styles.infoLine}></div>
                </div>

                <div className={styles.menuOptions}>
                    <div
                        className={`${styles.option} ${activeOption === "Projects" ? styles.optionActive : ""}`}
                        onClick={() => handleOptionClick("/profile/projects")}
                    >
                        <div className={styles.optionIcon}>
                            {activeOption === "Projects" ? (
                                <img src="/icons/project-selected.png" alt="Projects" />
                            ) : (
                                <>
                                    <img className={styles.lightIcon} src="/icons/project.png" alt="Projects" />
                                    <img className={styles.darkIcon} src="/icons/project-darkMode.png" alt="Projects" />
                                </>
                            )}
                        </div>
                        <p>Projects</p>
                    </div>
                    <div className={styles.optionArea}>
                        <div
                            className={`${styles.option} ${activeOption === "Saved Units" ? styles.optionActive : ""}`}
                            onClick={() => handleOptionClick("/profile/saved-units/chillers", true)}
                        >
                            <div className={styles.optionIcon}>
                                {activeOption === "Saved Units" ? (
                                    <img src="/icons/bookmark-selected.png" alt="Saved Units" />
                                ) : (
                                    <>
                                        <img className={styles.lightIcon} src="/icons/bookmark.png" alt="Saved Units" />
                                        <img className={styles.darkIcon} src="/icons/bookmark-darkMode.png" alt="Saved Units" />
                                    </>
                                )}
                            </div>
                            <p>Saved Units</p>
                        </div>
                        <div className={styles.subOptionsArea}>
                            <div className={styles.optionsLine}></div>
                            <div className={styles.options}>
                                <div 
                                    className={`${styles.subOption} ${pathname.includes('/chillers') ? styles.subOptionActive : ''}`}
                                    onClick={(e) => { e.stopPropagation(); handleOptionClick('/profile/saved-units/chillers'); }}
                                >
                                    <p>Chiller</p>
                                </div>
                                <div 
                                    className={`${styles.subOption} ${pathname.includes('/heat-pumps') ? styles.subOptionActive : ''}`}
                                    onClick={(e) => { e.stopPropagation(); handleOptionClick('/profile/saved-units/heat-pumps'); }}
                                >
                                    <p>Heat Pump</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`${styles.option} ${activeOption === "Account Settings" ? styles.optionActive : ""}`}
                        onClick={() => handleOptionClick("/profile/account-settings")}
                    >
                        <div className={styles.optionIcon}>
                            {activeOption === "Account Settings" ? (
                                <img src="/icons/acSettings-selected.png" alt="Account Settings" />
                            ) : (
                                <>
                                    <img className={styles.lightIcon} src="/icons/acSettings.png" alt="Account Settings" />
                                    <img className={styles.darkIcon} src="/icons/acSettings-darkMode.png" alt="Account Settings" />
                                </>
                            )}
                        </div>
                        <p>Account Settings</p>
                    </div>
                    
                    <div className={`${styles.optionsLine} ${styles.mobileLogout}`} style={{ width: '100%', height: '1px', margin: '20px 0' }}></div>
                    
                    <div
                        className={`${styles.option} ${styles.mobileLogout}`}
                        onClick={async () => {
                            try {
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
                            } catch (e) { console.error(e); }
                            localStorage.removeItem('userId');
                            localStorage.removeItem('userRole');
                            window.location.href = '/login';
                        }}
                        style={{ marginTop: 'auto' }}
                    >
                        <p style={{ color: '#d9534f', fontWeight: 'bold' }}>Log out</p>
                    </div>
                </div>
            </div>
            <div className={styles.containerSecond}>
                {isSidebarOpen && (
                    <div className={styles.overlay} onClick={toggleSidebar}></div>
                )}
                {children}
            </div>
        </div>
    </>;
}
