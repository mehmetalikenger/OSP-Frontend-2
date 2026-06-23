"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import styles from "../addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { uploadUnitAssets } from "../../../../../../lib/assetUpload";

const API = process.env.NEXT_PUBLIC_API_URL;

type ComponentSpecs = { id: number; brand?: string | null; model: string; capacity: number };
type CompressorSpecs = { id: number; brand?: string | null; model: string; type?: string | null; capacity: number; powerInput: number };
type Chassis = { id: number; brand?: string | null; model: string };
type Refrigerant = { id: number; name: string; code: string };

type Upload = { file: File; url: string; id: string };
let uidCounter = 0;
const uid = () => `u${Date.now()}_${uidCounter++}`;
const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

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

const specLabel = (s: ComponentSpecs) => `${s.model} / C: ${s.capacity}`;
const compressorLabel = (s: CompressorSpecs) => `${[s.brand, s.model, s.type].filter(Boolean).join(" / ")} / C: ${s.capacity} / PI: ${s.powerInput}`;
const chassisLabel = (c: Chassis) => c.model;
const refrigerantLabel = (r: Refrigerant) => `${r.name} / ${r.code}`;


export default function Page() {
    const t = useTranslations("AdminUnit");
    const display = (v: string): string => (({
      "Select Compressor": t("selectCompressor"),
      "Select Evaporator": t("selectEvaporator"),
      "Select Condenser": t("selectCondenser"),
      "Select Expansion Valve": t("selectExpansionValve"),
      "Select Reversing Valve": t("selectReversingValve"),
      "Select Chasis": t("selectChasis"),
      "Select Refrigerant": t("selectRefrigerant"),
      "Air to water": t("airToWater"),
      "Water to water": t("waterToWater"),
      "Cooling": t("cooling"),
    } as Record<string, string>)[v] ?? v);
    const [activeTab, setActiveTab] = useState("model");
    const [unitType, setUnitType] = useState("air_to_water");
    const [unitMod] = useState("cooling");

    const [model, setModel] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [compressor, setCompressor] = useState(SELECT.compressor);
    const [evaporator, setEvaporator] = useState(SELECT.evaporator);
    const [condenser, setCondenser] = useState(SELECT.condenser);
    const [expansionValve, setExpansionValve] = useState(SELECT.expansionValve);
    const [reversingValve, setReversingValve] = useState(SELECT.reversingValve);
    const [chasis, setChasis] = useState(SELECT.chassis);
    const [refrigerant, setRefrigerant] = useState(SELECT.refrigerant);

    const [compressorList, setCompressorList] = useState<CompressorSpecs[]>([]);
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
    const [maxCapacity, setMaxCapacity] = useState("");
    const [compressorQty, setCompressorQty] = useState("");
    const [condenserRequiredDuty, setCondenserRequiredDuty] = useState("");
    const [quietCondenserRequiredDuty, setQuietCondenserRequiredDuty] = useState("");
    const [fanPI, setFanPI] = useState("");
    const [eer, setEer] = useState("");
    const [condenserQty, setCondenserQty] = useState("");
    const [fanType, setFanType] = useState("EC");
    const [numberOfFans, setNumberOfFans] = useState("");
    const [fanDiameter, setFanDiameter] = useState("");
    const [expansionValveQty, setExpansionValveQty] = useState("");
    const [airflowRate, setAirflowRate] = useState("");
    const [dischargeLineDiameter, setDischargeLineDiameter] = useState("");
    const [liquidLineDiameter, setLiquidLineDiameter] = useState("");
    const [suctionLineDiameter, setSuctionLineDiameter] = useState("");
    const [gasTank, setGasTank] = useState("");
    const [waterInletConnection, setWaterInletConnection] = useState("");
    const [waterOutletConnection, setWaterOutletConnection] = useState("");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [length, setLength] = useState("");

    // Working envelope (safe-area bounds for the report's Working Limit graph)
    const [minWaterInlet, setMinWaterInlet] = useState("");
    const [maxWaterInlet, setMaxWaterInlet] = useState("");
    const [minWaterOutlet, setMinWaterOutlet] = useState("");
    const [maxWaterOutlet, setMaxWaterOutlet] = useState("");
    const [minAmbient, setMinAmbient] = useState("");
    const [maxAmbient, setMaxAmbient] = useState("");

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
    const topRef = useRef<HTMLDivElement>(null);
    const scrollToFormTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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
    const blockNeg = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); };

    const totalBytes = (extra: File[] = []) =>
        [...images, ...drawings, ...icons, ...documents].reduce((sum, u) => sum + u.file.size, 0) +
        extra.reduce((sum, f) => sum + f.size, 0);

    const toUploads = (files: FileList | null): Upload[] => {
        if (!files?.length) return [];
        const arr = Array.from(files);
        if (totalBytes(arr) > MAX_TOTAL_BYTES) {
            showToast(t("uploadTooLarge"), "error");
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
        setCapacity(""); setMaxCapacity(""); setCompressorQty(""); setCondenserRequiredDuty(""); setQuietCondenserRequiredDuty("");
        setFanPI(""); setEer(""); setCondenserQty(""); setFanType("EC"); setNumberOfFans(""); setFanDiameter("");
        setExpansionValveQty(""); setAirflowRate(""); setDischargeLineDiameter(""); setLiquidLineDiameter("");
        setSuctionLineDiameter(""); setGasTank(""); setWaterInletConnection(""); setWaterOutletConnection(""); setWidth(""); setHeight(""); setLength("");
        setMinWaterInlet(""); setMaxWaterInlet(""); setMinWaterOutlet(""); setMaxWaterOutlet(""); setMinAmbient(""); setMaxAmbient("");
        [...images, ...drawings, ...icons, ...documents].forEach((u) => URL.revokeObjectURL(u.url));
        setImages([]); setPrimaryId(null); setDrawings([]); setIcons([]); setDocuments([]);
    };

    const handleAddUnit = async () => {
        if (!model.trim()) {
            showToast(t("pleaseEnterModelName"), "error");
            setActiveTab("model");
            return;
        }

        const compressorSpec = compressorList.find((s) => compressorLabel(s) === compressor);
        const evaporatorSpec = evaporatorList.find((s) => specLabel(s) === evaporator);
        const condenserSpec = condenserList.find((s) => specLabel(s) === condenser);
        const expansionValveSpec = expansionValveList.find((s) => specLabel(s) === expansionValve);
        const reversingValveSpec = reversingValveList.find((s) => specLabel(s) === reversingValve);
        const chassisItem = chassisList.find((c) => chassisLabel(c) === chasis);
        const refrigerantItem = refrigerantList.find((r) => refrigerantLabel(r) === refrigerant);

        if (!compressorSpec || !evaporatorSpec || !condenserSpec || !expansionValveSpec || !chassisItem || !refrigerantItem) {
            showToast(t("selectAllComponents"), "error");
            setActiveTab("model");
            return;
        }

        if (totalBytes() > MAX_TOTAL_BYTES) {
            showToast(t("uploadTooLarge"), "error");
            return;
        }

        const payload = {
            chillerDto: { model: model.trim(), name: name.trim(), description: description.trim(), type: unitType === "air_to_water" ? "AW" : "WW", mod: "COOLING" },
            unitTechSpecsDTO: {
                capacity: num(capacity),
                maxCapacity: num(maxCapacity),
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
                fanType,
                numberOfFans: int(numberOfFans),
                fanDiameter: num(fanDiameter),
                airflowRate: num(airflowRate),
                dischargeLineDiameter,
                liquidLineDiameter,
                suctionLineDiameter,
                gasTank: num(gasTank),
                waterInletConnection,
                waterOutletConnection,
                minWaterInlet: num(minWaterInlet),
                maxWaterInlet: num(maxWaterInlet),
                minWaterOutlet: num(minWaterOutlet),
                maxWaterOutlet: num(maxWaterOutlet),
                minAmbient: num(minAmbient),
                maxAmbient: num(maxAmbient),
            },
            unitDefCalcValuesDTO: {
                ambient: num(ambient), evapIn: num(evapIn), evapOut: num(evapOut), condIn: num(condIn), condOut: num(condOut),
            },
        };

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/addChiller`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload),
            });
            if (res.ok) {
                const unitId: number = await res.json();
                try {
                    await uploadAssets(unitId);
                    showToast(t("chillerAdded"), "success");
                } catch (uploadErr) {
                    console.error("Asset upload failed", uploadErr);
                    showToast(uploadErr instanceof Error ? uploadErr.message : t("chillerUploadFailed"), "error");
                }
                resetForm();
                setActiveTab("model");
            } else {
                let msg = t("failedAddChiller");
                try { const data = await res.json(); msg = data.message || data.error || msg; } catch { /* keep default */ }
                showToast(msg, "error");
            }
        } catch (e) {
            console.error(e);
            showToast(t("networkError"), "error");
        } finally {
            setSubmitting(false);
        }
    };

    // Uploads the selected files directly to R2 via presigned URLs (see lib/assetUpload).
    const uploadAssets = async (unitId: number) => {
        const primary = images.find((u) => u.id === primaryId);
        await uploadUnitAssets(unitId, {
            images: images.map((u) => u.file),
            primaryImage: primary?.file ?? null,
            drawings: drawings.map((u) => u.file),
            icons: icons.map((u) => u.file),
            documents: documents.map((u) => u.file),
        });
    };

    const compressorOptions = [SELECT.compressor, ...compressorList.map(compressorLabel)];
    const evaporatorOptions = [SELECT.evaporator, ...evaporatorList.map(specLabel)];
    const condenserOptions = [SELECT.condenser, ...condenserList.map(specLabel)];
    const expansionValveOptions = [SELECT.expansionValve, ...expansionValveList.map(specLabel)];
    const reversingValveOptions = [SELECT.reversingValve, ...reversingValveList.map(specLabel)];
    const chassisOptions = [SELECT.chassis, ...chassisList.map(chassisLabel)];
    const refrigerantOptions = [SELECT.refrigerant, ...refrigerantList.map(refrigerantLabel)];

    const dropHandlers = (key: string, onFiles: (f: FileList | null) => void) => ({
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (dragOver !== key) setDragOver(key); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setDragOver(null); },
        onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragOver(null); onFiles(e.dataTransfer.files); },
    });

    const modelComplete =
        model.trim() !== "" &&
        compressor !== SELECT.compressor && evaporator !== SELECT.evaporator &&
        condenser !== SELECT.condenser && expansionValve !== SELECT.expansionValve &&
        chasis !== SELECT.chassis && refrigerant !== SELECT.refrigerant;

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
            <div className={styles.sectionContent} ref={topRef}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'model' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('model')}>{t("modelInfo")}</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'tech' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('tech')}>{t("techDetails")}</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'calc' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('calc')}>{t("calcValues")}</span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            {activeTab === 'model' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("model")}</label>
                                        <input type="text" className={styles.inputElement} placeholder={t("enterModelName")} value={model} onChange={(e) => setModel(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("name")}</label>
                                        <input type="text" className={styles.inputElement} placeholder={t("enterDisplayName")} value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className={`${styles.formField} ${styles.formFieldFullWidth}`}>
                                        <label>{t("description")}</label>
                                        <textarea className={styles.inputElement} placeholder={t("enterUnitDescription")} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("type")}</label>
                                        <Combobox options={["Air to water", "Water to water"]} value={unitType === "air_to_water" ? "Air to water" : "Water to water"} onChange={(val) => setUnitType(val === "Air to water" ? "air_to_water" : "water_to_water")} getLabel={display} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("mod")}</label>
                                        <Combobox options={["Cooling"]} value="Cooling" onChange={() => {}} getLabel={display} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("compressor")}</label>
                                        <Combobox options={compressorOptions} value={compressor} onChange={setCompressor} getLabel={display} className={`${styles.comboBox} ${compressor.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("evaporator")}</label>
                                        <Combobox options={evaporatorOptions} value={evaporator} onChange={setEvaporator} getLabel={display} className={`${styles.comboBox} ${evaporator.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("condenser")}</label>
                                        <Combobox options={condenserOptions} value={condenser} onChange={setCondenser} getLabel={display} className={`${styles.comboBox} ${condenser.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("expansionValve")}</label>
                                        <Combobox options={expansionValveOptions} value={expansionValve} onChange={setExpansionValve} getLabel={display} className={`${styles.comboBox} ${expansionValve.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("reversingValve")}</label>
                                        <Combobox options={reversingValveOptions} value={reversingValve} onChange={setReversingValve} getLabel={display} className={`${styles.comboBox} ${reversingValve.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("chasis")}</label>
                                        <Combobox options={chassisOptions} value={chasis} onChange={setChasis} getLabel={display} className={`${styles.comboBox} ${chasis.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("refrigerant")}</label>
                                        <Combobox options={refrigerantOptions} value={refrigerant} onChange={setRefrigerant} getLabel={display} className={`${styles.comboBox} ${refrigerant.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tech' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}><label>{t("capacityKw")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("maxCapacityKw")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("compressorQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={compressorQty} onChange={(e) => setCompressorQty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("condenserRequiredDuty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={condenserRequiredDuty} onChange={(e) => setCondenserRequiredDuty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("quietCondenserRequiredDuty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={quietCondenserRequiredDuty} onChange={(e) => setQuietCondenserRequiredDuty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("fanPowerInput")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={fanPI} onChange={(e) => setFanPI(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("eer")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={eer} onChange={(e) => setEer(e.target.value)} disabled={unitMod === 'heating'} /></div>
                                    <div className={styles.formField}><label>{t("cop")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} disabled={unitMod === 'cooling'} /></div>
                                    <div className={styles.formField}><label>{t("condenserQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={condenserQty} onChange={(e) => setCondenserQty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("fanType")}</label><Combobox options={["EC"]} value={fanType} onChange={setFanType} getLabel={display} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("fanQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={numberOfFans} onChange={(e) => setNumberOfFans(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("fanDiameter")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={fanDiameter} onChange={(e) => setFanDiameter(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("airflowRate")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={airflowRate} onChange={(e) => setAirflowRate(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("expansionValveQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={expansionValveQty} onChange={(e) => setExpansionValveQty(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("dischargeLineDiameter")}</label><input type="text" className={styles.inputElement} value={dischargeLineDiameter} onChange={(e) => setDischargeLineDiameter(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("liquidLineDiameter")}</label><input type="text" className={styles.inputElement} value={liquidLineDiameter} onChange={(e) => setLiquidLineDiameter(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("suctionLineDiameter")}</label><input type="text" className={styles.inputElement} value={suctionLineDiameter} onChange={(e) => setSuctionLineDiameter(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("gasTank")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={gasTank} onChange={(e) => setGasTank(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("waterInletConnection")}</label><input type="text" className={styles.inputElement} value={waterInletConnection} onChange={(e) => setWaterInletConnection(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("waterOutletConnection")}</label><input type="text" className={styles.inputElement} value={waterOutletConnection} onChange={(e) => setWaterOutletConnection(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("width")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={width} onChange={(e) => setWidth(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("length")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={length} onChange={(e) => setLength(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("height")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={height} onChange={(e) => setHeight(e.target.value)} /></div>
                                </div>
                            )}

                            {activeTab === 'calc' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}><label>{t("ambient")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={ambient} onChange={(e) => setAmbient(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("evapInlet")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={evapIn} onChange={(e) => setEvapIn(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("evapOutlet")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={evapOut} onChange={(e) => setEvapOut(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("condInlet")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={condIn} onChange={(e) => setCondIn(e.target.value)} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} /></div>
                                    <div className={styles.formField}><label>{t("condOutlet")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={condOut} onChange={(e) => setCondOut(e.target.value)} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} /></div>
                                    <div className={styles.formField}><label>{t("minWaterInlet")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={minWaterInlet} onChange={(e) => setMinWaterInlet(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("maxWaterInlet")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={maxWaterInlet} onChange={(e) => setMaxWaterInlet(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("minWaterOutlet")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={minWaterOutlet} onChange={(e) => setMinWaterOutlet(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("maxWaterOutlet")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={maxWaterOutlet} onChange={(e) => setMaxWaterOutlet(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("minAmbient")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={minAmbient} onChange={(e) => setMinAmbient(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("maxAmbient")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={maxAmbient} onChange={(e) => setMaxAmbient(e.target.value)} /></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.seperator}></div>

                    <div className={styles.rightContent}>
                        <div className={styles.uploadSection}>

                            {/* Total size bar */}
                            <div className={styles.sizeBar}>
                                <span className={styles.sizeBarLabel}>{t("storage")}</span>
                                <div className={styles.sizeBarTrack}>
                                    <div
                                        className={`${styles.sizeBarFill}${totalBytes() > MAX_TOTAL_BYTES * 0.9 ? ` ${styles.sizeBarFillDanger}` : totalBytes() > MAX_TOTAL_BYTES * 0.7 ? ` ${styles.sizeBarFillWarn}` : ""}`}
                                        style={{ width: `${Math.min(100, (totalBytes() / MAX_TOTAL_BYTES) * 100)}%` }}
                                    />
                                </div>
                                <span className={styles.sizeBarValue}>{formatBytes(totalBytes())} / 25 MB</span>
                            </div>

                            {/* Images */}
                            <div className={styles.uploadCard}>
                                <div className={styles.uploadCardHeader}>
                                    <div className={styles.uploadCardTitle}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                        {t("images")}
                                    </div>
                                    {images.length > 0 && <span className={styles.uploadBadge}>{images.length}</span>}
                                </div>
                                <div
                                    className={`${styles.dropZone}${dragOver === "image" ? ` ${styles.dropZoneActive}` : ""}`}
                                    onClick={() => imageInputRef.current?.click()}
                                    {...dropHandlers("image", onImageFiles)}
                                >
                                    <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { onImageFiles(e.target.files); e.target.value = ""; }} />
                                    <div className={styles.dropZoneInner}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        <span className={styles.dropZoneText}>{t("dropImages")}</span>
                                        <span className={styles.dropZoneHint}>{t("hintImages")}</span>
                                    </div>
                                </div>
                                {images.length > 0 && (
                                    <>
                                        <span className={styles.uploadGridHint}>{t("primaryHint")}</span>
                                        <div className={styles.imageGrid}>
                                            {images.map((u) => (
                                                <div key={u.id} className={`${styles.imageTile}${primaryId === u.id ? ` ${styles.imageTilePrimary}` : ""}`}>
                                                    <img src={u.url} alt="" className={styles.imageTileImg} onClick={() => setLightbox(u.url)} />
                                                    {primaryId === u.id && <span className={styles.primaryRing}>{t("primary")}</span>}
                                                    <button type="button" className={`${styles.starBtn}${primaryId === u.id ? ` ${styles.starBtnActive}` : ""}`} title={t("setAsPrimary")} onClick={(e) => { e.stopPropagation(); setPrimaryId(u.id); }}>
                                                        {primaryId === u.id ? "★" : "☆"}
                                                    </button>
                                                    <button type="button" className={styles.removeTileBtn} onClick={() => removeImage(u.id)}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Technical Drawings */}
                            <div className={styles.uploadCard}>
                                <div className={styles.uploadCardHeader}>
                                    <div className={styles.uploadCardTitle}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                        {t("technicalDrawings")}
                                    </div>
                                    {drawings.length > 0 && <span className={styles.uploadBadge}>{drawings.length}</span>}
                                </div>
                                <div
                                    className={`${styles.dropZone}${dragOver === "drawing" ? ` ${styles.dropZoneActive}` : ""}`}
                                    onClick={() => drawingInputRef.current?.click()}
                                    {...dropHandlers("drawing", onDrawingFiles)}
                                >
                                    <input ref={drawingInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { onDrawingFiles(e.target.files); e.target.value = ""; }} />
                                    <div className={styles.dropZoneInner}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        <span className={styles.dropZoneText}>{t("dropDrawings")}</span>
                                        <span className={styles.dropZoneHint}>{t("hintDrawings")}</span>
                                    </div>
                                </div>
                                {drawings.length > 0 && (
                                    <div className={styles.imageGrid}>
                                        {drawings.map((u) => (
                                            <div key={u.id} className={styles.imageTile}>
                                                <img src={u.url} alt="" className={styles.imageTileImg} onClick={() => setLightbox(u.url)} />
                                                <button type="button" className={styles.removeTileBtn} onClick={() => removeFrom(drawings, setDrawings)(u.id)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Documents */}
                            <div className={styles.uploadCard}>
                                <div className={styles.uploadCardHeader}>
                                    <div className={styles.uploadCardTitle}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        {t("documents")}
                                    </div>
                                    {documents.length > 0 && <span className={styles.uploadBadge}>{documents.length}</span>}
                                </div>
                                <div
                                    className={`${styles.dropZone}${dragOver === "document" ? ` ${styles.dropZoneActive}` : ""}`}
                                    onClick={() => documentInputRef.current?.click()}
                                    {...dropHandlers("document", onDocumentFiles)}
                                >
                                    <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" multiple style={{ display: "none" }} onChange={(e) => { onDocumentFiles(e.target.files); e.target.value = ""; }} />
                                    <div className={styles.dropZoneInner}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        <span className={styles.dropZoneText}>{t("dropFiles")}</span>
                                        <span className={styles.dropZoneHint}>{t("hintDocuments")}</span>
                                    </div>
                                </div>
                                {documents.length > 0 && (
                                    <div className={styles.docList}>
                                        {documents.map((u) => {
                                            const ext = u.file.name.split(".").pop() ?? "file";
                                            return (
                                                <div key={u.id} className={styles.docItem}>
                                                    <div className={styles.docExt}>{ext.slice(0, 4)}</div>
                                                    <a href={u.url} target="_blank" rel="noopener noreferrer" className={styles.docName} title={u.file.name}>{u.file.name}</a>
                                                    <span className={styles.docSize}>{formatBytes(u.file.size)}</span>
                                                    <button type="button" className={styles.docRemoveBtn} onClick={() => removeFrom(documents, setDocuments)(u.id)}>×</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Icons */}
                            <div className={styles.uploadCard}>
                                <div className={styles.uploadCardHeader}>
                                    <div className={styles.uploadCardTitle}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                        {t("icons")}
                                    </div>
                                    {icons.length > 0 && <span className={styles.uploadBadge}>{icons.length}</span>}
                                </div>
                                <div
                                    className={`${styles.dropZone}${dragOver === "icon" ? ` ${styles.dropZoneActive}` : ""}`}
                                    onClick={() => iconInputRef.current?.click()}
                                    {...dropHandlers("icon", onIconFiles)}
                                >
                                    <input ref={iconInputRef} type="file" accept="image/png, image/svg+xml, .ico" multiple style={{ display: "none" }} onChange={(e) => { onIconFiles(e.target.files); e.target.value = ""; }} />
                                    <div className={styles.dropZoneInner}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        <span className={styles.dropZoneText}>{t("dropIcons")}</span>
                                        <span className={styles.dropZoneHint}>{t("hintIcons")}</span>
                                    </div>
                                </div>
                                {icons.length > 0 && (
                                    <div className={styles.iconGrid}>
                                        {icons.map((u) => (
                                            <div key={u.id} className={styles.iconTile}>
                                                <img src={u.url} alt="" className={styles.iconTileImg} onClick={() => setLightbox(u.url)} />
                                                <button type="button" className={styles.removeTileBtn} onClick={() => removeFrom(icons, setIcons)(u.id)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                        <div className={styles.stepNavContainer}>
                            <div className={styles.stepNavLeft}>
                                {activeTab !== 'model' && (
                                    <button className={styles.stepBtn} onClick={() => setActiveTab(activeTab === 'calc' ? 'tech' : 'model')}>{t("previous")}</button>
                                )}
                                {activeTab !== 'calc' && (
                                    <button className={styles.stepBtn} disabled={activeTab === 'model' && !modelComplete} onClick={() => { setActiveTab(activeTab === 'model' ? 'tech' : 'calc'); scrollToFormTop(); }}>{t("next")}</button>
                                )}
                            </div>
                            {activeTab === 'calc' && (
                                <div className={styles.stepNavRight}>
                                    <button className={styles.saveBtn} onClick={handleAddUnit} disabled={submitting}>
                                        {submitting ? t("adding") : t("addUnit")}
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
