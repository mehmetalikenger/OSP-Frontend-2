"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";
import { useTranslations } from "next-intl";

const API = process.env.NEXT_PUBLIC_API_URL;

type Refrigerant = {
    id: number;
    name: string;
    code: string;
};

type Compressor = {
    id: number;
    brand: string;
    model: string;
    type: string;
    moc: number;
    lra: number;
    imported?: boolean;
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
const str = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));
const padCoeffs = (arr: number[] | null | undefined) => {
    const out = Array(20).fill("");
    (arr ?? []).forEach((v, i) => { if (i < 20) out[i] = String(v); });
    return out;
};

export default function EditCompressorPage() {
    const t = useTranslations("AdminComp");
    const { confirm, confirmElement } = useConfirm();

    const [compressorsList, setCompressorsList] = useState<Compressor[]>([]);
    const [refrigerantsList, setRefrigerantsList] = useState<Refrigerant[]>([]);
    const [ratingsList, setRatingsList] = useState<CompressorRating[]>([]);

    const [filterBrand, setFilterBrand] = useState("All Brands");
    const [filterType, setFilterType] = useState("All Types");
    const [selectedRatingKey, setSelectedRatingKey] = useState("Select Rating");

    // Identity (editCompressor)
    const [brand, setBrand] = useState("");
    const [ctype, setCtype] = useState("");
    const [model, setModel] = useState("");
    const [moc, setMoc] = useState("");
    const [lra, setLra] = useState("");

    // Rating (editCompressorRating)
    const [refrigerant, setRefrigerant] = useState("Select Refrigerant");
    const [capCoeffs, setCapCoeffs] = useState<string[]>(Array(20).fill(""));
    const [powerCoeffs, setPowerCoeffs] = useState<string[]>(Array(20).fill(""));
    const [ohRef, setOhRef] = useState("");
    const [scRef, setScRef] = useState("");
    const [minFrequency, setMinFrequency] = useState("");
    const [maxFrequency, setMaxFrequency] = useState("");
    const [minSpeed, setMinSpeed] = useState("");
    const [maxSpeed, setMaxSpeed] = useState("");

    // Mode capacities (upsert)
    const [coolingCap, setCoolingCap] = useState("");
    const [coolingPI, setCoolingPI] = useState("");
    const [coolingMax, setCoolingMax] = useState("");
    const [heatingCap, setHeatingCap] = useState("");
    const [heatingPI, setHeatingPI] = useState("");
    const [heatingMax, setHeatingMax] = useState("");

    const [toastInfo, setToastInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchCompressors = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/component/compressors`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) setCompressorsList(await res.json());
        } catch (e) { console.error("Failed to fetch compressors", e); }
    };
    const fetchRefrigerants = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/component/refrigerants`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) setRefrigerantsList(await res.json());
        } catch (e) { console.error("Failed to fetch refrigerants", e); }
    };
    const fetchRatings = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/component/allCompressorRatings`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) setRatingsList(await res.json());
        } catch (e) { console.error("Failed to fetch compressor ratings", e); }
    };

    useEffect(() => {
        fetchCompressors();
        fetchRefrigerants();
        fetchRatings();
    }, []);

    const num = (v: string) => parseFloat(v);

    const ratingLabel = (r: CompressorRating) => `${r.brand} / ${r.model} / ${r.type} / ${r.refrigerantCode}`;
    const brandOptions = ["All Brands", ...Array.from(new Set(ratingsList.map(r => r.brand)))];
    const typeOptions = ["All Types", ...Array.from(new Set(ratingsList.map(r => r.type)))];
    const filteredRatings = ratingsList.filter(r =>
        (filterBrand === "All Brands" || r.brand === filterBrand) &&
        (filterType === "All Types" || r.type === filterType)
    );
    const ratingOptions = ["Select Rating", ...filteredRatings.map(ratingLabel)];

    const selectedRating = filteredRatings.find(r => ratingLabel(r) === selectedRatingKey);
    const selectedCompressor = selectedRating ? compressorsList.find(c => c.id === selectedRating.compressorId) : undefined;
    const isFrascold = selectedRating?.brand === "Frascold";
    const isIscr = selectedRating?.type === "ISCR";
    const cCount = selectedRating ? coeffCount(selectedRating.type) : 0;

    const resetFields = () => {
        setBrand(""); setCtype(""); setModel(""); setMoc(""); setLra("");
        setRefrigerant("Select Refrigerant");
        setCapCoeffs(Array(20).fill("")); setPowerCoeffs(Array(20).fill(""));
        setOhRef(""); setScRef(""); setMinFrequency(""); setMaxFrequency(""); setMinSpeed(""); setMaxSpeed("");
        setCoolingCap(""); setCoolingPI(""); setCoolingMax("");
        setHeatingCap(""); setHeatingPI(""); setHeatingMax("");
    };

    // Populate all fields whenever a rating (or the loaded lists) changes.
    useEffect(() => {
        if (!selectedRating) { resetFields(); return; }
        const comp = compressorsList.find(c => c.id === selectedRating.compressorId);
        setBrand(comp?.brand ?? selectedRating.brand);
        setCtype(comp?.type ?? selectedRating.type);
        setModel(comp?.model ?? selectedRating.model);
        setMoc(str(comp?.moc));
        setLra(str(comp?.lra));
        const ref = refrigerantsList.find(r => r.id === selectedRating.refrigerantId);
        setRefrigerant(ref ? refrigerantLabel(ref) : "Select Refrigerant");
        setCapCoeffs(padCoeffs(selectedRating.capCoeffs));
        setPowerCoeffs(padCoeffs(selectedRating.powerCoeffs));
        setOhRef(str(selectedRating.ohRef)); setScRef(str(selectedRating.scRef));
        setMinFrequency(str(selectedRating.minFrequency)); setMaxFrequency(str(selectedRating.maxFrequency));
        setMinSpeed(str(selectedRating.minSpeed)); setMaxSpeed(str(selectedRating.maxSpeed));
        const cool = selectedRating.modeCapacities.find(m => m.mod === "COOLING");
        const heat = selectedRating.modeCapacities.find(m => m.mod === "HEATING");
        setCoolingCap(str(cool?.capacity)); setCoolingPI(str(cool?.powerInput)); setCoolingMax(str(cool?.maxCapacity));
        setHeatingCap(str(heat?.capacity)); setHeatingPI(str(heat?.powerInput)); setHeatingMax(str(heat?.maxCapacity));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRatingKey, ratingsList, compressorsList, refrigerantsList]);

    const setCoeff = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (i: number, v: string) => {
        setter(prev => { const next = [...prev]; next[i] = v; return next; });
    };

    // ----- Identity (editCompressor) -----
    const handleEditCompressor = async () => {
        if (!selectedCompressor) { showToast(t("selectToEdit", { name: t("names.compressor.low") }), "error"); return; }
        try {
            const res = await fetchWithAuth(`${API}/admin/component/editCompressor/${selectedCompressor.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand, type: ctype, model, moc: num(moc), lra: num(lra) }),
                credentials: 'include'
            });
            if (res.ok) {
                showToast(t("updatedSuccess", { name: t("names.compressor.cap") }), "success");
                fetchCompressors();
                fetchRatings();
            } else {
                const data = await res.json().catch(() => null);
                showToast(data?.message || t("failedEdit", { name: t("names.compressor.low") }), "error");
            }
        } catch (error) { console.error(error); showToast(t("networkError"), "error"); }
    };

    // ----- Rating (editCompressorRating) — Copeland only -----
    const handleEditRating = async () => {
        if (!selectedRating) { showToast(t("selectRatingError"), "error"); return; }
        const refrigerantItem = refrigerantsList.find(r => refrigerantLabel(r) === refrigerant);
        if (!refrigerantItem) { showToast(t("invalidSelected", { name: t("refrigerant") }), "error"); return; }
        const filled = (arr: string[]) => arr.slice(0, cCount).every(v => v !== "");
        if (!filled(capCoeffs) || !filled(powerCoeffs)) {
            showToast(t("fillCoefficients"), "error");
            return;
        }
        const body = {
            compressorId: selectedRating.compressorId,
            refrigerantId: refrigerantItem.id,
            capCoeffs: capCoeffs.slice(0, cCount).map(num),
            powerCoeffs: powerCoeffs.slice(0, cCount).map(num),
            massCoeffs: (selectedRating.massCoeffs ?? []).slice(0, cCount),
            ohRef: num(ohRef) || 0,
            scRef: num(scRef) || 0,
            minFrequency: num(minFrequency) || 0,
            maxFrequency: num(maxFrequency) || 0,
            minSpeed: num(minSpeed) || 0,
            maxSpeed: num(maxSpeed) || 0,
        };
        try {
            const res = await fetchWithAuth(`${API}/admin/component/editCompressorRating/${selectedRating.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            if (res.ok) {
                showToast(t("ratingUpdatedSuccess"), "success");
                fetchRatings();
            } else {
                const data = await res.json().catch(() => null);
                showToast(data?.message || t("failedEditRating"), "error");
            }
        } catch (error) { console.error(error); showToast(t("networkError"), "error"); }
    };

    // ----- Mode capacities (upsert) -----
    const saveModeCapacity = async (mod: "COOLING" | "HEATING", cap: string, pi: string, max: string) => {
        if (!selectedRating) { showToast(t("selectRatingError"), "error"); return false; }
        if (!cap || !pi) { showToast(t("fillAllFields"), "error"); return false; }
        const body = {
            compressorRatingId: selectedRating.id,
            mod,
            capacity: num(cap),
            powerInput: num(pi),
            maxCapacity: isIscr && max ? num(max) : 0,
        };
        try {
            const res = await fetchWithAuth(`${API}/admin/component/addCompressorModeCapacity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            if (res.ok) return true;
            const data = await res.json().catch(() => null);
            showToast(data?.message || t("failedAddModeCapacity"), "error");
            return false;
        } catch (error) { console.error(error); showToast(t("networkError"), "error"); return false; }
    };

    const handleSaveModeCapacities = async () => {
        let any = false;
        if (coolingCap && coolingPI) { if (await saveModeCapacity("COOLING", coolingCap, coolingPI, coolingMax)) any = true; }
        if (heatingCap && heatingPI) { if (await saveModeCapacity("HEATING", heatingCap, heatingPI, heatingMax)) any = true; }
        if (!any) { showToast(t("fillAllFields"), "error"); return; }
        showToast(t("modeCapacityAddedSuccess"), "success");
        fetchRatings();
    };

    const handleDelete = async () => {
        if (!selectedCompressor) { showToast(t("selectToDelete", { name: t("names.compressor.low") }), "error"); return; }
        const ok = await confirm({ title: t("deleteTitle", { name: t("names.compressor.cap") }), message: t("deleteMessage", { item: selectedRatingKey }), confirmText: t("delete") });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${API}/admin/component/compressor/${selectedCompressor.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast(t("deleted", { name: t("names.compressor.cap") }), "success");
                setSelectedRatingKey("Select Rating");
                fetchCompressors();
                fetchRatings();
            } else {
                showToast(t("failedDelete", { name: t("names.compressor.low") }), "error");
            }
        } catch (error) { console.error(error); showToast(t("networkError"), "error"); }
    };

    const coeffGroupEl = (legend: string, values: string[], onSet: (i: number, v: string) => void, prefix: string) => (
        <fieldset className={styles.coeffGroup}>
            <legend>{legend}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {values.slice(0, cCount).map((val, i) => (
                    <div className={styles.formField} key={`${prefix}${i}`}>
                        <label>{prefix}{i + 1}</label>
                        <input
                            type="text" inputMode="decimal"
                            className={styles.inputElement}
                            placeholder="0"
                            value={val}
                            onChange={(e) => onSet(i, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </fieldset>
    );

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
                            {/* ---- Filters + selection ---- */}
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>{t("filterBrand")}</label>
                                    <Combobox
                                        options={brandOptions}
                                        value={filterBrand}
                                        onChange={(v) => { setFilterBrand(v); setSelectedRatingKey("Select Rating"); }}
                                        getLabel={(v) => v === "All Brands" ? t("allBrands") : v}
                                        className={styles.comboBox}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("filterType")}</label>
                                    <Combobox
                                        options={typeOptions}
                                        value={filterType}
                                        onChange={(v) => { setFilterType(v); setSelectedRatingKey("Select Rating"); }}
                                        getLabel={(v) => v === "All Types" ? t("allTypes") : v}
                                        className={styles.comboBox}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("rating")}</label>
                                    <Combobox
                                        options={ratingOptions}
                                        value={selectedRatingKey}
                                        onChange={setSelectedRatingKey}
                                        getLabel={(v) => v === "Select Rating" ? t("selectRating") : v}
                                        className={`${styles.comboBox} ${selectedRatingKey.startsWith('Select') ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                            </div>

                            {selectedRating && (
                                <>
                                    {isFrascold && (
                                        <p style={{ fontSize: '13px', opacity: 0.75, margin: '14px 0 0' }}>{t("frascoldNote")}</p>
                                    )}

                                    <div className={styles.horizontalSeperator} style={{ margin: '24px 0' }}></div>

                                    {/* ---- Identity (editCompressor) ---- */}
                                    <h3 className={styles.breadcrumbItem} style={{ marginBottom: '12px' }}>{t("sectionIdentity")}</h3>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formField}>
                                            <label>{t("brand")}</label>
                                            <input type="text" className={styles.inputElement} value={brand} onChange={(e) => setBrand(e.target.value)} disabled={isFrascold} />
                                        </div>
                                        <div className={styles.formField}>
                                            <label>{t("type")}</label>
                                            <input type="text" className={styles.inputElement} value={ctype} onChange={(e) => setCtype(e.target.value)} disabled={isFrascold} />
                                        </div>
                                        <div className={styles.formField}>
                                            <label>{t("model")}</label>
                                            <input type="text" className={styles.inputElement} value={model} onChange={(e) => setModel(e.target.value)} disabled={isFrascold} />
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
                                        <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e', marginRight: '12px' }} onClick={handleDelete}>{t("delete")}</button>
                                        <button className={styles.saveBtn} onClick={handleEditCompressor}>{t("save")}</button>
                                    </div>

                                    {/* ---- Rating + coefficients (Copeland only) ---- */}
                                    {!isFrascold && (
                                        <>
                                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                                            <h3 className={styles.breadcrumbItem} style={{ marginBottom: '12px' }}>{t("sectionRating")}</h3>
                                            <div className={styles.formGrid}>
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
                                            <div className={styles.horizontalSeperator} style={{ margin: '24px 0' }}></div>
                                            {coeffGroupEl(t("capacityCoeffs"), capCoeffs, setCoeff(setCapCoeffs), "Q-C")}
                                            {coeffGroupEl(t("powerCoeffs"), powerCoeffs, setCoeff(setPowerCoeffs), "P-C")}
                                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                                <button className={styles.saveBtn} onClick={handleEditRating}>{t("save")}</button>
                                            </div>
                                        </>
                                    )}

                                    {/* ---- Mode capacities (upsert) ---- */}
                                    <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                                    <h3 className={styles.breadcrumbItem} style={{ marginBottom: '12px' }}>{t("sectionModeCapacity")}</h3>
                                    <fieldset className={styles.coeffGroup}>
                                        <legend>{t("cooling")}</legend>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                            <div className={styles.formField}><label>{t("capacity")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterCapacity")} value={coolingCap} onChange={(e) => setCoolingCap(e.target.value)} /></div>
                                            <div className={styles.formField}><label>{t("powerInput")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterPowerInput")} value={coolingPI} onChange={(e) => setCoolingPI(e.target.value)} /></div>
                                            {isIscr && (<div className={styles.formField}><label>{t("maxCapacity")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterMaxCapacity")} value={coolingMax} onChange={(e) => setCoolingMax(e.target.value)} /></div>)}
                                        </div>
                                    </fieldset>
                                    <fieldset className={styles.coeffGroup}>
                                        <legend>{t("heating")}</legend>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                            <div className={styles.formField}><label>{t("capacity")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterCapacity")} value={heatingCap} onChange={(e) => setHeatingCap(e.target.value)} /></div>
                                            <div className={styles.formField}><label>{t("powerInput")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterPowerInput")} value={heatingPI} onChange={(e) => setHeatingPI(e.target.value)} /></div>
                                            {isIscr && (<div className={styles.formField}><label>{t("maxCapacity")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} placeholder={t("enterMaxCapacity")} value={heatingMax} onChange={(e) => setHeatingMax(e.target.value)} /></div>)}
                                        </div>
                                    </fieldset>
                                    <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                        <button className={styles.saveBtn} onClick={handleSaveModeCapacities}>{t("save")}</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
