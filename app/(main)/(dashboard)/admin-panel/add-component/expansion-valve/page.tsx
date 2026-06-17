"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

type ExpansionValve = {
    id: number;
    model: string;
}

export default function AddExpansionValvePage() {
    const [model, setModel] = useState("");

    // Specs states
    const [expansionValve, setExpansionValve] = useState("Select Expansion Valve");
    const [capacity, setCapacity] = useState("");

    const [expansionValvesList, setExpansionValvesList] = useState<ExpansionValve[]>([]);
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchExpansionValves = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/expansionValves`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setExpansionValvesList(data);
            }
        } catch (e) {
            console.error("Failed to fetch expansion valves", e);
        }
    };

    useEffect(() => {
        fetchExpansionValves();
    }, []);

    const handleAddExpansionValve = async () => {
        if (!model) {
            showToast("Please enter a model.", "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addExpansionValve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Expansion Valve added successfully.", "success");
                setModel("");
                fetchExpansionValves(); // Refresh the list
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to add expansion valve.", "error");
                } catch(e) {
                    showToast("Failed to add expansion valve.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const handleAddExpansionValveSpecs = async () => {
        if (expansionValve === "Select Expansion Valve") {
            showToast("Please select an expansion valve.", "error");
            return;
        }
        if (!capacity) {
            showToast("Please enter capacity.", "error");
            return;
        }

        const selectedValve = expansionValvesList.find(v => v.model === expansionValve);
        if (!selectedValve) {
            showToast("Invalid expansion valve selected.", "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addExpansionValveSpecs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expansionValveId: selectedValve.id, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Expansion Valve Specs added successfully.", "success");
                setExpansionValve("Select Expansion Valve");
                setCapacity("");
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to add expansion valve specs.", "error");
                } catch(e) {
                    showToast("Failed to add expansion valve specs.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const expansionValveOptions = ["Select Expansion Valve", ...expansionValvesList.map(v => v.model)];

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
                        Expansion Valve
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
                                <button className={styles.saveBtn} onClick={handleAddExpansionValve}>Add</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Expansion Valve</label>
                                        <Combobox 
                                            options={expansionValveOptions}
                                            value={expansionValve}
                                            onChange={setExpansionValve}
                                            className={`${styles.comboBox} ${expansionValve.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Capacity</label>
                                        <input 
                                            type="number" 
                                            className={styles.inputElement} 
                                            placeholder="Enter capacity"
                                            value={capacity}
                                            onChange={(e) => setCapacity(e.target.value)}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddExpansionValveSpecs}>Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
