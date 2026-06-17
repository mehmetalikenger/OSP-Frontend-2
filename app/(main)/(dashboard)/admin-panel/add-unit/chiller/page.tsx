"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type ComponentSpecs = { id: number; brand?: string | null; model: string; capacity: number };
type Chassis = { id: number; brand?: string | null; model: string };
type Refrigerant = { id: number; name: string; code: string };

type Upload = { file: File; url: string; id: string };
let uidCounter = 0;
const uid = () => `u${Date.now()}_${uidCounter++}`;

const MAX_TOTAL_BYTES = 25 * 1024 * 1024; // 25 MB for the whole upload

const SELECT = {
    compressor: "Select Compressor",
    evaporator: "Select Evaporator",
    condenser: "Select Condenser",
    expansionValve: "Select Expansion Valve",
    reversingValve: "Select Reversing Valve",
    chassis: "Select Chasis",
    refrigerant: "Select Refrigerant",
};

const specLabel = (s: ComponentSpecs) => `${[s.brand, s.model].filter(Boolean).join(" / ")} / ${s.capacity} kW`;
const chassisLabel = (c: Chassis) => [c.brand, c.model].filter(Boolean).join(" / ");
const refrigerantLabel = (r: Refrigerant) => `${r.name} / ${r.code}`;

const xBtnStyle: React.CSSProperties = {
    position: "absolute", top: -8, right: -8, width: 20, height: 20, borderRadius: "50%",
    border: "none", background: "#d9534f", color: "#fff", fontSize: 13, lineHeight: "1",
    cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
};

export default function Page() {
    const [activeTab, setActiveTab] = useState("model");
    const [unitType, setUnitType] = useState("air_to_water");
    const [unitMod] = useState("cooling");

    const [model, setModel] = useState("");
    const [compressor, setCompressor] = useState(SELECT.compressor);
    const [evaporator, setEvaporator] = useState(SELECT.evaporator);
    const [condenser, setCondenser] = useState(SELECT.condenser);
    const [expansionValve, setExpansionValve] = useState(SELECT.expansionValve);
    const [reversingValve, setReversingValve] = useState(SELECT.reversingValve);
    const [chasis, setChasis] = useState(SELECT.chassis);
    const [refrigerant, setRefrigerant] = useState(SELECT.refrigerant);

    const [compressorList, setCompressorList] = useState<ComponentSpecs[]>([]);
    const [evaporatorList, setEvaporatorList] = useState<ComponentSpecs[]>([]);
    const [condenserList, setCondenserList] = useState<ComponentSpecs[]>([]);
    const [expansionValveList, setExpansionValveList] = useState<ComponentSpecs[]>([]);
    const [reversingValveList, setReversingValveList] = useState<ComponentSpecs[]>([]);
    const [chassisList, setChassisList] = useState<Chassis[]>([]);
    const [refrigerantList, setRefrigerantList] = useState<Refrigerant[]>([]);

    const [ambient, setAmbient] = useState("");
    const [evapIn, setEvapIn] = useState("");
    const [evapOut, setEvapOut] = useState("");
    const [condIn, setCondIn] = useState("");
    const [condOut, setCondOut] = useState("");

    const [capacity, setCapacity] = useState("");
    const [compressorQty, setCompressorQty] = useState("");
    const [condenserRequiredDuty, setCondenserRequiredDuty] = useState("");
    const [quietCondenserRequiredDuty, setQuietCondenserRequiredDuty] = useState("");
    const [fanPI, setFanPI] = useState("");
    const [eer, setEer] = useState("");
    const [condenserQty, setCondenserQty] = useState("");
    const [numberOfFans, setNumberOfFans] = useState("");
    const [fanDiameter, setFanDiameter] = useState("");
    const [expansionValveQty, setExpansionValveQty] = useState("");
    const [airflowRate, setAirflowRate] = useState("");
    const [dischargeLineDiameter, setDischargeLineDiameter] = useState("");
    const [liquidLineDiameter, setLiquidLineDiameter] = useState("");
    const [suctionLineDiameter, setSuctionLineDiameter] = useState("");
    const [gasTank, setGasTank] = useState("");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [length, setLength] = useState("");

    // --- Uploads ---
    const [images, setImages] = useState<Upload[]>([]);
    const [primaryId, setPrimaryId] = useState<string | null>(null);
    const [drawings, setDrawings] = useState<Upload[]>([]);
    const [icons, setIcons] = useState<Upload[]>([]);
    const [documents, setDocuments] = useState<Upload[]>([]);
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const drawingInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const iconInputRef = useRef<HTMLInputElement>(null);

    const [submitting, setSubmitting] = useState(false);
    const [toastInfo, setToastInfo] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToastInfo({ message, type });
        setTimeout(() => setToastInfo(null), 3500);
    };

    useEffect(() => {
        const load = async (path: string, setter: (d: any) => void) => {
            try {
                const res = await fetchWithAuth(`${API}${path}`, { credentials: "include", cache: "no-store" });
                if (res.ok) setter(await res.json());
            } catch (e) {
                console.error(`Failed to load ${path}`, e);
            }
        };
        load("/admin/component/allCompressorSpecs", setCompressorList);
        load("/admin/component/allEvaporatorSpecs", setEvaporatorList);
        load("/admin/component/allCondenserSpecs", setCondenserList);
        load("/admin/component/allExpansionValveSpecs", setExpansionValveList);
        load("/admin/component/allFourWayReversingValveSpecs", setReversingValveList);
        load("/admin/component/chassis", setChassisList);
        load("/admin/component/refrigerants", setRefrigerantList);
    }, []);

    const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const int = (v: string) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };

    const totalBytes = (extra: File[] = []) =>
        [...images, ...drawings, ...icons, ...documents].reduce((sum, u) => sum + u.file.size, 0) +
        extra.reduce((sum, f) => sum + f.size, 0);

    const toUploads = (files: FileList | null): Upload[] => {
        if (!files?.length) return [];
        const arr = Array.from(files);
        if (totalBytes(arr) > MAX_TOTAL_BYTES) {
            showToast("Total upload can't exceed 25 MB.", "error");
            return [];
        }
        return arr.map((file) => ({ file, url: URL.createObjectURL(file), id: uid() }));
    };

    const onImageFiles = (files: FileList | null) => {
        const next = toUploads(files);
        if (!next.length) return;
        setImages((prev) => [...prev, ...next]);
        setPrimaryId((cur) => cur ?? next[0].id); // first image becomes primary by default
    };
    const onDrawingFiles = (files: FileList | null) => { const next = toUploads(files); if (next.length) setDrawings((p) => [...p, ...next]); };
    const onIconFiles = (files: FileList | null) => { const next = toUploads(files); if (next.length) setIcons((p) => [...p, ...next]); };
    const onDocumentFiles = (files: FileList | null) => { const next = toUploads(files); if (next.length) setDocuments((p) => [...p, ...next]); };

    const removeImage = (id: string) => {
        const item = images.find((u) => u.id === id);
        if (item) URL.revokeObjectURL(item.url);
        const remaining = images.filter((u) => u.id !== id);
        setImages(remaining);
        if (primaryId === id) setPrimaryId(remaining[0]?.id ?? null);
    };

    const removeFrom = (list: Upload[], setter: React.Dispatch<React.SetStateAction<Upload[]>>) => (id: string) => {
        const item = list.find((u) => u.id === id);
        if (item) URL.revokeObjectURL(item.url);
        setter(list.filter((u) => u.id !== id));
    };

    const resetForm = () => {
        setModel("");
        setCompressor(SELECT.compressor); setEvaporator(SELECT.evaporator); setCondenser(SELECT.condenser);
        setExpansionValve(SELECT.expansionValve); setReversingValve(SELECT.reversingValve);
        setChasis(SELECT.chassis); setRefrigerant(SELECT.refrigerant);
        setAmbient(""); setEvapIn(""); setEvapOut(""); setCondIn(""); setCondOut("");
        setCapacity(""); setCompressorQty(""); setCondenserRequiredDuty(""); setQuietCondenserRequiredDuty("");
        setFanPI(""); setEer(""); setCondenserQty(""); setNumberOfFans(""); setFanDiameter("");
        setExpansionValveQty(""); setAirflowRate(""); setDischargeLineDiameter(""); setLiquidLineDiameter("");
        setSuctionLineDiameter(""); setGasTank(""); setWidth(""); setHeight(""); setLength("");
        [...images, ...drawings, ...icons, ...documents].forEach((u) => URL.revokeObjectURL(u.url));
        setImages([]); setPrimaryId(null); setDrawings([]); setIcons([]); setDocuments([]);
    };

    const handleAddUnit = async () => {
        if (!model.trim()) {
            showToast("Please enter a model name.", "error");
            setActiveTab("model");
            return;
        }

        const compressorSpec = compressorList.find((s) => specLabel(s) === compressor);
        const evaporatorSpec = evaporatorList.find((s) => specLabel(s) === evaporator);
        const condenserSpec = condenserList.find((s) => specLabel(s) === condenser);
        const expansionValveSpec = expansionValveList.find((s) => specLabel(s) === expansionValve);
        const reversingValveSpec = reversingValveList.find((s) => specLabel(s) === reversingValve);
        const chassisItem = chassisList.find((c) => chassisLabel(c) === chasis);
        const refrigerantItem = refrigerantList.find((r) => refrigerantLabel(r) === refrigerant);

        if (!compressorSpec || !evaporatorSpec || !condenserSpec || !expansionValveSpec || !chassisItem || !refrigerantItem) {
            showToast("Please select compressor, evaporator, condenser, expansion valve, chassis and refrigerant.", "error");
            setActiveTab("model");
            return;
        }

        if (totalBytes() > MAX_TOTAL_BYTES) {
            showToast("Total upload can't exceed 25 MB.", "error");
            return;
        }

        const fd = new FormData();
        const append = (prefix: string, obj: Record<string, unknown>) => {
            Object.entries(obj).forEach(([k, v]) => fd.append(`${prefix}.${k}`, v === null || v === undefined ? "" : String(v)));
        };

        append("chillerDto", { model: model.trim(), type: unitType === "air_to_water" ? "AW" : "WW", mod: "COOLING" });
        append("unitTechSpecsDTO", {
            capacity: num(capacity),
            compressorSpecsId: compressorSpec.id,
            compressorQty: int(compressorQty),
            condenserSpecsId: condenserSpec.id,
            condenserQty: int(condenserQty),
            expansionValveSpecsId: expansionValveSpec.id,
            expansionValveQty: int(expansionValveQty),
            evaporatorSpecsId: evaporatorSpec.id,
            chassisId: chassisItem.id,
            fourWayReversingValveSpecsId: reversingValveSpec ? reversingValveSpec.id : null,
            refrigerantId: refrigerantItem.id,
            condenserRequiredDuty: num(condenserRequiredDuty),
            quietCondenserRequiredDuty: num(quietCondenserRequiredDuty),
            fanPI: num(fanPI),
            copErr: num(eer),
            width: num(width),
            length: num(length),
            height: num(height),
            numberOfFans: int(numberOfFans),
            fanDiameter: num(fanDiameter),
            airflowRate: num(airflowRate),
            dischargeLineDiameter,
            liquidLineDiameter,
            suctionLineDiameter,
            gasTank: num(gasTank),
        });
        append("unitDefCalcValuesDTO", {
            ambient: num(ambient), evapIn: num(evapIn), evapOut: num(evapOut), condIn: num(condIn), condOut: num(condOut),
        });

        const primary = images.find((u) => u.id === primaryId);
        if (primary) fd.append("chillerDto.primaryImage", primary.file);
        images.forEach((u) => { if (u.id !== primaryId) fd.append("chillerDto.images", u.file); });
        drawings.forEach((u) => fd.append("chillerDto.technicalImages", u.file));
        icons.forEach((u) => fd.append("chillerDto.icons", u.file));
        documents.forEach((u) => fd.append("chillerDto.documents", u.file));

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/addChiller`, { method: "POST", credentials: "include", body: fd });
            if (res.ok) {
                showToast("Chiller added successfully.", "success");
                resetForm();
                setActiveTab("model");
            } else {
                let msg = "Failed to add chiller.";
                try { const data = await res.json(); msg = data.message || data.error || msg; } catch { /* keep default */ }
                showToast(msg, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const compressorOptions = [SELECT.compressor, ...compressorList.map(specLabel)];
    const evaporatorOptions = [SELECT.evaporator, ...evaporatorList.map(specLabel)];
    const condenserOptions = [SELECT.condenser, ...condenserList.map(specLabel)];
    const expansionValveOptions = [SELECT.expansionValve, ...expansionValveList.map(specLabel)];
    const reversingValveOptions = [SELECT.reversingValve, ...reversingValveList.map(specLabel)];
    const chassisOptions = [SELECT.chassis, ...chassisList.map(chassisLabel)];
    const refrigerantOptions = [SELECT.refrigerant, ...refrigerantList.map(refrigerantLabel)];

    const dropZoneStyle = (key: string): React.CSSProperties => ({
        cursor: "pointer",
        minHeight: 110,
        transition: "background 0.15s, outline 0.15s",
        ...(dragOver === key ? { outline: "2px dashed #4caf50", outlineOffset: "-5px", background: "rgba(76,175,80,0.10)" } : {}),
    });
    const dropHandlers = (key: string, onFiles: (f: FileList | null) => void) => ({
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (dragOver !== key) setDragOver(key); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setDragOver(null); },
        onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragOver(null); onFiles(e.dataTransfer.files); },
    });

    return (
        <div className={styles.sectionsContainer}>
            {toastInfo && (
                <div className={toastInfo.type === "error" ? toastStyles.errorToast : toastStyles.toast}>
                    {toastInfo.message}
                </div>
            )}
            {lightbox && (
                <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, cursor: "zoom-out" }}>
                    <img src={lightbox} alt="preview" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }} />
                </div>
            )}
            <div className={styles.sectionContent}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'model' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('model')}>Model Information</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'tech' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('tech')}>Tech Details</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'calc' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('calc')}>Calculation Values</span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            {activeTab === 'model' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Model</label>
                                        <input type="text" className={styles.inputElement} placeholder="Enter model name" value={model} onChange={(e) => setModel(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Type</label>
                                        <Combobox options={["Air to water", "Water to water"]} value={unitType === "air_to_water" ? "Air to water" : "Water to water"} onChange={(val) => setUnitType(val === "Air to water" ? "air_to_water" : "water_to_water")} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Mod</label>
                                        <Combobox options={["Cooling"]} value="Cooling" onChange={() => {}} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Compressor</label>
                                        <Combobox options={compressorOptions} value={compressor} onChange={setCompressor} className={`${styles.comboBox} ${compressor.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Evaporator</label>
                                        <Combobox options={evaporatorOptions} value={evaporator} onChange={setEvaporator} className={`${styles.comboBox} ${evaporator.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Condenser</label>
                                        <Combobox options={condenserOptions} value={condenser} onChange={setCondenser} className={`${styles.comboBox} ${condenser.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Expansion Valve</label>
                                        <Combobox options={expansionValveOptions} value={expansionValve} onChange={setExpansionValve} className={`${styles.comboBox} ${expansionValve.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>4-way Reversing Valve</label>
                                        <Combobox options={reversingValveOptions} value={reversingValve} onChange={setReversingValve} className={`${styles.comboBox} ${reversingValve.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Chasis</label>
                                        <Combobox options={chassisOptions} value={chasis} onChange={setChasis} className={`${styles.comboBox} ${chasis.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Refrigerant</label>
                                        <Combobox options={refrigerantOptions} value={refrigerant} onChange={setRefrigerant} className={`${styles.comboBox} ${refrigerant.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tech' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}><label>Capacity (Kw)</label><input type="number" className={styles.inputElement} value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Compressor Qty</label><input type="number" className={styles.inputElement} value={compressorQty} onChange={(e) => setCompressorQty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Condenser Required Duty (kW)</label><input type="number" className={styles.inputElement} value={condenserRequiredDuty} onChange={(e) => setCondenserRequiredDuty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Quiet Condenser Required Duty (kW)</label><input type="number" className={styles.inputElement} value={quietCondenserRequiredDuty} onChange={(e) => setQuietCondenserRequiredDuty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Fan Power Input (kW)</label><input type="number" className={styles.inputElement} value={fanPI} onChange={(e) => setFanPI(e.target.value)} /></div>
                                    <div className={styles.formField}><label>EER</label><input type="number" className={styles.inputElement} value={eer} onChange={(e) => setEer(e.target.value)} disabled={unitMod === 'heating'} /></div>
                                    <div className={styles.formField}><label>COP</label><input type="number" className={styles.inputElement} disabled={unitMod === 'cooling'} /></div>
                                    <div className={styles.formField}><label>Condenser Qty</label><input type="number" className={styles.inputElement} value={condenserQty} onChange={(e) => setCondenserQty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Number of Fans</label><input type="number" className={styles.inputElement} value={numberOfFans} onChange={(e) => setNumberOfFans(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Fan Diameter</label><input type="number" className={styles.inputElement} value={fanDiameter} onChange={(e) => setFanDiameter(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Expansion Valve Qty</label><input type="number" className={styles.inputElement} value={expansionValveQty} onChange={(e) => setExpansionValveQty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Airflow Rate (m3/h)</label><input type="number" className={styles.inputElement} value={airflowRate} onChange={(e) => setAirflowRate(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Discharge Line Diameter</label><input type="number" className={styles.inputElement} value={dischargeLineDiameter} onChange={(e) => setDischargeLineDiameter(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Liquid Line Diameter</label><input type="number" className={styles.inputElement} value={liquidLineDiameter} onChange={(e) => setLiquidLineDiameter(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Suction Line Diameter</label><input type="number" className={styles.inputElement} value={suctionLineDiameter} onChange={(e) => setSuctionLineDiameter(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Gas Tank (L)</label><input type="number" className={styles.inputElement} value={gasTank} onChange={(e) => setGasTank(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Width</label><input type="number" className={styles.inputElement} value={width} onChange={(e) => setWidth(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Height</label><input type="number" className={styles.inputElement} value={height} onChange={(e) => setHeight(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Length</label><input type="number" className={styles.inputElement} value={length} onChange={(e) => setLength(e.target.value)} /></div>
                                </div>
                            )}

                            {activeTab === 'calc' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}><label>Ambient (°C)</label><input type="number" className={styles.inputElement} value={ambient} onChange={(e) => setAmbient(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Evaporator Inlet (°C)</label><input type="number" className={styles.inputElement} value={evapIn} onChange={(e) => setEvapIn(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Evaporator Outlet (°C)</label><input type="number" className={styles.inputElement} value={evapOut} onChange={(e) => setEvapOut(e.target.value)} /></div>
                                    <div className={styles.formField}><label>Condenser Inlet (°C)</label><input type="number" className={styles.inputElement} value={condIn} onChange={(e) => setCondIn(e.target.value)} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} /></div>
                                    <div className={styles.formField}><label>Condenser Outlet (°C)</label><input type="number" className={styles.inputElement} value={condOut} onChange={(e) => setCondOut(e.target.value)} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} /></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.seperator}></div>

                    <div className={styles.rightContent}>
                        <div className={styles.uploadSection}>
                            <div className={`${styles.uploadContainer} ${styles.imgContainer}`} style={dropZoneStyle("image")} onClick={() => imageInputRef.current?.click()} {...dropHandlers("image", onImageFiles)}>
                                Upload Image
                                <div className={styles.inputContainer}>
                                    <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { onImageFiles(e.target.files); e.target.value = ""; }} />
                                    <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Images" />
                                    <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Images" />
                                </div>
                            </div>
                            {images.length > 0 && (
                                <div style={{ margin: "6px 0 14px" }}>
                                    <div style={{ fontSize: "0.9rem", opacity: 0.85, marginBottom: 8 }}>Select one image as primary</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                                        {images.map((u) => (
                                            <div key={u.id} style={{ position: "relative" }}>
                                                <img src={u.url} alt="" onClick={() => setLightbox(u.url)} style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 8, cursor: "zoom-in", border: primaryId === u.id ? "2px solid #4caf50" : "1px solid #ccc" }} />
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); setPrimaryId(u.id); }}
                                                    title="Set as primary"
                                                    style={{ position: "absolute", top: 6, left: 6, width: 22, height: 22, borderRadius: "50%", border: "2px solid #fff", background: primaryId === u.id ? "#4caf50" : "rgba(0,0,0,0.4)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer", boxShadow: "0 0 3px rgba(0,0,0,0.5)" }}
                                                >
                                                    {primaryId === u.id ? "✓" : ""}
                                                </div>
                                                <button type="button" onClick={() => removeImage(u.id)} style={xBtnStyle}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={`${styles.drawingContainer} ${styles.uploadContainer}`} style={dropZoneStyle("drawing")} onClick={() => drawingInputRef.current?.click()} {...dropHandlers("drawing", onDrawingFiles)}>
                                Upload Drawing
                                <div className={styles.inputContainer}>
                                    <input ref={drawingInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { onDrawingFiles(e.target.files); e.target.value = ""; }} />
                                    <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Drawings" />
                                    <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Drawings" />
                                </div>
                            </div>
                            {drawings.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "6px 0 14px" }}>
                                    {drawings.map((u) => (
                                        <div key={u.id} style={{ position: "relative" }}>
                                            <img src={u.url} alt="" onClick={() => setLightbox(u.url)} style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 8, cursor: "zoom-in", border: "1px solid #ccc" }} />
                                            <button type="button" onClick={() => removeFrom(drawings, setDrawings)(u.id)} style={xBtnStyle}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={`${styles.docContainer} ${styles.uploadContainer}`} style={dropZoneStyle("document")} onClick={() => documentInputRef.current?.click()} {...dropHandlers("document", onDocumentFiles)}>
                                Upload File
                                <div className={styles.inputContainer}>
                                    <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" multiple style={{ display: "none" }} onChange={(e) => { onDocumentFiles(e.target.files); e.target.value = ""; }} />
                                    <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Documents" />
                                    <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Documents" />
                                </div>
                            </div>
                            {documents.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0 14px" }}>
                                    {documents.map((u) => (
                                        <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13 }}>
                                            <a href={u.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={u.file.name}>📄 {u.file.name}</a>
                                            <button type="button" onClick={() => removeFrom(documents, setDocuments)(u.id)} style={{ border: "none", background: "transparent", color: "#d9534f", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={`${styles.iconContainer} ${styles.uploadContainer}`} style={dropZoneStyle("icon")} onClick={() => iconInputRef.current?.click()} {...dropHandlers("icon", onIconFiles)}>
                                Upload Icon
                                <div className={styles.inputContainer}>
                                    <input ref={iconInputRef} type="file" accept="image/png, image/svg+xml, .ico" multiple style={{ display: "none" }} onChange={(e) => { onIconFiles(e.target.files); e.target.value = ""; }} />
                                    <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Icons" />
                                    <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Icons" />
                                </div>
                            </div>
                            {icons.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "6px 0 14px" }}>
                                    {icons.map((u) => (
                                        <div key={u.id} style={{ position: "relative" }}>
                                            <img src={u.url} alt="" onClick={() => setLightbox(u.url)} style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 4, cursor: "zoom-in", border: "1px solid #ddd", padding: 2, background: "#fff" }} />
                                            <button type="button" onClick={() => removeFrom(icons, setIcons)(u.id)} style={{ ...xBtnStyle, width: 16, height: 16, top: -6, right: -6, fontSize: 11 }}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={styles.stepNavContainer}>
                            <div className={styles.stepNavLeft}>
                                {activeTab !== 'model' && (
                                    <button className={styles.stepBtn} onClick={() => setActiveTab(activeTab === 'calc' ? 'tech' : 'model')}>Previous</button>
                                )}
                                {activeTab !== 'calc' && (
                                    <button className={styles.stepBtn} onClick={() => setActiveTab(activeTab === 'model' ? 'tech' : 'calc')}>Next</button>
                                )}
                            </div>
                            {activeTab === 'calc' && (
                                <div className={styles.stepNavRight}>
                                    <button className={styles.saveBtn} onClick={handleAddUnit} disabled={submitting}>
                                        {submitting ? 'Adding...' : 'Add Unit'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
