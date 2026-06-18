"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

type Compressor = {
    id: number;
    brand: string;
    model: string;
    type: string;
}

type CompressorSpecs = {
    id: number;
    brand: string;
    model: string;
    type: string;
    capacity: number;
    powerInput: number;
}

export default function EditCompressorPage() {
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Compressor");
    const [brand, setBrand] = useState("Select Brand");
    const [type, setType] = useState("Select Type");
    const [model, setModel] = useState("");

    // Specs states
    const [compressor, setCompressor] = useState("Select Compressor");
    const [capacity, setCapacity] = useState("");
    const [powerInput, setPowerInput] = useState("");

    const [compressorsList, setCompressorsList] = useState<Compressor[]>([]);
    const [compressorSpecsList, setCompressorSpecsList] = useState<CompressorSpecs[]>([]);
    
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchCompressors = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/compressors`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCompressorsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch compressors", e);
        }
    };

    const fetchCompressorSpecs = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/allCompressorSpecs`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCompressorSpecsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch compressor specs", e);
        }
    };

    useEffect(() => {
        fetchCompressors();
        fetchCompressorSpecs();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Compressor") {
            const comp = compressorsList.find(c => `${c.brand} / ${c.model} / ${c.type}` === selectedItemToEdit);
            if (comp) {
                setBrand(comp.brand);
                setType(comp.type);
                setModel(comp.model);
            }
        } else {
            setBrand("Select Brand");
            setType("Select Type");
            setModel("");
        }
    }, [selectedItemToEdit, compressorsList]);

    useEffect(() => {
        if (compressor !== "Select Compressor") {
            const spec = compressorSpecsList.find(s => `${s.brand} / ${s.model} / ${s.type} / C: ${s.capacity} / PI: ${s.powerInput}` === compressor);
            if (spec) {
                setCapacity(spec.capacity.toString());
                setPowerInput(spec.powerInput.toString());
            }
        } else {
            setCapacity("");
            setPowerInput("");
        }
    }, [compressor, compressorSpecsList]);

    const handleEditCompressor = async () => {
        if (selectedItemToEdit === "Select Compressor") {
            showToast("Please select a compressor to edit.", "error");
            return;
        }
        if (brand === "Select Brand" || type === "Select Type" || !model) {
            showToast("Please fill all fields.", "error");
            return;
        }

        const comp = compressorsList.find(c => `${c.brand} / ${c.model} / ${c.type}` === selectedItemToEdit);
        if (!comp) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editCompressor/${comp.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand, type, model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Compressor updated successfully.", "success");
                setSelectedItemToEdit("Select Compressor");
                fetchCompressors();
                fetchCompressorSpecs(); // In case brand/model/type changed, refresh specs text
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit compressor.", "error");
                } catch {
                    showToast("Failed to edit compressor.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const handleEditCompressorSpecs = async () => {
        if (compressor === "Select Compressor") {
            showToast("Please select a compressor specs record.", "error");
            return;
        }
        if (!capacity || !powerInput) {
            showToast("Please fill all fields.", "error");
            return;
        }

        const selectedSpec = compressorSpecsList.find(s => `${s.brand} / ${s.model} / ${s.type} / C: ${s.capacity} / PI: ${s.powerInput}` === compressor);
        if (!selectedSpec) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editCompressorSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ compressorId: 0, capacity: parseFloat(capacity), powerInput: parseFloat(powerInput) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Compressor Specs updated successfully.", "success");
                setCompressor("Select Compressor");
                fetchCompressorSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || "Failed to edit compressor specs.", "error");
                } catch {
                    showToast("Failed to edit compressor specs.", "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const compressorOptions = ["Select Compressor", ...compressorsList.map(c => `${c.brand} / ${c.model} / ${c.type}`)];
    const specsOptions = ["Select Compressor", ...compressorSpecsList.map(s => `${s.brand} / ${s.model} / ${s.type} / C: ${s.capacity} / PI: ${s.powerInput}`)];

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
                        Compressor
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>

                                    <div className={styles.formField}>
                                        <label>Compressor</label>
                                        <Combobox 
                                            options={compressorOptions}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            className={`${styles.comboBox} ${selectedItemToEdit.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Brand</label>
                                        <Combobox 
                                            options={["Select Brand", "Frescold", "Copelant"]}
                                            value={brand}
                                            onChange={setBrand}
                                            className={`${styles.comboBox} ${brand.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Type</label>
                                        <Combobox 
                                            options={["Select Type", "RC", "SC", "SCR", "ISCR"]}
                                            value={type}
                                            onChange={setType}
                                            className={`${styles.comboBox} ${type.startsWith('Select') ? styles.placeholderText : ''}`}
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
                                <button className={styles.saveBtn} onClick={handleEditCompressor}>Save</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Compressor Specs</label>
                                        <Combobox 
                                            options={specsOptions}
                                            value={compressor}
                                            onChange={setCompressor}
                                            className={`${styles.comboBox} ${compressor.startsWith('Select') ? styles.placeholderText : ''}`}
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
                                    <div className={styles.formField}>
                                        <label>Power Input</label>
                                        <input 
                                            type="number" 
                                            className={styles.inputElement} 
                                            placeholder="Enter power input"
                                            value={powerInput}
                                            onChange={(e) => setPowerInput(e.target.value)}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleEditCompressorSpecs}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
