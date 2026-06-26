"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { uploadUnitAssets } from "../../../../../../lib/assetUpload";
import { useConfirm } from "../../useConfirm";

const API = process.env.NEXT_PUBLIC_API_URL;

type Chassis = { id: number; brand?: string | null; model: string };
// Flat compressor catalog row: one entry per refrigerant + brand + kind + model combination.
type CompressorCatalogEntry = { ratingId: number; refrigerant: string; brand: string; kind: string; model: string };
type HeatPumpSummary = { id: number; model: string; type: string; mods: string[] };

// Distinct + alphabetically sorted helper used to build the cascade option lists.
const distinct = (arr: string[]) => Array.from(new Set(arr)).sort();
// Friendly labels for the compressor-kind codes; the raw code stays the option value.
const KIND_LABELS: Record<string, string> = { RC: "Reciprocating", SC: "Scroll", SCR: "Screw", ISCR: "Inverter" };

type Upload = {
    file?: File;
    url: string;
    id: string;
    serverId?: number;
    name?: string;
};

let uidCounter = 0;
const uid = () => `u${Date.now()}_${uidCounter++}`;
const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;

const nameFromUrl = (url: string) => {
    const seg = decodeURIComponent(url.split('/').pop() ?? 'file');
    const dash = seg.indexOf('-');
    return dash > 0 ? seg.slice(dash + 1) : seg;
};

const fromServerAsset = (a: { id: number; url: string }) => ({
    url: a.url, id: uid(), serverId: a.id, name: nameFromUrl(a.url),
} as Upload);

const HP_SELECT = "Select Heat Pump";
const CHASSIS_SELECT = "Select Chasis";
const REFRIGERANT_SELECT = "Select Refrigerant";
const BRAND_SELECT = "Select Brand";
const KIND_SELECT = "Select Type";
const COMPRESSOR_SELECT = "Select Compressor";
const chassisLabel = (c: Chassis) => c.model;
const heatPumpLabel = (h: HeatPumpSummary) => `${h.model} (${h.type})`;
const str = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

export default function EditHeatPumpModelPage() {
    const t = useTranslations("AdminUnit");
    const display = (label: string) => {
        switch (label) {
            case HP_SELECT: return t("selectHeatPump");
            case CHASSIS_SELECT: return t("selectChasis");
            case REFRIGERANT_SELECT: return t("selectRefrigerant");
            case BRAND_SELECT: return t("selectBrand");
            case KIND_SELECT: return t("selectCompressorKind");
            case COMPRESSOR_SELECT: return t("selectCompressor");
            case "Air to water": return t("airToWater");
            case "Water to water": return t("waterToWater");
            default: return label;
        }
    };
    // Compressor-kind options carry the raw code as value but show a friendly label.
    const displayKind = (v: string): string => KIND_LABELS[v] ?? display(v);
    const [heatPumps, setHeatPumps] = useState<HeatPumpSummary[]>([]);
    const [selectedHeatPumpId, setSelectedHeatPumpId] = useState<number | null>(null);

    const [unitType, setUnitType] = useState("air_to_water");
    const [model, setModel] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [chassisList, setChassisList] = useState<Chassis[]>([]);
    const [chassisId, setChassisId] = useState<number | null>(null);

    // Compressor cascade (Refrigerant -> Brand -> Kind -> Compressor model -> ratingId)
    const [compressorCatalog, setCompressorCatalog] = useState<CompressorCatalogEntry[]>([]);
    const [refrigerant, setRefrigerant] = useState(REFRIGERANT_SELECT);
    const [brand, setBrand] = useState(BRAND_SELECT);
    const [kind, setKind] = useState(KIND_SELECT);
    const [compressorModel, setCompressorModel] = useState(COMPRESSOR_SELECT);
    const [compressorRatingId, setCompressorRatingId] = useState<number | null>(null);

    const [fanType, setFanType] = useState("EC");
    const [waterInletConnection, setWaterInletConnection] = useState("");
    const [waterOutletConnection, setWaterOutletConnection] = useState("");

    const [f, setF] = useState({
        compressorQty: "", condenserQty: "", expansionValveQty: "",
        fanPI: "", width: "", length: "", height: "",
        numberOfFans: "", fanDiameter: "", airflowRate: "",
        dischargeLineDiameter: "", liquidLineDiameter: "", suctionLineDiameter: "", gasTank: "",
    });
    const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setF((prev) => ({ ...prev, [k]: e.target.value }));

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

    const { confirm, confirmElement } = useConfirm();

    const totalBytes = (extra: File[] = []) =>
        [...images, ...drawings, ...icons, ...documents].reduce((sum, u) => sum + (u.file?.size ?? 0), 0) +
        extra.reduce((sum, f) => sum + f.size, 0);

    const toUploads = (files: FileList | null): Upload[] => {
        if (!files?.length) return [];
        const arr = Array.from(files);
        if (totalBytes(arr) > MAX_TOTAL_BYTES) { showToast(t("uploadTooLarge"), "error"); return []; }
        return arr.map((file) => ({ file, url: URL.createObjectURL(file), id: uid() }));
    };

    const onImageFiles = (files: FileList | null) => {
        const next = toUploads(files);
        if (!next.length) return;
        setImages((prev) => [...prev, ...next]);
        setPrimaryId((cur) => cur ?? next[0].id);
    };
    const onDrawingFiles = (files: FileList | null) => { const next = toUploads(files); if (next.length) setDrawings((p) => [...p, ...next]); };
    const onIconFiles = (files: FileList | null) => { const next = toUploads(files); if (next.length) setIcons((p) => [...p, ...next]); };
    const onDocumentFiles = (files: FileList | null) => { const next = toUploads(files); if (next.length) setDocuments((p) => [...p, ...next]); };

    const deleteServerAsset = async (serverId: number) => {
        try { await fetchWithAuth(`${API}/admin/unit/asset/${serverId}`, { method: "DELETE", credentials: "include" }); }
        catch (e) { console.error("Failed to delete asset", e); }
    };

    const removeImage = async (id: string) => {
        const item = images.find((u) => u.id === id);
        if (!item) return;
        if (item.file) URL.revokeObjectURL(item.url);
        if (item.serverId) await deleteServerAsset(item.serverId);
        const remaining = images.filter((u) => u.id !== id);
        setImages(remaining);
        if (primaryId === id) setPrimaryId(remaining[0]?.id ?? null);
    };

    const removeFrom = (list: Upload[], setter: React.Dispatch<React.SetStateAction<Upload[]>>) => async (id: string) => {
        const item = list.find((u) => u.id === id);
        if (!item) return;
        if (item.file) URL.revokeObjectURL(item.url);
        if (item.serverId) await deleteServerAsset(item.serverId);
        setter(list.filter((u) => u.id !== id));
    };

    const handleSetPrimary = async (id: string) => {
        setPrimaryId(id);
        const item = images.find((u) => u.id === id);
        if (item?.serverId) {
            try { await fetchWithAuth(`${API}/admin/unit/asset/${item.serverId}/primary`, { method: "PUT", credentials: "include" }); }
            catch (e) { console.error("Failed to set primary", e); }
        }
    };

    const dropHandlers = (key: string, onFiles: (f: FileList | null) => void) => ({
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (dragOver !== key) setDragOver(key); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setDragOver(null); },
        onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragOver(null); onFiles(e.dataTransfer.files); },
    });

    const clearUploads = () => {
        [...images, ...drawings, ...icons, ...documents].forEach((u) => { if (u.file) URL.revokeObjectURL(u.url); });
        setImages([]); setPrimaryId(null); setDrawings([]); setIcons([]); setDocuments([]);
    };

    const loadHeatPumps = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pumps`, { credentials: "include", cache: "no-store" });
            if (res.ok) setHeatPumps(await res.json());
        } catch (e) { console.error("Failed to load heat pumps", e); }
    };

    useEffect(() => {
        const load = async (path: string, setter: (d: any) => void) => {
            try {
                const res = await fetchWithAuth(`${API}${path}`, { credentials: "include", cache: "no-store" });
                if (res.ok) setter(await res.json());
            } catch (e) { console.error(`Failed to load ${path}`, e); }
        };
        load("/admin/component/chassis", setChassisList);
        load("/admin/component/compressor-catalog", setCompressorCatalog);
        loadHeatPumps();
    }, []);

    const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const int = (v: string) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };
    const blockNeg = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); };

    const emptyF = {
        compressorQty: "", condenserQty: "", expansionValveQty: "",
        fanPI: "", width: "", length: "", height: "",
        numberOfFans: "", fanDiameter: "", airflowRate: "",
        dischargeLineDiameter: "", liquidLineDiameter: "", suctionLineDiameter: "", gasTank: "",
    };

    const clearForm = () => { setModel(""); setName(""); setDescription(""); setUnitType("air_to_water"); setChassisId(null); setRefrigerant(REFRIGERANT_SELECT); setBrand(BRAND_SELECT); setKind(KIND_SELECT); setCompressorModel(COMPRESSOR_SELECT); setCompressorRatingId(null); setFanType("EC"); setWaterInletConnection(""); setWaterOutletConnection(""); setF(emptyF); };

    const loadHeatPump = async (id: number) => {
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pump/${id}`, { credentials: "include", cache: "no-store" });
            if (!res.ok) { showToast(t("failedLoadHeatPump"), "error"); return; }
            const d = await res.json();
            setModel(d.model ?? "");
            setName(d.name ?? "");
            setDescription(d.description ?? "");
            setUnitType(d.type === "WW" ? "water_to_water" : "air_to_water");
            setChassisId(d.chassisId ?? null);
            setCompressorRatingId(d.compressorRatingId ?? null);
            // Reset the cascade to placeholders; the four dropdowns render-derive from
            // compressorRatingId until the admin touches the picker.
            setRefrigerant(REFRIGERANT_SELECT); setBrand(BRAND_SELECT); setKind(KIND_SELECT);
            setCompressorModel(COMPRESSOR_SELECT);
            setFanType(d.fanType || "EC");
            setWaterInletConnection(d.waterInletConnection || "");
            setWaterOutletConnection(d.waterOutletConnection || "");
            setF({
                compressorQty: str(d.compressorQty), condenserQty: str(d.condenserQty),
                expansionValveQty: str(d.expansionValveQty), fanPI: str(d.fanPI),
                width: str(d.width), length: str(d.length), height: str(d.height),
                numberOfFans: str(d.numberOfFans), fanDiameter: str(d.fanDiameter),
                airflowRate: str(d.airflowRate), dischargeLineDiameter: d.dischargeLineDiameter ?? "",
                liquidLineDiameter: d.liquidLineDiameter ?? "", suctionLineDiameter: d.suctionLineDiameter ?? "",
                gasTank: str(d.gasTank),
            });

            const assets: { id: number; url: string; assetType: string; isPrimary: boolean }[] = d.assets ?? [];
            const imgs = assets.filter(a => a.assetType === "IMAGE").map(fromServerAsset);
            setImages(imgs);
            setDrawings(assets.filter(a => a.assetType === "DRAWING").map(fromServerAsset));
            setIcons(assets.filter(a => a.assetType === "ICON").map(fromServerAsset));
            setDocuments(assets.filter(a => a.assetType === "DOCUMENT").map(fromServerAsset));
            const primary = assets.find(a => a.assetType === "IMAGE" && a.isPrimary);
            const primaryMatch = primary ? imgs.find(u => u.serverId === primary.id) : null;
            setPrimaryId(primaryMatch?.id ?? imgs[0]?.id ?? null);
        } catch (e) {
            console.error(e);
            showToast(t("networkError"), "error");
        }
    };

    const handleHeatPumpSelect = (label: string) => {
        if (label === HP_SELECT) { setSelectedHeatPumpId(null); clearForm(); clearUploads(); return; }
        const h = heatPumps.find((x) => heatPumpLabel(x) === label);
        if (h) { setSelectedHeatPumpId(h.id); loadHeatPump(h.id); }
    };

    // Uploads only newly added files (existing server assets untouched) directly to R2
    // via presigned URLs. Primary is only set here when it's a new image.
    const uploadNewAssets = async (unitId: number) => {
        const isNew = (u: Upload): u is Upload & { file: File } => !u.serverId && !!u.file;
        const primaryItem = images.find((u) => u.id === primaryId && isNew(u));
        await uploadUnitAssets(unitId, {
            images: images.filter(isNew).map((u) => u.file),
            primaryImage: primaryItem?.file ?? null,
            drawings: drawings.filter(isNew).map((u) => u.file),
            icons: icons.filter(isNew).map((u) => u.file),
            documents: documents.filter(isNew).map((u) => u.file),
        });
    };

    const handleSave = async () => {
        if (selectedHeatPumpId === null) { showToast(t("pleaseSelectHeatPumpEdit"), "error"); return; }
        if (!model.trim()) { showToast(t("pleaseEnterModelName"), "error"); return; }
        if (chassisId === null) { showToast(t("pleaseSelectChassis"), "error"); return; }
        if (compressorRatingId === null) { showToast(t("selectAllComponents"), "error"); return; }

        const payload = {
            heatPumpDto: { model: model.trim(), name: name.trim(), description: description.trim(), type: unitType === "air_to_water" ? "AW" : "WW" },
            commonSpecsDto: {
                compressorRatingId,
                compressorQty: int(f.compressorQty), condenserQty: int(f.condenserQty),
                expansionValveQty: int(f.expansionValveQty), chassisId,
                fanPI: num(f.fanPI), width: num(f.width), length: num(f.length), height: num(f.height),
                numberOfFans: int(f.numberOfFans), fanType, fanDiameter: num(f.fanDiameter), airflowRate: num(f.airflowRate),
                dischargeLineDiameter: f.dischargeLineDiameter, liquidLineDiameter: f.liquidLineDiameter,
                suctionLineDiameter: f.suctionLineDiameter, gasTank: num(f.gasTank),
                waterInletConnection, waterOutletConnection,
            },
        };

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pump/${selectedHeatPumpId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload),
            });
            if (res.ok) {
                try {
                    await uploadNewAssets(selectedHeatPumpId);
                    showToast(t("heatPumpUpdated"), "success");
                } catch (uploadErr) {
                    console.error("Asset upload failed", uploadErr);
                    showToast(uploadErr instanceof Error ? uploadErr.message : t("savedButUploadFailed"), "error");
                }
                await loadHeatPumps();
            } else {
                let msg = t("failedUpdateHeatPump");
                try { const data = await res.json(); msg = data.message || data.error || msg; } catch { /* default */ }
                showToast(msg, "error");
            }
        } catch (e) {
            console.error(e);
            showToast(t("networkError"), "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedHeatPumpId(null);
        clearForm();
        clearUploads();
    };

    const handleDelete = async () => {
        if (selectedHeatPumpId === null) { showToast(t("pleaseSelectHeatPumpDelete"), "error"); return; }
        const ok = await confirm({ title: t("deleteHeatPumpTitle"), message: t("deleteHeatPumpMessage"), confirmText: t("delete") });
        if (!ok) return;
        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/${selectedHeatPumpId}`, { method: "DELETE", credentials: "include" });
            if (res.ok) {
                showToast(t("heatPumpDeleted"), "success");
                handleCancel();
                await loadHeatPumps();
            } else {
                showToast(t("failedDeleteHeatPump"), "error");
            }
        } catch (e) {
            console.error(e);
            showToast(t("networkError"), "error");
        } finally {
            setSubmitting(false);
        }
    };

    const chassisValue = chassisList.find((c) => c.id === chassisId);
    const chassisOptions = [CHASSIS_SELECT, ...chassisList.map(chassisLabel)];
    const selectedHeatPump = heatPumps.find((h) => h.id === selectedHeatPumpId);

    // 4-step cascade: Refrigerant -> Brand -> Kind -> Compressor model. Each level prefers
    // the explicitly chosen value; otherwise it derives from the loaded compressorRatingId
    // so a preloaded compressor preselects even before the admin touches the picker.
    const ratingRow = compressorRatingId !== null ? compressorCatalog.find((c) => c.ratingId === compressorRatingId) : undefined;
    const refrigerantValue = refrigerant !== REFRIGERANT_SELECT ? refrigerant : (ratingRow?.refrigerant ?? REFRIGERANT_SELECT);
    const brandValue = brand !== BRAND_SELECT ? brand : (ratingRow?.brand ?? BRAND_SELECT);
    const kindValue = kind !== KIND_SELECT ? kind : (ratingRow?.kind ?? KIND_SELECT);
    const compressorModelValue = compressorModel !== COMPRESSOR_SELECT ? compressorModel : (ratingRow?.model ?? COMPRESSOR_SELECT);

    const refrigerantOptions = [REFRIGERANT_SELECT, ...distinct(compressorCatalog.map((c) => c.refrigerant))];
    const brandRows = compressorCatalog.filter((c) => c.refrigerant === refrigerantValue);
    const brandOptions = [BRAND_SELECT, ...distinct(brandRows.map((c) => c.brand))];
    const kindRows = brandRows.filter((c) => c.brand === brandValue);
    const kindOptions = [KIND_SELECT, ...distinct(kindRows.map((c) => c.kind))];
    const modelRows = kindRows.filter((c) => c.kind === kindValue);
    const compressorModelOptions = [COMPRESSOR_SELECT, ...distinct(modelRows.map((c) => c.model))];

    return (
        <div className={styles.sectionsContainer}>
            {confirmElement}
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
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>{t("modelInfo")}</span>
                </div>
                <div className={styles.horizontalSeperator}></div>
                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}><label>{t("heatPump")}</label><Combobox options={[HP_SELECT, ...heatPumps.map(heatPumpLabel)]} value={selectedHeatPump ? heatPumpLabel(selectedHeatPump) : HP_SELECT} getLabel={display} onChange={handleHeatPumpSelect} className={`${styles.comboBox} ${selectedHeatPumpId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                <div className={styles.formField}><label>{t("model")}</label><input type="text" className={styles.inputElement} placeholder={t("enterModelName")} value={model} onChange={(e) => setModel(e.target.value)} /></div>
                                <div className={styles.formField}><label>{t("name")}</label><input type="text" className={styles.inputElement} placeholder={t("enterDisplayName")} value={name} onChange={(e) => setName(e.target.value)} /></div>
                                <div className={`${styles.formField} ${styles.formFieldFullWidth}`}><label>{t("description")}</label><textarea className={styles.inputElement} placeholder={t("enterUnitDescription")} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
                                <div className={styles.formField}><label>{t("type")}</label><Combobox options={["Air to water", "Water to water"]} value={unitType === "air_to_water" ? "Air to water" : "Water to water"} getLabel={display} onChange={(val) => setUnitType(val === "Air to water" ? "air_to_water" : "water_to_water")} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} /></div>
                                <div className={styles.formField}><label>{t("refrigerant")}</label><Combobox options={refrigerantOptions} value={refrigerantValue} getLabel={display} onChange={(val) => { setRefrigerant(val); setBrand(BRAND_SELECT); setKind(KIND_SELECT); setCompressorModel(COMPRESSOR_SELECT); setCompressorRatingId(null); }} className={`${styles.comboBox} ${refrigerantValue.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                <div className={styles.formField}><label>{t("brand")}</label><Combobox options={brandOptions} value={brandValue} getLabel={display} onChange={(val) => { setRefrigerant(refrigerantValue); setBrand(val); setKind(KIND_SELECT); setCompressorModel(COMPRESSOR_SELECT); setCompressorRatingId(null); }} className={`${styles.comboBox} ${brandValue.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                <div className={styles.formField}><label>{t("compressorKind")}</label><Combobox options={kindOptions} value={kindValue} getLabel={displayKind} onChange={(val) => { setRefrigerant(refrigerantValue); setBrand(brandValue); setKind(val); setCompressorModel(COMPRESSOR_SELECT); setCompressorRatingId(null); }} className={`${styles.comboBox} ${kindValue.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                <div className={styles.formField}><label>{t("compressor")}</label><Combobox options={compressorModelOptions} value={compressorModelValue} getLabel={display} onChange={(val) => { setRefrigerant(refrigerantValue); setBrand(brandValue); setKind(kindValue); setCompressorModel(val); setCompressorRatingId(compressorCatalog.find((c) => c.refrigerant === refrigerantValue && c.brand === brandValue && c.kind === kindValue && c.model === val)?.ratingId ?? null); }} className={`${styles.comboBox} ${compressorModelValue.startsWith('Select') ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                <div className={styles.formField}><label>{t("compressorQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.compressorQty} onChange={upd("compressorQty")} /></div>
                                <div className={styles.formField}><label>{t("condenserQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.condenserQty} onChange={upd("condenserQty")} /></div>
                                <div className={styles.formField}><label>{t("fanPowerInput")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.fanPI} onChange={upd("fanPI")} /></div>
                                <div className={styles.formField}><label>{t("fanType")}</label><Combobox options={["EC"]} value={fanType} getLabel={display} onChange={setFanType} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} /></div>
                                <div className={styles.formField}><label>{t("fanQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.numberOfFans} onChange={upd("numberOfFans")} /></div>
                                <div className={styles.formField}><label>{t("fanDiameter")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.fanDiameter} onChange={upd("fanDiameter")} /></div>
                                <div className={styles.formField}><label>{t("airflowRate")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.airflowRate} onChange={upd("airflowRate")} /></div>
                                <div className={styles.formField}><label>{t("expansionValveQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.expansionValveQty} onChange={upd("expansionValveQty")} /></div>
                                <div className={styles.formField}><label>{t("dischargeLineDiameter")}</label><input type="text" className={styles.inputElement} value={f.dischargeLineDiameter} onChange={upd("dischargeLineDiameter")} /></div>
                                <div className={styles.formField}><label>{t("liquidLineDiameter")}</label><input type="text" className={styles.inputElement} value={f.liquidLineDiameter} onChange={upd("liquidLineDiameter")} /></div>
                                <div className={styles.formField}><label>{t("suctionLineDiameter")}</label><input type="text" className={styles.inputElement} value={f.suctionLineDiameter} onChange={upd("suctionLineDiameter")} /></div>
                                <div className={styles.formField}><label>{t("gasTank")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.gasTank} onChange={upd("gasTank")} /></div>
                                <div className={styles.formField}><label>{t("waterInletConnection")}</label><input type="text" className={styles.inputElement} value={waterInletConnection} onChange={(e) => setWaterInletConnection(e.target.value)} /></div>
                                <div className={styles.formField}><label>{t("waterOutletConnection")}</label><input type="text" className={styles.inputElement} value={waterOutletConnection} onChange={(e) => setWaterOutletConnection(e.target.value)} /></div>
                                <div className={styles.formField}><label>{t("chasis")}</label><Combobox options={chassisOptions} value={chassisValue ? chassisLabel(chassisValue) : CHASSIS_SELECT} getLabel={display} onChange={(label) => setChassisId(chassisList.find((c) => chassisLabel(c) === label)?.id ?? null)} className={`${styles.comboBox} ${chassisId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                <div className={styles.formField}><label>{t("width")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.width} onChange={upd("width")} /></div>
                                <div className={styles.formField}><label>{t("length")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.length} onChange={upd("length")} /></div>
                                <div className={styles.formField}><label>{t("height")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.height} onChange={upd("height")} /></div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.seperator}></div>
                    <div className={styles.rightContent}>
                        <div className={styles.uploadSection}>
                            <div className={styles.sizeBar}>
                                <span className={styles.sizeBarLabel}>{t("storage")}</span>
                                <div className={styles.sizeBarTrack}>
                                    <div className={`${styles.sizeBarFill}${totalBytes() > MAX_TOTAL_BYTES * 0.9 ? ` ${styles.sizeBarFillDanger}` : totalBytes() > MAX_TOTAL_BYTES * 0.7 ? ` ${styles.sizeBarFillWarn}` : ""}`} style={{ width: `${Math.min(100, (totalBytes() / MAX_TOTAL_BYTES) * 100)}%` }} />
                                </div>
                                <span className={styles.sizeBarValue}>{formatBytes(totalBytes())} / 25 MB</span>
                            </div>

                            {/* Images */}
                            <div className={styles.uploadCard}>
                                <div className={styles.uploadCardHeader}>
                                    <div className={styles.uploadCardTitle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>{t("images")}</div>
                                    {images.length > 0 && <span className={styles.uploadBadge}>{images.length}</span>}
                                </div>
                                <div className={`${styles.dropZone}${dragOver === "image" ? ` ${styles.dropZoneActive}` : ""}`} onClick={() => imageInputRef.current?.click()} {...dropHandlers("image", onImageFiles)}>
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
                                                    <button type="button" className={`${styles.starBtn}${primaryId === u.id ? ` ${styles.starBtnActive}` : ""}`} title={t("setAsPrimary")} onClick={(e) => { e.stopPropagation(); handleSetPrimary(u.id); }}>{primaryId === u.id ? "★" : "☆"}</button>
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
                                    <div className={styles.uploadCardTitle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>{t("technicalDrawings")}</div>
                                    {drawings.length > 0 && <span className={styles.uploadBadge}>{drawings.length}</span>}
                                </div>
                                <div className={`${styles.dropZone}${dragOver === "drawing" ? ` ${styles.dropZoneActive}` : ""}`} onClick={() => drawingInputRef.current?.click()} {...dropHandlers("drawing", onDrawingFiles)}>
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
                                    <div className={styles.uploadCardTitle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>{t("documents")}</div>
                                    {documents.length > 0 && <span className={styles.uploadBadge}>{documents.length}</span>}
                                </div>
                                <div className={`${styles.dropZone}${dragOver === "document" ? ` ${styles.dropZoneActive}` : ""}`} onClick={() => documentInputRef.current?.click()} {...dropHandlers("document", onDocumentFiles)}>
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
                                            const displayName = u.name ?? u.file?.name ?? "file";
                                            const ext = displayName.split(".").pop() ?? "file";
                                            return (
                                                <div key={u.id} className={styles.docItem}>
                                                    <div className={styles.docExt}>{ext.slice(0, 4)}</div>
                                                    <a href={u.url} target="_blank" rel="noopener noreferrer" className={styles.docName} title={displayName}>{displayName}</a>
                                                    {u.file && <span className={styles.docSize}>{formatBytes(u.file.size)}</span>}
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
                                    <div className={styles.uploadCardTitle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{t("icons")}</div>
                                    {icons.length > 0 && <span className={styles.uploadBadge}>{icons.length}</span>}
                                </div>
                                <div className={`${styles.dropZone}${dragOver === "icon" ? ` ${styles.dropZoneActive}` : ""}`} onClick={() => iconInputRef.current?.click()} {...dropHandlers("icon", onIconFiles)}>
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
                        <div className={styles.stepNavContainer} style={{ justifyContent: "flex-end", gap: "10px" }}>
                            {selectedHeatPumpId !== null && <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e' }} onClick={handleDelete} disabled={submitting}>{t("delete")}</button>}
                            <button className={styles.cancelBtn} onClick={handleCancel}>{t("cancel")}</button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={submitting}>{submitting ? t("saving") : t("save")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
