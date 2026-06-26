"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";
import { useTranslations } from "next-intl";

type Refrigerant = {
    id: number;
    name: string;
    code: string;
}

// Imported refrigerants have name === code, so show a single value; only show "name / code"
// when they actually differ.
const refrigerantLabel = (r: Refrigerant) => (r.name === r.code ? r.code : `${r.name} / ${r.code}`);

type Compressor = {
    id: number;
    brand: string;
    model: string;
    type: string;
    moc: number;
    lra: number;
    refrigerant?: Refrigerant | null;
    imported?: boolean;
}

type CompressorSpecs = {
    id: number;
    brand: string;
    model: string;
    type: string;
    capacity: number;
    powerInput: number;
    refrigerantId?: number | null;
    rpmBase?: number | null; rpmMin?: number | null; rpmMax?: number | null;
    qC1: number; qC2: number; qC3: number; qC4: number; qC5: number;
    qC6: number; qC7: number; qC8: number; qC9: number; qC10: number;
    qC11?: number | null; qC12?: number | null; qC13?: number | null; qC14?: number | null; qC15?: number | null;
    qC16?: number | null; qC17?: number | null; qC18?: number | null; qC19?: number | null; qC20?: number | null;
    pC1: number; pC2: number; pC3: number; pC4: number; pC5: number;
    pC6: number; pC7: number; pC8: number; pC9: number; pC10: number;
    pC11?: number | null; pC12?: number | null; pC13?: number | null; pC14?: number | null; pC15?: number | null;
    pC16?: number | null; pC17?: number | null; pC18?: number | null; pC19?: number | null; pC20?: number | null;
}

export default function EditCompressorPage() {
    const t = useTranslations("AdminComp");
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Compressor");
    const [brand, setBrand] = useState("Select Brand");
    const [type, setType] = useState("Select Type");
    const [model, setModel] = useState("");
    const [moc, setMoc] = useState("");
    const [lra, setLra] = useState("");
    const [refrigerant, setRefrigerant] = useState("Select Refrigerant");

    const [compressor, setCompressor] = useState("Select Compressor");
    const [capacity, setCapacity] = useState("");
    const [powerInput, setPowerInput] = useState("");
    // Coefficients hold up to 20 each: 1–10 for all compressors, 11–20 only for ISCR.
    const [qCoeffs, setQCoeffs] = useState<string[]>(Array(20).fill(""));
    const [pCoeffs, setPCoeffs] = useState<string[]>(Array(20).fill(""));
    const [rpmBase, setRpmBase] = useState("");
    const [rpmMin, setRpmMin] = useState("");
    const [rpmMax, setRpmMax] = useState("");

    const [compressorsList, setCompressorsList] = useState<Compressor[]>([]);
    const [compressorSpecsList, setCompressorSpecsList] = useState<CompressorSpecs[]>([]);
    const [refrigerantsList, setRefrigerantsList] = useState<Refrigerant[]>([]);

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
        fetchCompressors();
        fetchCompressorSpecs();
        fetchRefrigerants();
    }, []);

    // The selected spec's type drives the ISCR-only fields (RPM + Q11–Q20).
    const selectedSpecObj = compressorSpecsList.find(s => `${s.brand} / ${s.model} / ${s.type} / C: ${s.capacity} / PI: ${s.powerInput}` === compressor);
    const isIscr = selectedSpecObj?.type === "ISCR";
    const qCount = isIscr ? 20 : 10;
    const pCount = isIscr ? 20 : 10;

    useEffect(() => {
        if (selectedItemToEdit !== "Select Compressor") {
            const comp = compressorsList.find(c => `${c.brand} / ${c.model} / ${c.type}` === selectedItemToEdit);
            if (comp) {
                setBrand(comp.brand);
                setType(comp.type);
                setModel(comp.model);
                setMoc(String(comp.moc ?? ""));
                setLra(String(comp.lra ?? ""));
                setRefrigerant(comp.refrigerant ? refrigerantLabel(comp.refrigerant) : "Select Refrigerant");
            }
        } else {
            setBrand("Select Brand");
            setType("Select Type");
            setModel("");
            setMoc("");
            setLra("");
            setRefrigerant("Select Refrigerant");
        }
    }, [selectedItemToEdit, compressorsList]);

    useEffect(() => {
        if (compressor !== "Select Compressor") {
            const spec = compressorSpecsList.find(s => `${s.brand} / ${s.model} / ${s.type} / C: ${s.capacity} / PI: ${s.powerInput}` === compressor);
            if (spec) {
                const optStr = (v?: number | null) => (v === null || v === undefined ? "" : v.toString());
                setCapacity(spec.capacity.toString());
                setPowerInput(spec.powerInput.toString());
                setQCoeffs([
                    spec.qC1.toString(), spec.qC2.toString(), spec.qC3.toString(),
                    spec.qC4.toString(), spec.qC5.toString(), spec.qC6.toString(),
                    spec.qC7.toString(), spec.qC8.toString(), spec.qC9.toString(),
                    spec.qC10.toString(),
                    optStr(spec.qC11), optStr(spec.qC12), optStr(spec.qC13), optStr(spec.qC14), optStr(spec.qC15),
                    optStr(spec.qC16), optStr(spec.qC17), optStr(spec.qC18), optStr(spec.qC19), optStr(spec.qC20)
                ]);
                setPCoeffs([
                    spec.pC1.toString(), spec.pC2.toString(), spec.pC3.toString(),
                    spec.pC4.toString(), spec.pC5.toString(), spec.pC6.toString(),
                    spec.pC7.toString(), spec.pC8.toString(), spec.pC9.toString(),
                    spec.pC10.toString(),
                    optStr(spec.pC11), optStr(spec.pC12), optStr(spec.pC13), optStr(spec.pC14), optStr(spec.pC15),
                    optStr(spec.pC16), optStr(spec.pC17), optStr(spec.pC18), optStr(spec.pC19), optStr(spec.pC20)
                ]);
                setRpmBase(optStr(spec.rpmBase));
                setRpmMin(optStr(spec.rpmMin));
                setRpmMax(optStr(spec.rpmMax));
            }
        } else {
            setCapacity("");
            setPowerInput("");
            setQCoeffs(Array(20).fill(""));
            setPCoeffs(Array(20).fill(""));
            setRpmBase("");
            setRpmMin("");
            setRpmMax("");
        }
    }, [compressor, compressorSpecsList]);

    const handleEditCompressor = async () => {
        if (selectedItemToEdit === "Select Compressor") {
            showToast(t("selectToEdit", { name: t("names.compressor.low") }), "error");
            return;
        }
        if (brand === "Select Brand" || type === "Select Type" || !model || refrigerant === "Select Refrigerant") {
            showToast(t("fillAllFields"), "error");
            return;
        }

        const comp = compressorsList.find(c => `${c.brand} / ${c.model} / ${c.type}` === selectedItemToEdit);
        if (!comp) return;

        const refrigerantItem = refrigerantsList.find(r => refrigerantLabel(r) === refrigerant);

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editCompressor/${comp.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand, type, model, moc: parseFloat(moc), lra: parseFloat(lra), refrigerantId: refrigerantItem ? refrigerantItem.id : null }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("updatedSuccess", { name: t("names.compressor.cap") }), "success");
                setSelectedItemToEdit("Select Compressor");
                fetchCompressors();
                fetchCompressorSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEdit", { name: t("names.compressor.low") }), "error");
                } catch {
                    showToast(t("failedEdit", { name: t("names.compressor.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const handleEditCompressorSpecs = async () => {
        if (compressor === "Select Compressor") {
            showToast(t("selectSpecs", { name: t("names.compressor.cap") }), "error");
            return;
        }
        if (!capacity || !powerInput) {
            showToast(t("fillAllFields"), "error");
            return;
        }
        // Only the required coefficients must be filled: Q1–Q10 always, Q11–Q20 only for ISCR.
        if (qCoeffs.slice(0, qCount).some(v => v === "") || pCoeffs.slice(0, pCount).some(v => v === "")) {
            showToast(t("fillCoefficients"), "error");
            return;
        }
        if (isIscr && (!rpmBase || !rpmMin || !rpmMax)) {
            showToast(t("fillRpm"), "error");
            return;
        }

        const selectedSpec = compressorSpecsList.find(s => `${s.brand} / ${s.model} / ${s.type} / C: ${s.capacity} / PI: ${s.powerInput}` === compressor);
        if (!selectedSpec) return;

        const qObj = Object.fromEntries(qCoeffs.slice(0, qCount).map((v, i) => [`qC${i + 1}`, parseFloat(v)]));
        const pObj = Object.fromEntries(pCoeffs.slice(0, pCount).map((v, i) => [`pC${i + 1}`, parseFloat(v)]));
        const rpmObj = isIscr
            ? { rpmBase: parseFloat(rpmBase), rpmMin: parseFloat(rpmMin), rpmMax: parseFloat(rpmMax) }
            : { rpmBase: null, rpmMin: null, rpmMax: null };

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editCompressorSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    compressorId: 0,
                    capacity: parseFloat(capacity),
                    powerInput: parseFloat(powerInput),
                    ...rpmObj,
                    ...qObj,
                    ...pObj
                }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("specsUpdatedSuccess", { name: t("names.compressor.cap") }), "success");
                setCompressor("Select Compressor");
                fetchCompressorSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEditSpecs", { name: t("names.compressor.low") }), "error");
                } catch {
                    showToast(t("failedEditSpecs", { name: t("names.compressor.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    // Imported Frascold catalogue compressors are managed via the import, not this page — hide them.
    const compressorOptions = ["Select Compressor", ...compressorsList.filter(c => !c.imported).map(c => `${c.brand} / ${c.model} / ${c.type}`)];
    const specsOptions = ["Select Compressor", ...compressorSpecsList.map(s => `${s.brand} / ${s.model} / ${s.type} / C: ${s.capacity} / PI: ${s.powerInput}`)];

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select Compressor") { showToast(t("selectToDelete", { name: t("names.compressor.low") }), "error"); return; }
        const item = compressorsList.find(c => `${c.brand} / ${c.model} / ${c.type}` === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: t("deleteTitle", { name: t("names.compressor.cap") }), message: t("deleteMessage", { item: selectedItemToEdit }), confirmText: t("delete") });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/compressor/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast(t("deleted", { name: t("names.compressor.cap") }), "success");
                setSelectedItemToEdit("Select Compressor");
                fetchCompressors();
                fetchCompressorSpecs();
            } else {
                showToast(t("failedDelete", { name: t("names.compressor.low") }), "error");
            }
        } catch (error) { console.error(error); showToast(t("networkError"), "error"); }
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
                        {t("names.compressor.cap")}
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>{t("names.compressor.cap")}</label>
                                    <Combobox
                                        options={compressorOptions}
                                        value={selectedItemToEdit}
                                        onChange={setSelectedItemToEdit}
                                        getLabel={(v) => v === "Select Compressor" ? t("selectName", { name: t("names.compressor.cap") }) : v}
                                        className={`${styles.comboBox} ${selectedItemToEdit.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("brand")}</label>
                                    <Combobox
                                        options={["Select Brand", "Frascold", "Copelant"]}
                                        value={brand}
                                        onChange={setBrand}
                                        getLabel={(v) => v === "Select Brand" ? t("selectName", { name: t("brand") }) : v}
                                        className={`${styles.comboBox} ${brand.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("type")}</label>
                                    <Combobox
                                        options={["Select Type", "RC", "SC", "SCR", "ISCR"]}
                                        value={type}
                                        onChange={setType}
                                        getLabel={(v) => v === "Select Type" ? t("selectName", { name: t("type") }) : v}
                                        className={`${styles.comboBox} ${type.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("model")}</label>
                                    <input
                                        type="text"
                                        className={styles.inputElement}
                                        placeholder={t("enterModel")}
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("mocA")}</label>
                                    <input
                                        type="number" onWheel={(e) => e.currentTarget.blur()}
                                        className={styles.inputElement}
                                        placeholder={t("enterMoc")}
                                        value={moc}
                                        onChange={(e) => setMoc(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("lraA")}</label>
                                    <input
                                        type="number" onWheel={(e) => e.currentTarget.blur()}
                                        className={styles.inputElement}
                                        placeholder={t("enterLra")}
                                        value={lra}
                                        onChange={(e) => setLra(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("refrigerant")}</label>
                                    <Combobox
                                        options={["Select Refrigerant", ...refrigerantsList.map(refrigerantLabel)]}
                                        value={refrigerant}
                                        onChange={setRefrigerant}
                                        getLabel={(v) => v === "Select Refrigerant" ? t("selectRefrigerant") : v}
                                        className={`${styles.comboBox} ${refrigerant.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e', marginRight: '12px' }} onClick={handleDelete}>{t("delete")}</button>
                                <button className={styles.saveBtn} onClick={handleEditCompressor}>{t("save")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>

                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>{t("specsSuffix", { name: t("names.compressor.cap") })}</label>
                                    <Combobox
                                        options={specsOptions}
                                        value={compressor}
                                        onChange={setCompressor}
                                        getLabel={(v) => v === "Select Compressor" ? t("selectName", { name: t("names.compressor.cap") }) : v}
                                        className={`${styles.comboBox} ${compressor.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("capacity")}</label>
                                    <input
                                        type="number" onWheel={(e) => e.currentTarget.blur()}
                                        className={styles.inputElement}
                                        placeholder={t("enterCapacity")}
                                        value={capacity}
                                        onChange={(e) => setCapacity(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("powerInput")}</label>
                                    <input
                                        type="number" onWheel={(e) => e.currentTarget.blur()}
                                        className={styles.inputElement}
                                        placeholder={t("enterPowerInput")}
                                        value={powerInput}
                                        onChange={(e) => setPowerInput(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '28px 0' }}></div>

                            {isIscr && (
                                <fieldset className={styles.coeffGroup}>
                                    <legend>{t("rpmSection")}</legend>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        <div className={styles.formField}>
                                            <label>{t("rpmBase")}</label>
                                            <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterRpm")} value={rpmBase} onChange={(e) => setRpmBase(e.target.value)} />
                                        </div>
                                        <div className={styles.formField}>
                                            <label>{t("rpmMin")}</label>
                                            <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterRpm")} value={rpmMin} onChange={(e) => setRpmMin(e.target.value)} />
                                        </div>
                                        <div className={styles.formField}>
                                            <label>{t("rpmMax")}</label>
                                            <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterRpm")} value={rpmMax} onChange={(e) => setRpmMax(e.target.value)} />
                                        </div>
                                    </div>
                                </fieldset>
                            )}

                            <fieldset className={styles.coeffGroup}>
                                <legend>{t("capacityCoeffs")}</legend>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                    {qCoeffs.slice(0, qCount).map((val, i) => (
                                        <div className={styles.formField} key={`q${i}`}>
                                            <label>Q-C{i + 1}</label>
                                            <input
                                                type="number" onWheel={(e) => e.currentTarget.blur()}
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
                                <legend>{t("powerCoeffs")}</legend>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                    {pCoeffs.slice(0, pCount).map((val, i) => (
                                        <div className={styles.formField} key={`p${i}`}>
                                            <label>P-C{i + 1}</label>
                                            <input
                                                type="number" onWheel={(e) => e.currentTarget.blur()}
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
                                <button className={styles.saveBtn} onClick={handleEditCompressorSpecs}>{t("save")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
