"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";

type Condenser = {
    id: number;
    model: string;
}

type CondenserSpecs = {
    id: number;
    model: string;
    capacity: number;
}

export default function EditCondenserPage() {
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Condenser");
    const [model, setModel] = useState("");

    // Specs states
    const [condenser, setCondenser] = useState("Select Condenser");
    const [capacity, setCapacity] = useState("");

    const [condensersList, setCondensersList] = useState<Condenser[]>([]);
    const [condenserSpecsList, setCondenserSpecsList] = useState<CondenserSpecs[]>([]);
    
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const { confirm, confirmElement } = useConfirm();

    const fetchCondensers = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/condensers`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCondensersList(data);
            }
        } catch (e) {
            console.error("Failed to fetch condensers", e);
        }
    };

    const fetchCondenserSpecs = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/allCondenserSpecs`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCondenserSpecsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch condenser specs", e);
        }
    };

    useEffect(() => {
        fetchCondensers();
        fetchCondenserSpecs();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Condenser") {
            const cond = condensersList.find(c => c.model === selectedItemToEdit);
            if (cond) {
                setModel(cond.model);
            }
        } else {
            setModel("");
        }
    }, [selectedItemToEdit, condensersList]);

    useEffect(() => {
        if (condenser !== "Select Condenser") {
            const spec = condenserSpecsList.find(s => `${s.model} / C: ${s.capacity}` === condenser);
            if (spec) {
                setCapacity(spec.capacity.toString());
            }
        } else {
            setCapacity("");
        }
    }, [condenser, condenserSpecsList]);

    const handleEditCondenser = async () => {
        if (selectedItemToEdit === "Select Condenser") {
            showToast("Please select a condenser to edit.", "error");
            return;
        }
        if (!model) {
            showToast("Please enter a model.", "error");
            return;
        }

        const cond = condensersList.find(c => c.model === selectedItemToEdit);
        if (!cond) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editCondenser/${cond.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Condenser updated successfully.", "success");
                setSelectedItemToEdit("Select Condenser");
                fetchCondensers();
                fetchCondenserSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit condenser.", "error");
                } catch {
                    showToast("Failed to edit condenser.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const handleEditCondenserSpecs = async () => {
        if (condenser === "Select Condenser") {
            showToast("Please select condenser specs.", "error");
            return;
        }
        if (!capacity) {
            showToast("Please fill all fields.", "error");
            return;
        }

        const selectedSpec = condenserSpecsList.find(s => `${s.model} / C: ${s.capacity}` === condenser);
        if (!selectedSpec) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editCondenserSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ condenserId: 0, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Condenser Specs updated successfully.", "success");
                setCondenser("Select Condenser");
                fetchCondenserSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit condenser specs.", "error");
                } catch {
                    showToast("Failed to edit condenser specs.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const condenserOptions = ["Select Condenser", ...condensersList.map(c => c.model)];
    const specsOptions = ["Select Condenser", ...condenserSpecsList.map(s => `${s.model} / C: ${s.capacity}`)];

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select Condenser") { showToast("Please select a condenser to delete.", "error"); return; }
        const item = condensersList.find(c => c.model === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: "Delete condenser", message: `This will hide "${selectedItemToEdit}" from all lists. Existing units that use it keep working.`, confirmText: "Delete" });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/condenser/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast("Condenser deleted.", "success");
                setSelectedItemToEdit("Select Condenser");
                fetchCondensers();
                fetchCondenserSpecs();
            } else {
                showToast("Failed to delete condenser.", "error");
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
                        Condenser
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Condenser</label>
                                        <Combobox 
                                            options={condenserOptions}
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
                                <button className={styles.saveBtn} onClick={handleEditCondenser}>Save</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Condenser Specs</label>
                                        <Combobox 
                                            options={specsOptions}
                                            value={condenser}
                                            onChange={setCondenser}
                                            className={`${styles.comboBox} ${condenser.startsWith('Select') ? styles.placeholderText : ''}`}
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
                                <button className={styles.saveBtn} onClick={handleEditCondenserSpecs}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
