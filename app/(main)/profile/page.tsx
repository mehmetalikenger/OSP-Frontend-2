"use client";

import { useState } from "react";
import styles from "./profile.module.css";

export default function ProfilePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeOption, setActiveOption] = useState("Projects");

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleOptionClick = (option: string) => {
        setActiveOption(option);
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    };

    return <>
        <div className={styles.container}>
            <div className={`${styles.containerFirst} ${!isSidebarOpen ? styles.containerFirstClosed : ""}`}>
                <div className={styles.topIcon}>
                    <img 
                        src="./icons/back.png" 
                        alt="Toggle Sidebar" 
                        className={`${isSidebarOpen ? styles.backIcon : styles.backIconReversed} ${styles.lightIcon}`}
                        onClick={toggleSidebar}
                    />
                    <img 
                        src="./icons/back-darkMode.png" 
                        alt="Toggle Sidebar" 
                        className={`${isSidebarOpen ? styles.backIcon : styles.backIconReversed} ${styles.darkIcon}`}
                        onClick={toggleSidebar}
                    />
                </div>
                
                <div className={styles.userInfo}>
                    <div className={styles.profilePic}>
                        <img src="./icons/profilePic.png" alt="Profile Picture" />
                    </div>
                    <div className={styles.userName}>
                        <h2>Company Name</h2>
                    </div>
                    <div className={styles.infoLine}></div>
                </div>
                
                <div className={styles.menuOptions}>
                    <div 
                        className={`${styles.option} ${activeOption === "Projects" ? styles.optionActive : ""}`}
                        onClick={() => handleOptionClick("Projects")}
                    >
                        <div className={styles.optionIcon}>
                            {activeOption === "Projects" ? (
                                <img src="./icons/project-selected.png" alt="Projects" />
                            ) : (
                                <>
                                    <img className={styles.lightIcon} src="./icons/project.png" alt="Projects" />
                                    <img className={styles.darkIcon} src="./icons/project-darkMode.png" alt="Projects" />
                                </>
                            )}
                        </div>
                        <p>Projects</p>
                    </div>
                    <div 
                        className={`${styles.option} ${activeOption === "Saved Units" ? styles.optionActive : ""}`}
                        onClick={() => handleOptionClick("Saved Units")}
                    >
                        <div className={styles.optionIcon}>
                            {activeOption === "Saved Units" ? (
                                <img src="./icons/bookmark-selected.png" alt="Saved Units" />
                            ) : (
                                <>
                                    <img className={styles.lightIcon} src="./icons/bookmark.png" alt="Saved Units" />
                                    <img className={styles.darkIcon} src="./icons/bookmark-darkMode.png" alt="Saved Units" />
                                </>
                            )}
                        </div>
                        <p>Saved Units</p>
                    </div>
                    <div 
                        className={`${styles.option} ${activeOption === "Account Settings" ? styles.optionActive : ""}`}
                        onClick={() => handleOptionClick("Account Settings")}
                    >
                        <div className={styles.optionIcon}>
                            {activeOption === "Account Settings" ? (
                                <img src="./icons/acSettings-selected.png" alt="Account Settings" />
                            ) : (
                                <>
                                    <img className={styles.lightIcon} src="./icons/acSettings.png" alt="Account Settings" />
                                    <img className={styles.darkIcon} src="./icons/acSettings-darkMode.png" alt="Account Settings" />
                                </>
                            )}
                        </div>
                        <p>Account Settings</p>
                    </div>
                </div>
            </div>
            <div className={styles.containerSecond}>
            </div>
        </div>
    </>;
}