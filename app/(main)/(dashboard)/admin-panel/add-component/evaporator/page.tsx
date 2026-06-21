"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

type Evaporator = {
    id: number;
    model: string;
}

// Evaporator type options -> backend EvaporatorType enum names.
const EVAPORATOR_TYPES: Record<string, string> = {
    "Plate": "PLATE",
    "Coil": "COIL",
    "Shell & Tube": "SHELL_AND_TUBE",
};

export default function AddEvaporatorPage() {
    const [model, setModel] = useState("");
    const [type, setType] = useState("Plate");

    // Specs states
    const [evaporator, setEvaporator] = useState("Select Evaporator");
    const [capacity, setCapacity] = useState("");

    const [evaporatorsList, setEvaporatorsList] = useState<Evaporator[]>([]);
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchEvaporators = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/evaporators`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setEvaporatorsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch evaporators", e);
        }
    };

    useEffect(() => {
        fetchEvaporators();
    }, []);

    const handleAddEvaporator = async () => {
        if (!model) {
            showToast("Please enter a model.", "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addEvaporator`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model, type: EVAPORATOR_TYPES[type] }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Evaporator added successfully.", "success");
                setModel("");
                fetchEvaporators(); // Refresh the list
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to add evaporator.", "error");
                } catch {
                    showToast("Failed to add evaporator.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const handleAddEvaporatorSpecs = async () => {
        if (evaporator === "Select Evaporator") {
            showToast("Please select an evaporator.", "error");
            return;
        }
        if (!capacity) {
            showToast("Please enter capacity.", "error");
            return;
        }

        const selectedEvap = evaporatorsList.find(e => e.model === evaporator);
        if (!selectedEvap) {
            showToast("Invalid evaporator selected.", "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addEvaporatorSpecs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ evaporatorId: selectedEvap.id, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Evaporator Specs added successfully.", "success");
                setEvaporator("Select Evaporator");
                setCapacity("");
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to add evaporator specs.", "error");
                } catch {
                    showToast("Failed to add evaporator specs.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const evaporatorOptions = ["Select Evaporator", ...evaporatorsList.map(e => e.model)];

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
                        Evaporator
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
                                    <div className={styles.formField}>
                                        <label>Type</label>
                                        <Combobox
                                            options={Object.keys(EVAPORATOR_TYPES)}
                                            value={type}
                                            onChange={setType}
                                            className={styles.comboBox}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddEvaporator}>Add</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Evaporator</label>
                                        <Combobox 
                                            options={evaporatorOptions}
                                            value={evaporator}
                                            onChange={setEvaporator}
                                            className={`${styles.comboBox} ${evaporator.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Capacity</label>
                                        <input 
                                            type="number" onWheel={(e) => e.currentTarget.blur()} 
                                            className={styles.inputElement} 
                                            placeholder="Enter capacity"
                                            value={capacity}
                                            onChange={(e) => setCapacity(e.target.value)}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddEvaporatorSpecs}>Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
