"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./accountSettings.module.css";
import sharedStyles from "../sharedProfile.module.css";
import { Country, State } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import AdminCombobox from "../../(dashboard)/admin-panel/AdminCombobox";
import { fetchWithAuth } from "../../../../lib/api";

export default function AccountSettingsPage() {
    const [userId, setUserId] = useState<string | null>(null);

    const [userRole, setUserRole] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [countryIsoCode, setCountryIsoCode] = useState("");
    const [countryName, setCountryName] = useState("");
    const [cityName, setCityName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [infoChanged, setInfoChanged] = useState(false);
    const [addressChanged, setAddressChanged] = useState(false);
    const [securityChanged, setSecurityChanged] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [currentPasswordError, setCurrentPasswordError] = useState(false);
    const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState("");

    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const deleteWarningRef = useRef<HTMLDivElement>(null);

    const countries = Country.getAllCountries();
    // Use States instead of Cities, because in countries like Turkey, 
    // Istanbul and Izmir are classified as states/provinces.
    const cities = countryIsoCode ? State.getStatesOfCountry(countryIsoCode) : [];

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        const id = localStorage.getItem('userId');
        if (id) {
            setUserId(id);
            fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/user/${id}`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    setUsername(data.username || "");
                    setSurname(data.surname || "");
                    setEmail(data.email || "");
                    setPhone(data.phone || "");
                    setAddress(data.address || "");
                    
                    if (data.country) {
                        const c = countries.find(c => c.isoCode === data.country);
                        if (c) {
                            setCountryName(c.name);
                            setCountryIsoCode(c.isoCode);
                        } else {
                            setCountryName(data.country);
                            setCountryIsoCode(data.country);
                        }
                    }
                    setCityName(data.city || "");
                })
                .catch(err => console.error("Error fetching user profile:", err));
        }
    }, []);

    useEffect(() => {
        if (showDeleteWarning && deleteWarningRef.current) {
            deleteWarningRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [showDeleteWarning]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message, type });
        setTimeout(() => setToastInfo(null), 3000);
    }

    const handleSaveInfo = async () => {
        try {
            const url = userRole === 'ADMIN' ? `${process.env.NEXT_PUBLIC_API_URL}/user/update-admin` : `${process.env.NEXT_PUBLIC_API_URL}/user/update-user`;
            const payload = userRole === 'ADMIN' 
                ? { id: userId, username, email, phone, surname } 
                : { id: userId, username, email, phone };
                
            const res = await fetchWithAuth(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast("User info saved", "success");
                setInfoChanged(false);
            } else {
                try {
                    const errorText = await res.text();
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.errors && errorJson.errors.length > 0) {
                        showToast(errorJson.errors[0].defaultMessage || "Failed to save info", "error");
                    } else {
                        showToast(errorJson.message || errorJson.error || "Failed to save info", "error");
                    }
                } catch {
                    showToast("Failed to save info", "error");
                }
            }
        } catch {
            showToast("Network error", "error");
        }
    };

    const handleSaveAddress = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/user/update-adress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: userId, address, country: countryIsoCode, city: cityName })
            });
            if (res.ok) {
                showToast("Address saved", "success");
                setAddressChanged(false);
            } else {
                try {
                    const errorText = await res.text();
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.errors && errorJson.errors.length > 0) {
                        showToast(errorJson.errors[0].defaultMessage || "Failed to save address", "error");
                    } else {
                        showToast(errorJson.message || errorJson.error || "Failed to save address", "error");
                    }
                } catch {
                    showToast("Failed to save address", "error");
                }
            }
        } catch {
            showToast("Network error", "error");
        }
    };

    const handleSaveSecurity = async () => {
        if (password !== confirmPassword) {
            setPasswordError(true);
            return;
        }
        setPasswordError(false);
        setCurrentPasswordError(false);
        setNewPasswordErrorMessage("");
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/user/update-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: userId, currentPassword, password })
            });
            if (res.ok) {
                showToast("Password updated", "success");
                setSecurityChanged(false);
                setCurrentPassword("");
                setPassword("");
                setConfirmPassword("");
            } else {
                const errorText = await res.text();
                let errorMessage = errorText;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.errors && errorJson.errors.length > 0) {
                        errorMessage = errorJson.errors[0].defaultMessage;
                    } else {
                        errorMessage = errorJson.message || errorJson.error || errorText;
                    }
                } catch {
                    // It's plain text
                }
                
                if (errorMessage === "Current password is incorrect") {
                    setCurrentPasswordError(true);
                } else if (errorMessage === "New password cannot be the same as the current password" || errorMessage.includes("Password should be minimum")) {
                    setNewPasswordErrorMessage(errorMessage);
                } else {
                    showToast(errorMessage || "Failed to update password", "error");
                }
            }
        } catch {
            showToast("Network error", "error");
        }
    };

    return (
        <div className={sharedStyles.pageContentContainer}>
            {toastInfo && (
                <div className={toastInfo.type === 'error' ? styles.errorToast : styles.toast}>
                    {toastInfo.message}
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
                        <input type="text" id="username" value={username} onChange={(e) => { setUsername(e.target.value); setInfoChanged(true); }} />
                    </div>
                    {userRole === 'ADMIN' && (
                        <div className={styles.field}>
                            <label htmlFor="surname">Surname</label>
                            <input type="text" id="surname" value={surname} onChange={(e) => { setSurname(e.target.value); setInfoChanged(true); }} />
                        </div>
                    )}
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => { setEmail(e.target.value); setInfoChanged(true); }} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="phone">Phone</label>
                        <PhoneInput
                            country={'us'}
                            value={phone}
                            onChange={(phone) => { setPhone(phone); setInfoChanged(true); }}
                            inputStyle={{ width: '100%', height: '40px', paddingLeft: '48px', borderRadius: '5px' }}
                        />
                    </div>
                </div>
                {infoChanged && <button className={styles.saveButton} onClick={handleSaveInfo}>Save</button>}
            </div>
            <div className={`${styles.adressContainer} ${styles.container}`}>
                <div className={styles.containerIcon}>
                    <img src="../icons/location.png" alt="Location icon" />
                </div>
                <div className={styles.containerFields}>
                    <div className={styles.field}>
                        <label htmlFor="adress">Adress</label>
                        <textarea className={styles.adressInput} id="adress" value={address} style={{ resize: 'none' }} onChange={(e) => { setAddress(e.target.value); setAddressChanged(true); }}></textarea>
                    </div>
                    <div className={styles.field}>
                        <label>Country</label>
                        <AdminCombobox 
                            value={countryName || "Select Country"} 
                            onChange={(val) => {
                                const c = countries.find(c => c.name === val);
                                if (c) {
                                    setCountryIsoCode(c.isoCode);
                                    setCountryName(c.name);
                                    setCityName(""); // reset city
                                    setAddressChanged(true);
                                }
                            }}
                            options={countries.slice().sort((a,b) => a.name.localeCompare(b.name)).map(c => c.name)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>City</label>
                        <AdminCombobox 
                            value={cityName || "Select City"} 
                            onChange={(val) => {
                                setCityName(val);
                                setAddressChanged(true);
                            }}
                            options={cities ? cities.slice().sort((a,b) => a.name.localeCompare(b.name)).map(c => c.name) : []}
                            disabled={!countryIsoCode}
                        />
                    </div>
                </div>
                {addressChanged && <button className={styles.saveButton} onClick={handleSaveAddress}>Save</button>}
            </div>
            <div className={`${styles.securityContainer} ${styles.container}`}>
                <div className={styles.containerIcon}>
                    <img src="../icons/security.png" alt="Security icon" />
                </div>
                <div className={styles.containerFields}>
                    <div className={styles.field}>
                        <label htmlFor="currentPassword">Current Password</label>
                        <div className={styles.passwordArea}>
                            <input 
                                type={showCurrentPassword ? "text" : "password"} 
                                id="currentPassword" 
                                value={currentPassword} 
                                style={currentPasswordError ? { border: '1px solid red' } : {}}
                                onChange={(e) => { setCurrentPassword(e.target.value); setSecurityChanged(true); setCurrentPasswordError(false); }} 
                            />
                            <div className={styles.passwordEye} onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ cursor: 'pointer' }}>
                                <img className={styles.lightIcon} src="/icons/pass-eye.png" alt="Eye" style={{ opacity: showCurrentPassword ? 0.4 : 1, transition: 'opacity 0.2s' }} />
                                <img className={styles.darkIcon} src="/icons/pass-eye-darkMode.png" alt="Eye" style={{ opacity: showCurrentPassword ? 0.4 : 1, transition: 'opacity 0.2s' }} />
                            </div>
                        </div>
                        {currentPasswordError && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>Current password is incorrect.</span>}
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="password">New Password</label>
                        <div className={styles.passwordArea}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                value={password} 
                                style={newPasswordErrorMessage ? { border: '1px solid red' } : {}}
                                onChange={(e) => { setPassword(e.target.value); setSecurityChanged(true); setPasswordError(false); setNewPasswordErrorMessage(""); }} 
                            />
                            <div className={styles.passwordEye} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                                <img className={styles.lightIcon} src="/icons/pass-eye.png" alt="Eye" style={{ opacity: showPassword ? 0.4 : 1, transition: 'opacity 0.2s' }} />
                                <img className={styles.darkIcon} src="/icons/pass-eye-darkMode.png" alt="Eye" style={{ opacity: showPassword ? 0.4 : 1, transition: 'opacity 0.2s' }} />
                            </div>
                        </div>
                        {newPasswordErrorMessage && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>{newPasswordErrorMessage}</span>}
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className={styles.passwordArea}>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                id="confirmPassword" 
                                value={confirmPassword} 
                                style={passwordError ? { border: '1px solid red' } : {}}
                                onChange={(e) => { setConfirmPassword(e.target.value); setSecurityChanged(true); setPasswordError(false); }} 
                            />
                            <div className={styles.passwordEye} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }}>
                                <img className={styles.lightIcon} src="/icons/pass-eye.png" alt="Eye" style={{ opacity: showConfirmPassword ? 0.4 : 1, transition: 'opacity 0.2s' }} />
                                <img className={styles.darkIcon} src="/icons/pass-eye-darkMode.png" alt="Eye" style={{ opacity: showConfirmPassword ? 0.4 : 1, transition: 'opacity 0.2s' }} />
                            </div>
                        </div>
                        {passwordError && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>Passwords do not match.</span>}
                    </div>
                </div>
                {securityChanged && <button className={styles.saveButton} onClick={handleSaveSecurity}>Save</button>}
            </div>
            {userRole !== 'ADMIN' && (
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
                                onClick={async () => {
                                    try {
                                        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/account/delete-account-request`, {
                                            method: "POST",
                                            credentials: 'include'
                                        });
                                        if (res.ok) {
                                            showToast("A confirmation email has been sent. Please check your inbox to finalize account deletion.", "success");
                                        } else {
                                            showToast("Failed to request account deletion", "error");
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        showToast("Network error", "error");
                                    }
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
            )}
        </div>
    );
}
