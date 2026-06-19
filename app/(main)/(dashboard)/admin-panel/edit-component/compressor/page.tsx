"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";

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
    qC1: number; qC2: number; qC3: number; qC4: number; qC5: number;
    qC6: number; qC7: number; qC8: number; qC9: number; qC10: number;
    pC1: number; pC2: number; pC3: number; pC4: number; pC5: number;
    pC6: number; pC7: number; pC8: number; pC9: number; pC10: number;
}

export default function EditCompressorPage() {
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Compressor");
    const [brand, setBrand] = useState("Select Brand");
    const [type, setType] = useState("Select Type");
    const [model, setModel] = useState("");

    const [compressor, setCompressor] = useState("Select Compressor");
    const [capacity, setCapacity] = useState("");
    const [powerInput, setPowerInput] = useState("");
    const [qCoeffs, setQCoeffs] = useState<string[]>(Array(10).fill(""));
    const [pCoeffs, setPCoeffs] = useState<string[]>(Array(10).fill(""));

    const [compressorsList, setCompressorsList] = useState<Compressor[]>([]);
    const [compressorSpecsList, setCompressorSpecsList] = useState<CompressorSpecs[]>([]);

    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const { confirm, confirmElement } = useConfirm();

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
                setQCoeffs([
                    spec.qC1.toString(), spec.qC2.toString(), spec.qC3.toString(),
                    spec.qC4.toString(), spec.qC5.toString(), spec.qC6.toString(),
                    spec.qC7.toString(), spec.qC8.toString(), spec.qC9.toString(),
                    spec.qC10.toString()
                ]);
                setPCoeffs([
                    spec.pC1.toString(), spec.pC2.toString(), spec.pC3.toString(),
                    spec.pC4.toString(), spec.pC5.toString(), spec.pC6.toString(),
                    spec.pC7.toString(), spec.pC8.toString(), spec.pC9.toString(),
                    spec.pC10.toString()
                ]);
            }
        } else {
            setCapacity("");
            setPowerInput("");
            setQCoeffs(Array(10).fill(""));
            setPCoeffs(Array(10).fill(""));
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
                fetchCompressorSpecs();
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
        if (qCoeffs.some(v => v === "") || pCoeffs.some(v => v === "")) {
            showToast("Please fill all coefficient fields.", "error");
            return;
        }

        const selectedSpec = compressorSpecsList.find(s => `${s.brand} / ${s.model} / ${s.type} / C: ${s.capacity} / PI: ${s.powerInput}` === compressor);
        if (!selectedSpec) return;

        const qObj = Object.fromEntries(qCoeffs.map((v, i) => [`qC${i + 1}`, parseFloat(v)]));
        const pObj = Object.fromEntries(pCoeffs.map((v, i) => [`pC${i + 1}`, parseFloat(v)]));

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editCompressorSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    compressorId: 0,
                    capacity: parseFloat(capacity),
                    powerInput: parseFloat(powerInput),
                    ...qObj,
                    ...pObj
                }),
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

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select Compressor") { showToast("Please select a compressor to delete.", "error"); return; }
        const item = compressorsList.find(c => `${c.brand} / ${c.model} / ${c.type}` === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: "Delete compressor", message: `This will hide "${selectedItemToEdit}" from all lists. Existing units that use it keep working.`, confirmText: "Delete" });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/compressor/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast("Compressor deleted.", "success");
                setSelectedItemToEdit("Select Compressor");
                fetchCompressors();
                fetchCompressorSpecs();
            } else {
                showToast("Failed to delete compressor.", "error");
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
                                <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e', marginRight: '12px' }} onClick={handleDelete}>Delete</button>
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

                            <div className={styles.horizontalSeperator} style={{ margin: '28px 0' }}></div>

                            <fieldset className={styles.coeffGroup}>
                                <legend>Capacity Coefficients (Q)</legend>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                    {qCoeffs.map((val, i) => (
                                        <div className={styles.formField} key={`q${i}`}>
                                            <label>Q-C{i + 1}</label>
                                            <input
                                                type="number"
                                                className={styles.inputElement}
                                                placeholder="0"
                                                value={val}
                                                onChange={(e) => {
                                                    const next = [...qCoeffs];
                                                    next[i] = e.target.value;
                                                    setQCoeffs(next);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </fieldset>

                            <fieldset className={styles.coeffGroup}>
                                <legend>Power Input Coefficients (P)</legend>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                    {pCoeffs.map((val, i) => (
                                        <div className={styles.formField} key={`p${i}`}>
                                            <label>P-C{i + 1}</label>
                                            <input
                                                type="number"
                                                className={styles.inputElement}
                                                placeholder="0"
                                                value={val}
                                                onChange={(e) => {
                                                    const next = [...pCoeffs];
                                                    next[i] = e.target.value;
                                                    setPCoeffs(next);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </fieldset>

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
