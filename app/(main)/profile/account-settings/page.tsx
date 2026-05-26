"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./accountSettings.module.css";
import sharedStyles from "../sharedProfile.module.css";

export default function AccountSettingsPage() {
    const [infoChanged, setInfoChanged] = useState(false);
    const [addressChanged, setAddressChanged] = useState(false);
    const [securityChanged, setSecurityChanged] = useState(false);

    const [toastMessage, setToastMessage] = useState("");
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const deleteWarningRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showDeleteWarning && deleteWarningRef.current) {
            deleteWarningRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [showDeleteWarning]);

    const handleSave = () => {
        setToastMessage("Changes are saved");
        setInfoChanged(false);
        setAddressChanged(false);
        setSecurityChanged(false);
        setTimeout(() => setToastMessage(""), 3000);
    };
    return (
        <div className={sharedStyles.pageContentContainer}>
            {toastMessage && (
                <div className={styles.toast}>
                    {toastMessage}
                </div>
            )}
            <div className={sharedStyles.header}>
                <div className={sharedStyles.headerContent}>
                    <div className={sharedStyles.headerBullet}></div>
                    <h1>Account Settings</h1>
                </div>
                <div className={sharedStyles.headerLine}></div>
            </div>
            <div className={`${styles.infoContainer} ${styles.container}`}>
                <div className={styles.containerIcon}>
                    <img src="../icons/userInfo.png" alt="User information icon" />
                </div>
                <div className={styles.containerFields}>
                    <div className={styles.field}>
                        <label htmlFor="username">Name</label>
                        <input type="text" id="username" onChange={() => setInfoChanged(true)} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" onChange={() => setInfoChanged(true)} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="phone">Phone</label>
                        <input type="number" id="phone" onChange={() => setInfoChanged(true)} />
                    </div>
                </div>
                {infoChanged && <button className={styles.saveButton} onClick={handleSave}>Save</button>}
            </div>
            <div className={`${styles.adressContainer} ${styles.container}`}>
                <div className={styles.containerIcon}>
                    <img src="../icons/location.png" alt="Location icon" />
                </div>
                <div className={styles.containerFields}>
                    <div className={styles.field}>
                        <label htmlFor="adress">Adress</label>
                        <textarea className={styles.adressInput} id="adress" style={{ resize: 'none' }} onChange={() => setAddressChanged(true)}></textarea>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="country">Country</label>
                        <input type="text" id="country" onChange={() => setAddressChanged(true)} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="city">City</label>
                        <input type="text" id="city" onChange={() => setAddressChanged(true)} />
                    </div>
                </div>
                {addressChanged && <button className={styles.saveButton} onClick={handleSave}>Save</button>}
            </div>
            <div className={`${styles.securityContainer} ${styles.container}`}>
                <div className={styles.containerIcon}>

                    <img src="../icons/security.png" alt="Security icon" />
                </div>
                <div className={styles.containerFields}>
                    <div className={styles.field}>
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" onChange={() => setSecurityChanged(true)} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" onChange={() => setSecurityChanged(true)} />
                    </div>
                </div>
                {securityChanged && <button className={styles.saveButton} onClick={handleSave}>Save</button>}
            </div>
            <div className={`${styles.deleteAccountContainer} ${styles.container}`}>
                <div className={styles.containerFields}>
                    <span className={styles.deleteAccountTitle}>Delete Account</span>
                    <div className={styles.line}></div>

                    {!showDeleteWarning ? (
                        <button className={styles.deleteButton} onClick={() => setShowDeleteWarning(true)}>Delete Account</button>
                    ) : (
                        <div className={styles.deleteWarning} ref={deleteWarningRef}>
                            <p>Warning: This action cannot be undone. Please type <strong>delete</strong> to confirm.</p>
                            <input
                                type="text"
                                placeholder="Type 'delete' here"
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            />
                            <button
                                className={styles.confirmDeleteButton}
                                disabled={deleteConfirmationText !== 'delete'}
                                onClick={() => {
                                    setToastMessage("Account deleted");
                                    setTimeout(() => setToastMessage(""), 3000);
                                    setShowDeleteWarning(false);
                                    setDeleteConfirmationText("");
                                }}
                            >
                                Confirm Delete
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={() => {
                                    setShowDeleteWarning(false);
                                    setDeleteConfirmationText("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
