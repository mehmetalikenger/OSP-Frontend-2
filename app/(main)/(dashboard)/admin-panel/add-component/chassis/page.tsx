"use client";

import { useState } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import { fetchWithAuth } from "../../../../../../lib/api";

export default function AddChassisPage() {
    const [model, setModel] = useState("");
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const handleAddChassis = async () => {
        if (!model) {
            showToast("Please enter a model.", "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addChassis`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Chassis added successfully.", "success");
                setModel("");
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to add chassis.", "error");
                } catch {
                    showToast("Failed to add chassis.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    return (
        <div className={styles.sectionsContainer} style={{ minHeight: 'fit-content', flex: 'none' }}>
            {toastInfo && (
                <div className={toastInfo.type === 'error' ? toastStyles.errorToast : toastStyles.toast}>
                    {toastInfo.message}
                </div>
            )}
            <div className={styles.sectionContent} style={{ maxWidth: '1200px', flex: 'none' }}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                        Chassis
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Model</label>
                                        <input 
                                            type="text" 
                                            className={styles.inputElement} 
                                            placeholder="Enter model" 
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddChassis}>Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
