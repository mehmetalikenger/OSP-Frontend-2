"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

type Refrigerant = {
    id: number;
    name: string;
    code: string;
}

export default function EditRefrigerantPage() {
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Refrigerant");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const [refrigerantsList, setRefrigerantsList] = useState<Refrigerant[]>([]);
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchRefrigerants = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/refrigerants`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setRefrigerantsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch refrigerants", e);
        }
    };

    useEffect(() => {
        fetchRefrigerants();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Refrigerant") {
            const ref = refrigerantsList.find(r => r.code === selectedItemToEdit);
            if (ref) {
                setName(ref.name);
                setCode(ref.code);
            }
        } else {
            setName("");
            setCode("");
        }
    }, [selectedItemToEdit, refrigerantsList]);

    const handleEditRefrigerant = async () => {
        if (selectedItemToEdit === "Select Refrigerant") {
            showToast("Please select a refrigerant to edit.", "error");
            return;
        }
        if (!name || !code) {
            showToast("Please enter name and code.", "error");
            return;
        }

        const ref = refrigerantsList.find(r => r.code === selectedItemToEdit);
        if (!ref) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editRefrigerant/${ref.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, code }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Refrigerant updated successfully.", "success");
                setSelectedItemToEdit("Select Refrigerant");
                fetchRefrigerants();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit refrigerant.", "error");
                } catch {
                    showToast("Failed to edit refrigerant.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const refrigerantOptions = ["Select Refrigerant", ...refrigerantsList.map(r => r.code)];

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
                        Refrigerant
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Refrigerant</label>
                                        <Combobox 
                                            options={refrigerantOptions}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            className={`${styles.comboBox} ${selectedItemToEdit.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Name</label>
                                        <input 
                                            type="text" 
                                            className={styles.inputElement} 
                                            placeholder="Enter name" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Code</label>
                                        <input 
                                            type="text" 
                                            className={styles.inputElement} 
                                            placeholder="Enter code" 
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleEditRefrigerant}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
