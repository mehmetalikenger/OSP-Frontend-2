"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

type FourWayReversingValve = {
    id: number;
    model: string;
}

type FourWayReversingValveSpecs = {
    id: number;
    model: string;
    capacity: number;
}

export default function EditFourWayReversingValvePage() {
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select 4-Way Reversing Valve");
    const [model, setModel] = useState("");

    // Specs states
    const [fourWayReversingValve, setFourWayReversingValve] = useState("Select 4-Way Reversing Valve");
    const [capacity, setCapacity] = useState("");

    const [valvesList, setValvesList] = useState<FourWayReversingValve[]>([]);
    const [valveSpecsList, setValveSpecsList] = useState<FourWayReversingValveSpecs[]>([]);
    
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchValves = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/fourWayReversingValves`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setValvesList(data);
            }
        } catch (e) {
            console.error("Failed to fetch 4-way reversing valves", e);
        }
    };

    const fetchValveSpecs = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/allFourWayReversingValveSpecs`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setValveSpecsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch 4-way reversing valve specs", e);
        }
    };

    useEffect(() => {
        fetchValves();
        fetchValveSpecs();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select 4-Way Reversing Valve") {
            const valve = valvesList.find(v => v.model === selectedItemToEdit);
            if (valve) {
                setModel(valve.model);
            }
        } else {
            setModel("");
        }
    }, [selectedItemToEdit, valvesList]);

    useEffect(() => {
        if (fourWayReversingValve !== "Select 4-Way Reversing Valve") {
            const spec = valveSpecsList.find(s => `${s.model} / C: ${s.capacity}` === fourWayReversingValve);
            if (spec) {
                setCapacity(spec.capacity.toString());
            }
        } else {
            setCapacity("");
        }
    }, [fourWayReversingValve, valveSpecsList]);

    const handleEditValve = async () => {
        if (selectedItemToEdit === "Select 4-Way Reversing Valve") {
            showToast("Please select a valve to edit.", "error");
            return;
        }
        if (!model) {
            showToast("Please enter a model.", "error");
            return;
        }

        const valve = valvesList.find(v => v.model === selectedItemToEdit);
        if (!valve) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editFourWayReversingValve/${valve.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("4-Way Reversing Valve updated successfully.", "success");
                setSelectedItemToEdit("Select 4-Way Reversing Valve");
                fetchValves();
                fetchValveSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit valve.", "error");
                } catch(e) {
                    showToast("Failed to edit valve.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const handleEditValveSpecs = async () => {
        if (fourWayReversingValve === "Select 4-Way Reversing Valve") {
            showToast("Please select valve specs.", "error");
            return;
        }
        if (!capacity) {
            showToast("Please fill all fields.", "error");
            return;
        }

        const selectedSpec = valveSpecsList.find(s => `${s.model} / C: ${s.capacity}` === fourWayReversingValve);
        if (!selectedSpec) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editFourWayReversingValveSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fourWayReversingValveId: 0, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("4-Way Reversing Valve Specs updated successfully.", "success");
                setFourWayReversingValve("Select 4-Way Reversing Valve");
                fetchValveSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit valve specs.", "error");
                } catch(e) {
                    showToast("Failed to edit valve specs.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const valveOptions = ["Select 4-Way Reversing Valve", ...valvesList.map(v => v.model)];
    const specsOptions = ["Select 4-Way Reversing Valve", ...valveSpecsList.map(s => `${s.model} / C: ${s.capacity}`)];

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
                        4-Way Reversing Valve
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>4-Way Reversing Valve</label>
                                        <Combobox 
                                            options={valveOptions}
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
                                <button className={styles.saveBtn} onClick={handleEditValve}>Save</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>4-Way Reversing Valve Specs</label>
                                        <Combobox 
                                            options={specsOptions}
                                            value={fourWayReversingValve}
                                            onChange={setFourWayReversingValve}
                                            className={`${styles.comboBox} ${fourWayReversingValve.startsWith('Select') ? styles.placeholderText : ''}`}
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
                                <button className={styles.saveBtn} onClick={handleEditValveSpecs}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
