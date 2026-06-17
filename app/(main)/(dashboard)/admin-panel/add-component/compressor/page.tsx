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

export default function AddCompressorPage() {
    const [brand, setBrand] = useState("Select Brand");
    const [type, setType] = useState("Select Type");
    const [model, setModel] = useState("");

    // Specs states
    const [compressor, setCompressor] = useState("Select Compressor");
    const [capacity, setCapacity] = useState("");
    const [powerInput, setPowerInput] = useState("");

    const [compressorsList, setCompressorsList] = useState<Compressor[]>([]);
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

    useEffect(() => {
        fetchCompressors();
    }, []);

    const handleAddCompressor = async () => {
        if (brand === "Select Brand" || type === "Select Type" || !model) {
            showToast("Please fill all fields.", "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addCompressor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand, type, model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Compressor added successfully.", "success");
                setBrand("Select Brand");
                setType("Select Type");
                setModel("");
                fetchCompressors();
            } else {
                showToast("Failed to add compressor.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const handleAddCompressorSpecs = async () => {
        if (compressor === "Select Compressor" || !capacity || !powerInput) {
            showToast("Please fill all fields.", "error");
            return;
        }

        const selectedComp = compressorsList.find(c => `${c.brand} / ${c.model} / ${c.type}` === compressor);
        if (!selectedComp) {
            showToast("Invalid compressor selected.", "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addCompressorSpecs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ compressorId: selectedComp.id, capacity: parseFloat(capacity), powerInput: parseFloat(powerInput) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast("Compressor Specs added successfully.", "success");
                setCompressor("Select Compressor");
                setCapacity("");
                setPowerInput("");
            } else {
                showToast("Failed to add compressor specs.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Network error.", "error");
        }
    };

    const compressorOptions = ["Select Compressor", ...compressorsList.map(c => `${c.brand} / ${c.model} / ${c.type}`)];

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
                                <button className={styles.saveBtn} onClick={handleAddCompressor}>Add</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Compressor</label>
                                        <Combobox 
                                            options={compressorOptions}
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
                                <button className={styles.saveBtn} onClick={handleAddCompressorSpecs}>Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
