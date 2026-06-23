"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useTranslations } from "next-intl";

type Compressor = {
    id: number;
    brand: string;
    model: string;
    type: string;
}

export default function AddCompressorPage() {
    const t = useTranslations("AdminComp");
    const [brand, setBrand] = useState("Select Brand");
    const [type, setType] = useState("Select Type");
    const [model, setModel] = useState("");
    const [moc, setMoc] = useState("");
    const [lra, setLra] = useState("");

    const [compressor, setCompressor] = useState("Select Compressor");
    const [capacity, setCapacity] = useState("");
    const [powerInput, setPowerInput] = useState("");
    const [qCoeffs, setQCoeffs] = useState<string[]>(Array(10).fill(""));
    const [pCoeffs, setPCoeffs] = useState<string[]>(Array(10).fill(""));

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
            showToast(t("fillAllFields"), "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addCompressor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand, type, model, moc: parseFloat(moc), lra: parseFloat(lra) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("addedSuccess", { name: t("names.compressor.cap") }), "success");
                setBrand("Select Brand");
                setType("Select Type");
                setModel("");
                setMoc("");
                setLra("");
                fetchCompressors();
            } else if (res.status === 409) {
                showToast(t("alreadyExists", { name: t("names.compressor.low") }), "error");
            } else {
                const data = await res.json().catch(() => null);
                showToast(data?.message || t("failedAdd", { name: t("names.compressor.low") }), "error");
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const handleAddCompressorSpecs = async () => {
        if (compressor === "Select Compressor" || !capacity || !powerInput) {
            showToast(t("fillAllFields"), "error");
            return;
        }
        if (qCoeffs.some(v => v === "") || pCoeffs.some(v => v === "")) {
            showToast(t("fillCoefficients"), "error");
            return;
        }

        const selectedComp = compressorsList.find(c => `${c.brand} / ${c.model} / ${c.type}` === compressor);
        if (!selectedComp) {
            showToast(t("invalidSelected", { name: t("names.compressor.low") }), "error");
            return;
        }

        const qObj = Object.fromEntries(qCoeffs.map((v, i) => [`qC${i + 1}`, parseFloat(v)]));
        const pObj = Object.fromEntries(pCoeffs.map((v, i) => [`pC${i + 1}`, parseFloat(v)]));

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addCompressorSpecs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    compressorId: selectedComp.id,
                    capacity: parseFloat(capacity),
                    powerInput: parseFloat(powerInput),
                    ...qObj,
                    ...pObj
                }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("specsAddedSuccess", { name: t("names.compressor.cap") }), "success");
                setCompressor("Select Compressor");
                setCapacity("");
                setPowerInput("");
                setQCoeffs(Array(10).fill(""));
                setPCoeffs(Array(10).fill(""));
            } else {
                showToast(t("failedAddSpecs", { name: t("names.compressor.low") }), "error");
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
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
                        {t("names.compressor.cap")}
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
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
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddCompressor}>{t("add")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>

                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>{t("names.compressor.cap")}</label>
                                    <Combobox
                                        options={compressorOptions}
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

                            <fieldset className={styles.coeffGroup}>
                                <legend>{t("capacityCoeffs")}</legend>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                    {qCoeffs.map((val, i) => (
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
                                    {pCoeffs.map((val, i) => (
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
                                <button className={styles.saveBtn} onClick={handleAddCompressorSpecs}>{t("add")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
