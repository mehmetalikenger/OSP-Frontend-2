"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useTranslations } from "next-intl";

const API = process.env.NEXT_PUBLIC_API_URL;
// Backend stores the Copeland brand under this (legacy) value; imported Frascold use "Frascold".
const COPELAND = "Copelant";

type Compressor = {
    id: number;
    brand: string;
    model: string;
    type: string;
};

type Refrigerant = {
    id: number;
    name: string;
    code: string;
};

type ModeCapacity = { id: number; mod: string; capacity: number; powerInput: number; maxCapacity: number };

type CompressorRating = {
    id: number;
    compressorId: number;
    brand: string;
    type: string;
    model: string;
    refrigerantId: number;
    refrigerantCode: string;
    capCoeffs: number[];
    powerCoeffs: number[];
    massCoeffs: number[];
    ohRef: number;
    scRef: number;
    minFrequency: number;
    maxFrequency: number;
    minSpeed: number;
    maxSpeed: number;
    modeCapacities: ModeCapacity[];
};

// Imported refrigerants have name === code, so show a single value; only show "name / code"
// when they actually differ.
const refrigerantLabel = (r: Refrigerant) => (r.name === r.code ? r.code : `${r.name} / ${r.code}`);
// RC compressors use 10 coefficients per group; ISCR use 20.
const coeffCount = (type: string) => (type === "RC" ? 10 : 20);

export default function AddCompressorPage() {
    const t = useTranslations("AdminComp");

    // --- Section 1: compressor identity (Copeland only) ---
    const [brand] = useState(COPELAND);
    const [type, setType] = useState("Select Type");
    const [model, setModel] = useState("");
    const [moc, setMoc] = useState("");
    const [lra, setLra] = useState("");

    // --- Section 2: rating + coefficients (Copeland only; selected via brand/type/model filters) ---
    const [s2Type, setS2Type] = useState("All Types");
    const [s2Model, setS2Model] = useState("Select Model");
    const [refrigerant, setRefrigerant] = useState("Select Refrigerant");
    const [capCoeffs, setCapCoeffs] = useState<string[]>(Array(20).fill(""));
    const [powerCoeffs, setPowerCoeffs] = useState<string[]>(Array(20).fill(""));

    // --- Section 3: mode capacity ---
    const [mcFilterBrand, setMcFilterBrand] = useState("All Brands");
    const [mcFilterType, setMcFilterType] = useState("All Types");
    const [mcRating, setMcRating] = useState("Select Model");
    const [mcMod, setMcMod] = useState("Select Mode");
    const [mcCapacity, setMcCapacity] = useState("");
    const [mcPowerInput, setMcPowerInput] = useState("");
    const [mcMaxCapacity, setMcMaxCapacity] = useState("");

    const [compressorsList, setCompressorsList] = useState<Compressor[]>([]);
    const [refrigerantsList, setRefrigerantsList] = useState<Refrigerant[]>([]);
    const [ratingsList, setRatingsList] = useState<CompressorRating[]>([]);
    const [toastInfo, setToastInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchCompressors = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/component/compressors`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) setCompressorsList(await res.json());
        } catch (e) {
            console.error("Failed to fetch compressors", e);
        }
    };

    const fetchRefrigerants = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/component/refrigerants`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) setRefrigerantsList(await res.json());
        } catch (e) {
            console.error("Failed to fetch refrigerants", e);
        }
    };

    const fetchRatings = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/component/allCompressorRatings`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) setRatingsList(await res.json());
        } catch (e) {
            console.error("Failed to fetch compressor ratings", e);
        }
    };

    useEffect(() => {
        fetchCompressors();
        fetchRefrigerants();
        fetchRatings();
    }, []);

    const num = (v: string) => parseFloat(v);

    // ----- Section 1: add compressor -----
    const handleAddCompressor = async () => {
        if (type === "Select Type" || !model) {
            showToast(t("fillAllFields"), "error");
            return;
        }
        try {
            const res = await fetchWithAuth(`${API}/admin/component/addCompressor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand, type, model, moc: num(moc), lra: num(lra) }),
                credentials: 'include'
            });
            if (res.ok) {
                showToast(t("addedSuccess", { name: t("names.compressor.cap") }), "success");
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

    // ----- Section 2: add rating (Copeland only, selected by type + model) -----
    const copelandCompressors = compressorsList.filter(c => c.brand !== "Frascold");
    const s2Filtered = copelandCompressors.filter(c => s2Type === "All Types" || c.type === s2Type);
    const s2ModelOptions = ["Select Model", ...s2Filtered.map(c => c.model)];
    const selectedRatingCompressor = s2Filtered.find(c => c.model === s2Model);
    const ratingCoeffCount = selectedRatingCompressor ? coeffCount(selectedRatingCompressor.type) : 0;

    const setCoeff = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (i: number, v: string) => {
        setter(prev => { const next = [...prev]; next[i] = v; return next; });
    };

    const handleAddRating = async () => {
        if (!selectedRatingCompressor) {
            showToast(t("selectName", { name: t("names.compressor.cap") }), "error");
            return;
        }
        if (refrigerant === "Select Refrigerant") {
            showToast(t("fillAllFields"), "error");
            return;
        }
        const refrigerantItem = refrigerantsList.find(r => refrigerantLabel(r) === refrigerant);
        if (!refrigerantItem) {
            showToast(t("invalidSelected", { name: t("refrigerant") }), "error");
            return;
        }
        const n = ratingCoeffCount;
        const filled = (arr: string[]) => arr.slice(0, n).every(v => v !== "");
        if (!filled(capCoeffs) || !filled(powerCoeffs)) {
            showToast(t("fillCoefficients"), "error");
            return;
        }

        const body = {
            compressorId: selectedRatingCompressor.id,
            refrigerantId: refrigerantItem.id,
            capCoeffs: capCoeffs.slice(0, n).map(num),
            powerCoeffs: powerCoeffs.slice(0, n).map(num),
        };

        try {
            const res = await fetchWithAuth(`${API}/admin/component/addCompressorRating`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            if (res.ok) {
                showToast(t("ratingAddedSuccess"), "success");
                setS2Type("All Types");
                setS2Model("Select Model");
                setRefrigerant("Select Refrigerant");
                setCapCoeffs(Array(20).fill(""));
                setPowerCoeffs(Array(20).fill(""));
                fetchRatings();
            } else {
                const data = await res.json().catch(() => null);
                showToast(data?.message || t("failedAddRating"), "error");
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    // ----- Section 3: add mode capacity (Copeland only) -----
    const copelandRatings = ratingsList.filter(r => r.brand !== "Frascold");
    const mcBrandOptions = ["All Brands", ...Array.from(new Set(copelandRatings.map(r => r.brand)))];
    const mcTypeOptions = ["All Types", ...Array.from(new Set(copelandRatings.map(r => r.type)))];
    const filteredRatings = copelandRatings.filter(r =>
        (mcFilterBrand === "All Brands" || r.brand === mcFilterBrand) &&
        (mcFilterType === "All Types" || r.type === mcFilterType)
    );
    // Show only the model name per the spec.
    const mcRatingOptions = ["Select Model", ...filteredRatings.map(r => r.model)];
    const selectedMcRating = filteredRatings.find(r => r.model === mcRating);
    const mcIsIscr = selectedMcRating?.type === "ISCR";
    // A mode can hold only one capacity, so hide modes already filled on the selected model.
    const existingMods = selectedMcRating ? selectedMcRating.modeCapacities.map(mc => mc.mod) : [];
    const mcModOptions = ["Select Mode", ...["COOLING", "HEATING"].filter(m => !existingMods.includes(m))];

    const handleAddModeCapacity = async () => {
        if (!selectedMcRating) {
            showToast(t("selectRatingError"), "error");
            return;
        }
        if (mcMod === "Select Mode" || !mcCapacity || !mcPowerInput) {
            showToast(t("fillAllFields"), "error");
            return;
        }
        const body = {
            compressorRatingId: selectedMcRating.id,
            mod: mcMod,
            capacity: num(mcCapacity),
            powerInput: num(mcPowerInput),
            maxCapacity: mcIsIscr && mcMaxCapacity ? num(mcMaxCapacity) : 0,
        };
        try {
            const res = await fetchWithAuth(`${API}/admin/component/addCompressorModeCapacity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            if (res.ok) {
                showToast(t("modeCapacityAddedSuccess"), "success");
                setMcMod("Select Mode");
                setMcCapacity("");
                setMcPowerInput("");
                setMcMaxCapacity("");
                fetchRatings();
            } else {
                const data = await res.json().catch(() => null);
                showToast(data?.message || t("failedAddModeCapacity"), "error");
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    // Paste a whole coefficient row/column from Excel into a group: splits the clipboard on any
    // whitespace (tab/newline — Excel rows are tab-separated, columns newline-separated) or commas,
    // and fills the group from the input that received the paste. A single value pastes normally.
    const handleCoeffPaste = (onSet: (i: number, v: string) => void, startIndex: number) =>
        (e: React.ClipboardEvent<HTMLInputElement>) => {
            const parts = e.clipboardData.getData("text").split(/[\s,]+/).filter(p => p.trim() !== "");
            if (parts.length <= 1) return; // normal single-value paste
            e.preventDefault();
            parts.forEach((v, k) => { if (startIndex + k < ratingCoeffCount) onSet(startIndex + k, v); });
        };

    const coeffGroup = (legend: string, values: string[], onSet: (i: number, v: string) => void, prefix: string) => (
        <fieldset className={styles.coeffGroup}>
            <legend>{legend}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {values.slice(0, ratingCoeffCount).map((val, i) => (
                    <div className={styles.formField} key={`${prefix}${i}`}>
                        <label>{prefix}{i + 1}</label>
                        <input
                            type="text" inputMode="decimal"
                            className={styles.inputElement}
                            placeholder="0"
                            value={val}
                            onChange={(e) => onSet(i, e.target.value)}
                            onPaste={handleCoeffPaste(onSet, i)}
                        />
                    </div>
                ))}
            </div>
        </fieldset>
    );

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
                            {/* ---- Step 1: compressor identity ---- */}
                            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', cursor: 'default' }}>{t("sectionIdentity")}</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>{t("brand")}</label>
                                    <Combobox
                                        options={[COPELAND]}
                                        value={brand}
                                        onChange={() => {}}
                                        getLabel={(v) => v}
                                        className={styles.comboBox}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("type")}</label>
                                    <Combobox
                                        options={["Select Type", "RC", "ISCR"]}
                                        value={type}
                                        onChange={setType}
                                        getLabel={(v) => v === "Select Type" ? t("selectName", { name: t("type") }) : v}
                                        className={`${styles.comboBox} ${type.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("model")}</label>
                                    <input type="text" className={styles.inputElement} placeholder={t("enterModel")} value={model} onChange={(e) => setModel(e.target.value)} />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("mocA")}</label>
                                    <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterMoc")} value={moc} onChange={(e) => setMoc(e.target.value)} />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("lraA")}</label>
                                    <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterLra")} value={lra} onChange={(e) => setLra(e.target.value)} />
                                </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddCompressor}>{t("add")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>

                            {/* ---- Step 2: rating + coefficients ---- */}
                            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', cursor: 'default' }}>{t("sectionRating")}</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>{t("filterBrand")}</label>
                                    <Combobox
                                        options={[COPELAND]}
                                        value={brand}
                                        onChange={() => {}}
                                        getLabel={(v) => v}
                                        className={styles.comboBox}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("filterType")}</label>
                                    <Combobox
                                        options={["All Types", "RC", "ISCR"]}
                                        value={s2Type}
                                        onChange={(v) => { setS2Type(v); setS2Model("Select Model"); }}
                                        getLabel={(v) => v === "All Types" ? t("allTypes") : v}
                                        className={styles.comboBox}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("model")}</label>
                                    <Combobox
                                        options={s2ModelOptions}
                                        value={s2Model}
                                        onChange={setS2Model}
                                        getLabel={(v) => v === "Select Model" ? t("selectName", { name: t("model") }) : v}
                                        className={`${styles.comboBox} ${s2Model.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                {/* Refrigerant placed BEFORE the coefficient inputs */}
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

                            {selectedRatingCompressor && (
                                <>
                                    <div className={styles.horizontalSeperator} style={{ margin: '28px 0' }}></div>
                                    {coeffGroup(t("capacityCoeffs"), capCoeffs, setCoeff(setCapCoeffs), "Q-C")}
                                    {coeffGroup(t("powerCoeffs"), powerCoeffs, setCoeff(setPowerCoeffs), "P-C")}
                                </>
                            )}

                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddRating}>{t("add")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>

                            {/* ---- Step 3: mode capacity ---- */}
                            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', cursor: 'default' }}>{t("sectionModeCapacity")}</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>{t("filterBrand")}</label>
                                    <Combobox
                                        options={mcBrandOptions}
                                        value={mcFilterBrand}
                                        onChange={(v) => { setMcFilterBrand(v); setMcRating("Select Model"); }}
                                        getLabel={(v) => v === "All Brands" ? t("allBrands") : v}
                                        className={styles.comboBox}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("filterType")}</label>
                                    <Combobox
                                        options={mcTypeOptions}
                                        value={mcFilterType}
                                        onChange={(v) => { setMcFilterType(v); setMcRating("Select Model"); }}
                                        getLabel={(v) => v === "All Types" ? t("allTypes") : v}
                                        className={styles.comboBox}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("model")}</label>
                                    <Combobox
                                        options={mcRatingOptions}
                                        value={mcRating}
                                        onChange={setMcRating}
                                        getLabel={(v) => v === "Select Model" ? t("selectName", { name: t("model") }) : v}
                                        className={`${styles.comboBox} ${mcRating.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("mod")}</label>
                                    <Combobox
                                        options={mcModOptions}
                                        value={mcMod}
                                        onChange={setMcMod}
                                        getLabel={(v) => v === "Select Mode" ? t("selectMod") : v === "COOLING" ? t("cooling") : t("heating")}
                                        className={`${styles.comboBox} ${mcMod.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("capacity")}</label>
                                    <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterCapacity")} value={mcCapacity} onChange={(e) => setMcCapacity(e.target.value)} />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("powerInput")}</label>
                                    <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterPowerInput")} value={mcPowerInput} onChange={(e) => setMcPowerInput(e.target.value)} />
                                </div>
                                {mcIsIscr && (
                                    <div className={styles.formField}>
                                        <label>{t("maxCapacity")}</label>
                                        <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterMaxCapacity")} value={mcMaxCapacity} onChange={(e) => setMcMaxCapacity(e.target.value)} />
                                    </div>
                                )}
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddModeCapacity}>{t("add")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
