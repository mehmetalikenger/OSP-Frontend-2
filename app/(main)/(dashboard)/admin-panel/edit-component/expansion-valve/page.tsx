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

type ExpansionValveSpecs = {
    id: number;
    model: string;
    capacity: number;
}

export default function EditExpansionValvePage() {
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Expansion Valve");
    const [model, setModel] = useState("");

    // Specs states
    const [expansionValve, setExpansionValve] = useState("Select Expansion Valve");
    const [capacity, setCapacity] = useState("");

    const [expansionValvesList, setExpansionValvesList] = useState<ExpansionValve[]>([]);
    const [expansionValveSpecsList, setExpansionValveSpecsList] = useState<ExpansionValveSpecs[]>([]);
    
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

    const fetchExpansionValveSpecs = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/allExpansionValveSpecs`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setExpansionValveSpecsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch expansion valve specs", e);
        }
    };

    useEffect(() => {
        fetchExpansionValves();
        fetchExpansionValveSpecs();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Expansion Valve") {
            const valve = expansionValvesList.find(v => v.model === selectedItemToEdit);
            if (valve) {
                setModel(valve.model);
            }
        } else {
            setModel("");
        }
    }, [selectedItemToEdit, expansionValvesList]);

    useEffect(() => {
        if (expansionValve !== "Select Expansion Valve") {
            const spec = expansionValveSpecsList.find(s => `${s.model} / C: ${s.capacity}` === expansionValve);
            if (spec) {
                setCapacity(spec.capacity.toString());
            }
        } else {
            setCapacity("");
        }
    }, [expansionValve, expansionValveSpecsList]);

    const handleEditExpansionValve = async () => {
        if (selectedItemToEdit === "Select Expansion Valve") {
            showToast("Please select an expansion valve to edit.", "error");
            return;
        }
        if (!model) {
            showToast("Please enter a model.", "error");
            return;
        }

        const valve = expansionValvesList.find(v => v.model === selectedItemToEdit);
        if (!valve) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editExpansionValve/${valve.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Expansion Valve updated successfully!", "success");
                setSelectedItemToEdit("Select Expansion Valve");
                fetchExpansionValves();
                fetchExpansionValveSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit expansion valve.", "error");
                } catch(e) {
                    showToast("Failed to edit expansion valve.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const handleEditExpansionValveSpecs = async () => {
        if (expansionValve === "Select Expansion Valve") {
            showToast("Please select expansion valve specs.", "error");
            return;
        }
        if (!capacity) {
            showToast("Please fill all fields.", "error");
            return;
        }

        const selectedSpec = expansionValveSpecsList.find(s => `${s.model} / C: ${s.capacity}` === expansionValve);
        if (!selectedSpec) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editExpansionValveSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expansionValveId: 0, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Expansion Valve Specs updated successfully!", "success");
                setExpansionValve("Select Expansion Valve");
                fetchExpansionValveSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit expansion valve specs.", "error");
                } catch(e) {
                    showToast("Failed to edit expansion valve specs.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const expansionValveOptions = ["Select Expansion Valve", ...expansionValvesList.map(v => v.model)];
    const specsOptions = ["Select Expansion Valve", ...expansionValveSpecsList.map(s => `${s.model} / C: ${s.capacity}`)];

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
                                        <label>Expansion Valve</label>
                                        <Combobox 
                                            options={expansionValveOptions}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            className={`${styles.comboBox} ${selectedItemToEdit.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
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
                                <button className={styles.saveBtn} onClick={handleEditExpansionValve}>Save</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Expansion Valve Specs</label>
                                        <Combobox 
                                            options={specsOptions}
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
                                <button className={styles.saveBtn} onClick={handleEditExpansionValveSpecs}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
