"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./profile.module.css";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

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
        if (keepOpen) {
            if (window.innerWidth >= 1024 && !isSidebarOpen) {
                setIsSidebarOpen(true);
            }
        } else {
            if (window.innerWidth < 1024 && isSidebarOpen) {
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
                        <img src="/icons/profilePic.png" alt="Profile Picture" />
                    </div>
                    <div className={styles.userName}>
                        <h2>Company Name</h2>
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
                    
                    <div className={styles.optionsLine} style={{ width: '100%', height: '1px', margin: '20px 0' }}></div>
                    
                    <div
                        className={styles.option}
                        onClick={() => {
                            // Handle logout logic here
                            console.log("Logout clicked");
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
