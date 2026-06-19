"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";

type Evaporator = {
    id: number;
    model: string;
}

type EvaporatorSpecs = {
    id: number;
    model: string;
    capacity: number;
}

export default function EditEvaporatorPage() {
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Evaporator");
    const [model, setModel] = useState("");

    // Specs states
    const [evaporator, setEvaporator] = useState("Select Evaporator");
    const [capacity, setCapacity] = useState("");

    const [evaporatorsList, setEvaporatorsList] = useState<Evaporator[]>([]);
    const [evaporatorSpecsList, setEvaporatorSpecsList] = useState<EvaporatorSpecs[]>([]);
    
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const { confirm, confirmElement } = useConfirm();

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

    const fetchEvaporatorSpecs = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/allEvaporatorSpecs`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setEvaporatorSpecsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch evaporator specs", e);
        }
    };

    useEffect(() => {
        fetchEvaporators();
        fetchEvaporatorSpecs();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Evaporator") {
            const evap = evaporatorsList.find(e => e.model === selectedItemToEdit);
            if (evap) {
                setModel(evap.model);
            }
        } else {
            setModel("");
        }
    }, [selectedItemToEdit, evaporatorsList]);

    useEffect(() => {
        if (evaporator !== "Select Evaporator") {
            const spec = evaporatorSpecsList.find(s => `${s.model} / C: ${s.capacity}` === evaporator);
            if (spec) {
                setCapacity(spec.capacity.toString());
            }
        } else {
            setCapacity("");
        }
    }, [evaporator, evaporatorSpecsList]);

    const handleEditEvaporator = async () => {
        if (selectedItemToEdit === "Select Evaporator") {
            showToast("Please select an evaporator to edit.", "error");
            return;
        }
        if (!model) {
            showToast("Please enter a model.", "error");
            return;
        }

        const evap = evaporatorsList.find(e => e.model === selectedItemToEdit);
        if (!evap) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editEvaporator/${evap.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Evaporator updated successfully.", "success");
                setSelectedItemToEdit("Select Evaporator");
                fetchEvaporators();
                fetchEvaporatorSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit evaporator.", "error");
                } catch {
                    showToast("Failed to edit evaporator.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const handleEditEvaporatorSpecs = async () => {
        if (evaporator === "Select Evaporator") {
            showToast("Please select evaporator specs.", "error");
            return;
        }
        if (!capacity) {
            showToast("Please fill all fields.", "error");
            return;
        }

        const selectedSpec = evaporatorSpecsList.find(s => `${s.model} / C: ${s.capacity}` === evaporator);
        if (!selectedSpec) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editEvaporatorSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ evaporatorId: 0, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Evaporator Specs updated successfully.", "success");
                setEvaporator("Select Evaporator");
                fetchEvaporatorSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit evaporator specs.", "error");
                } catch {
                    showToast("Failed to edit evaporator specs.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const evaporatorOptions = ["Select Evaporator", ...evaporatorsList.map(e => e.model)];
    const specsOptions = ["Select Evaporator", ...evaporatorSpecsList.map(s => `${s.model} / C: ${s.capacity}`)];

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select Evaporator") { showToast("Please select an evaporator to delete.", "error"); return; }
        const item = evaporatorsList.find(e => e.model === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: "Delete evaporator", message: `This will hide "${selectedItemToEdit}" from all lists. Existing units that use it keep working.`, confirmText: "Delete" });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/evaporator/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast("Evaporator deleted.", "success");
                setSelectedItemToEdit("Select Evaporator");
                fetchEvaporators();
                fetchEvaporatorSpecs();
            } else {
                showToast("Failed to delete evaporator.", "error");
            }
        } catch (error) { console.error(error); showToast("Network error.", "error"); }
    };

    return (
        <div className={styles.sectionsContainer} style={{ minHeight: 'fit-content', flex: 'none' }}>
            {confirmElement}
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
                                        <label>Evaporator</label>
                                        <Combobox 
                                            options={evaporatorOptions}
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
                                <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e', marginRight: '12px' }} onClick={handleDelete}>Delete</button>
                                <button className={styles.saveBtn} onClick={handleEditEvaporator}>Save</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Evaporator Specs</label>
                                        <Combobox 
                                            options={specsOptions}
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
                                <button className={styles.saveBtn} onClick={handleEditEvaporatorSpecs}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
