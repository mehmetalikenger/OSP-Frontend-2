"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import styles from "../addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { uploadUnitAssets } from "../../../../../../lib/assetUpload";

const API = process.env.NEXT_PUBLIC_API_URL;

type Refrigerant = { id: number; name: string; code: string };
type Chassis = { id: number; brand?: string | null; model: string };
type Upload = { file?: File; url: string; id: string; serverId?: number };

let uidCounter = 0;
const uid = () => `u${Date.now()}_${uidCounter++}`;
const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;

const REFRIG_SELECT = "Select Refrigerant";
const CHASSIS_SELECT = "Select Chasis";
const refrigerantLabel = (r: Refrigerant) => `${r.name} / ${r.code}`;
const chassisLabel = (c: Chassis) => c.model;

export default function AddHeatPumpModelPage() {
    const t = useTranslations("AdminUnit");
    const display = (v: string): string => (({
      "Select Refrigerant": t("selectRefrigerant"),
      "Select Chasis": t("selectChasis"),
      "Air to water": t("airToWater"),
      "Water to water": t("waterToWater"),
    } as Record<string, string>)[v] ?? v);
    const [unitType, setUnitType] = useState("air_to_water");
    const [model, setModel] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [refrigerantList, setRefrigerantList] = useState<Refrigerant[]>([]);
    const [refrigerantId, setRefrigerantId] = useState<number | null>(null);
    const [chassisList, setChassisList] = useState<Chassis[]>([]);
    const [chassisId, setChassisId] = useState<number | null>(null);

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

    const removeImage = (id: string) => {
        const item = images.find((u) => u.id === id);
        if (item?.file) URL.revokeObjectURL(item.url);
        const remaining = images.filter((u) => u.id !== id);
        setImages(remaining);
        if (primaryId === id) setPrimaryId(remaining[0]?.id ?? null);
    };

    const removeFrom = (list: Upload[], setter: React.Dispatch<React.SetStateAction<Upload[]>>) => (id: string) => {
        const item = list.find((u) => u.id === id);
        if (item?.file) URL.revokeObjectURL(item.url);
        setter(list.filter((u) => u.id !== id));
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

    useEffect(() => {
        const load = async (path: string, setter: (d: any) => void) => {
            try {
                const res = await fetchWithAuth(`${API}${path}`, { credentials: "include", cache: "no-store" });
                if (res.ok) setter(await res.json());
            } catch (e) {
                console.error(`Failed to load ${path}`, e);
            }
        };
        load("/admin/component/refrigerants", setRefrigerantList);
        load("/admin/component/chassis", setChassisList);
    }, []);

    const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const int = (v: string) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };
    const blockNeg = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); };

    const refrigerantValue = refrigerantList.find((r) => r.id === refrigerantId);
    const refrigerantOptions = [REFRIG_SELECT, ...refrigerantList.map(refrigerantLabel)];
    const chassisValue = chassisList.find((c) => c.id === chassisId);
    const chassisOptions = [CHASSIS_SELECT, ...chassisList.map(chassisLabel)];

    const resetForm = () => {
        setModel("");
        setName("");
        setDescription("");
        setUnitType("air_to_water");
        setRefrigerantId(null);
        setChassisId(null);
        setFanType("EC");
        setWaterInletConnection("");
        setWaterOutletConnection("");
        setF({
            compressorQty: "", condenserQty: "", expansionValveQty: "",
            fanPI: "", width: "", length: "", height: "",
            numberOfFans: "", fanDiameter: "", airflowRate: "",
            dischargeLineDiameter: "", liquidLineDiameter: "", suctionLineDiameter: "", gasTank: "",
        });
        clearUploads();
    };

    // Uploads only newly added files directly to R2 via presigned URLs (lib/assetUpload).
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

    const handleAdd = async () => {
        if (!model.trim()) { showToast(t("pleaseEnterModelName"), "error"); return; }
        if (refrigerantId === null) { showToast(t("pleaseSelectRefrigerant"), "error"); return; }
        if (chassisId === null) { showToast(t("pleaseSelectChassis"), "error"); return; }

        const payload = {
            heatPumpDto: { model: model.trim(), name: name.trim(), description: description.trim(), type: unitType === "air_to_water" ? "AW" : "WW" },
            commonSpecsDto: {
                compressorQty: int(f.compressorQty), condenserQty: int(f.condenserQty),
                expansionValveQty: int(f.expansionValveQty), refrigerantId, chassisId,
                fanPI: num(f.fanPI), width: num(f.width), length: num(f.length), height: num(f.height),
                numberOfFans: int(f.numberOfFans), fanType, fanDiameter: num(f.fanDiameter), airflowRate: num(f.airflowRate),
                dischargeLineDiameter: f.dischargeLineDiameter, liquidLineDiameter: f.liquidLineDiameter,
                suctionLineDiameter: f.suctionLineDiameter, gasTank: num(f.gasTank),
                waterInletConnection, waterOutletConnection,
            },
        };

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pump`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload),
            });
            if (res.ok) {
                const newId: number = await res.json();
                try {
                    await uploadNewAssets(newId);
                    showToast(t("hpModelCreated"), "success");
                } catch (uploadErr) {
                    console.error("Asset upload failed", uploadErr);
                    showToast(uploadErr instanceof Error ? uploadErr.message : t("hpUploadFailed"), "error");
                }
                resetForm();
            } else {
                let msg = t("failedCreateHpModel");
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
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>{t("modelInfo")}</span>
                </div>
                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
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
                                    <Combobox getLabel={display} options={["Air to water", "Water to water"]} value={unitType === "air_to_water" ? "Air to water" : "Water to water"} onChange={(val) => setUnitType(val === "Air to water" ? "air_to_water" : "water_to_water")} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} />
                                </div>
                                <div className={styles.formField}>
                                    <label>{t("refrigerant")}</label>
                                    <Combobox getLabel={display} options={refrigerantOptions} value={refrigerantValue ? refrigerantLabel(refrigerantValue) : REFRIG_SELECT} onChange={(label) => setRefrigerantId(refrigerantList.find((r) => refrigerantLabel(r) === label)?.id ?? null)} className={`${styles.comboBox} ${refrigerantId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                </div>
                                <div className={styles.formField}><label>{t("compressorQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.compressorQty} onChange={upd("compressorQty")} /></div>
                                <div className={styles.formField}><label>{t("condenserQty")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.condenserQty} onChange={upd("condenserQty")} /></div>
                                <div className={styles.formField}><label>{t("fanPowerInput")}</label><input type="number" onWheel={(e) => e.currentTarget.blur()} min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.fanPI} onChange={upd("fanPI")} /></div>
                                <div className={styles.formField}>
                                    <label>{t("fanType")}</label>
                                    <Combobox getLabel={display} options={["EC"]} value={fanType} onChange={setFanType} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} />
                                </div>
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
                                <div className={styles.formField}>
                                    <label>{t("chasis")}</label>
                                    <Combobox getLabel={display} options={chassisOptions} value={chassisValue ? chassisLabel(chassisValue) : CHASSIS_SELECT} onChange={(label) => setChassisId(chassisList.find((c) => chassisLabel(c) === label)?.id ?? null)} className={`${styles.comboBox} ${chassisId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                </div>
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
                                                    <button type="button" className={`${styles.starBtn}${primaryId === u.id ? ` ${styles.starBtnActive}` : ""}`} title={t("setAsPrimary")} onClick={(e) => { e.stopPropagation(); setPrimaryId(u.id); }}>{primaryId === u.id ? "★" : "☆"}</button>
                                                    <button type="button" className={styles.removeTileBtn} onClick={() => removeImage(u.id)}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

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
                                            const fileName = u.file?.name ?? decodeURIComponent(u.url.split("/").pop() ?? "document");
                                            const ext = fileName.split(".").pop() ?? "file";
                                            return (
                                                <div key={u.id} className={styles.docItem}>
                                                    <div className={styles.docExt}>{ext.slice(0, 4)}</div>
                                                    <a href={u.url} target="_blank" rel="noopener noreferrer" className={styles.docName} title={fileName}>{fileName}</a>
                                                    {u.file && <span className={styles.docSize}>{formatBytes(u.file.size)}</span>}
                                                    <button type="button" className={styles.docRemoveBtn} onClick={() => removeFrom(documents, setDocuments)(u.id)}>×</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

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
                        <div className={styles.stepNavContainer} style={{ justifyContent: "flex-end" }}>
                            <button className={styles.saveBtn} onClick={handleAdd} disabled={submitting}>
                                {submitting ? t("adding") : t("add")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
