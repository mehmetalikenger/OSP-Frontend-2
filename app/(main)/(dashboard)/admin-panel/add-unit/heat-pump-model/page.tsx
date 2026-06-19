"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type Refrigerant = { id: number; name: string; code: string };
type Upload = { file?: File; url: string; id: string; serverId?: number };

let uidCounter = 0;
const uid = () => `u${Date.now()}_${uidCounter++}`;
const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;

const REFRIG_SELECT = "Select Refrigerant";
const refrigerantLabel = (r: Refrigerant) => `${r.name} / ${r.code}`;

export default function AddHeatPumpModelPage() {
    const [unitType, setUnitType] = useState("air_to_water");
    const [model, setModel] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [refrigerantList, setRefrigerantList] = useState<Refrigerant[]>([]);
    const [refrigerantId, setRefrigerantId] = useState<number | null>(null);

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
        if (totalBytes(arr) > MAX_TOTAL_BYTES) { showToast("Total upload can't exceed 25 MB.", "error"); return []; }
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
        (async () => {
            try {
                const res = await fetchWithAuth(`${API}/admin/component/refrigerants`, { credentials: "include", cache: "no-store" });
                if (res.ok) setRefrigerantList(await res.json());
            } catch (e) {
                console.error("Failed to load refrigerants", e);
            }
        })();
    }, []);

    const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const int = (v: string) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };
    const blockNeg = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); };

    const refrigerantValue = refrigerantList.find((r) => r.id === refrigerantId);
    const refrigerantOptions = [REFRIG_SELECT, ...refrigerantList.map(refrigerantLabel)];

    const resetForm = () => {
        setModel("");
        setName("");
        setDescription("");
        setUnitType("air_to_water");
        setRefrigerantId(null);
        setF({
            compressorQty: "", condenserQty: "", expansionValveQty: "",
            fanPI: "", width: "", length: "", height: "",
            numberOfFans: "", fanDiameter: "", airflowRate: "",
            dischargeLineDiameter: "", liquidLineDiameter: "", suctionLineDiameter: "", gasTank: "",
        });
        clearUploads();
    };

    const uploadNewAssets = async (unitId: number) => {
        const newImages = images.filter(u => !u.serverId);
        const newDrawings = drawings.filter(u => !u.serverId);
        const newIcons = icons.filter(u => !u.serverId);
        const newDocs = documents.filter(u => !u.serverId);
        if (!newImages.length && !newDrawings.length && !newIcons.length && !newDocs.length) return;

        const fd = new FormData();
        const primaryItem = newImages.find(u => u.id === primaryId);
        if (primaryItem?.file) fd.append("primaryImage", primaryItem.file);
        newImages.forEach(u => { if (u.id !== primaryId && u.file) fd.append("images", u.file); });
        newDrawings.forEach(u => { if (u.file) fd.append("technicalImages", u.file); });
        newIcons.forEach(u => { if (u.file) fd.append("icons", u.file); });
        newDocs.forEach(u => { if (u.file) fd.append("documents", u.file); });

        try {
            await fetchWithAuth(`${API}/admin/unit/${unitId}/upload-assets`, { method: "POST", credentials: "include", body: fd });
        } catch (e) {
            console.error("Asset upload failed", e);
        }
    };

    const handleAdd = async () => {
        if (!model.trim()) { showToast("Please enter a model name.", "error"); return; }
        if (refrigerantId === null) { showToast("Please select a refrigerant.", "error"); return; }

        const payload = {
            heatPumpDto: { model: model.trim(), name: name.trim(), description: description.trim(), type: unitType === "air_to_water" ? "AW" : "WW" },
            commonSpecsDto: {
                compressorQty: int(f.compressorQty), condenserQty: int(f.condenserQty),
                expansionValveQty: int(f.expansionValveQty), refrigerantId,
                fanPI: num(f.fanPI), width: num(f.width), length: num(f.length), height: num(f.height),
                numberOfFans: int(f.numberOfFans), fanDiameter: num(f.fanDiameter), airflowRate: num(f.airflowRate),
                dischargeLineDiameter: f.dischargeLineDiameter, liquidLineDiameter: f.liquidLineDiameter,
                suctionLineDiameter: f.suctionLineDiameter, gasTank: num(f.gasTank),
            },
        };

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pump`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload),
            });
            if (res.ok) {
                const newId: number = await res.json();
                await uploadNewAssets(newId);
                showToast("Heat pump model created. Add its modes from the Mod page.", "success");
                resetForm();
            } else {
                let msg = "Failed to create heat pump model.";
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
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>Model Information</span>
                </div>
                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>Model</label>
                                    <input type="text" className={styles.inputElement} placeholder="Enter model name" value={model} onChange={(e) => setModel(e.target.value)} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Name</label>
                                    <input type="text" className={styles.inputElement} placeholder="Enter display name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className={`${styles.formField} ${styles.formFieldFullWidth}`}>
                                    <label>Description</label>
                                    <textarea className={styles.inputElement} placeholder="Enter unit description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Type</label>
                                    <Combobox options={["Air to water", "Water to water"]} value={unitType === "air_to_water" ? "Air to water" : "Water to water"} onChange={(val) => setUnitType(val === "Air to water" ? "air_to_water" : "water_to_water")} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Refrigerant</label>
                                    <Combobox options={refrigerantOptions} value={refrigerantValue ? refrigerantLabel(refrigerantValue) : REFRIG_SELECT} onChange={(label) => setRefrigerantId(refrigerantList.find((r) => refrigerantLabel(r) === label)?.id ?? null)} className={`${styles.comboBox} ${refrigerantId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} />
                                </div>
                                <div className={styles.formField}><label>Compressor Qty</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.compressorQty} onChange={upd("compressorQty")} /></div>
                                <div className={styles.formField}><label>Condenser Qty</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.condenserQty} onChange={upd("condenserQty")} /></div>
                                <div className={styles.formField}><label>Fan Power Input (kW)</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.fanPI} onChange={upd("fanPI")} /></div>
                                <div className={styles.formField}><label>Fan Qty</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.numberOfFans} onChange={upd("numberOfFans")} /></div>
                                <div className={styles.formField}><label>Fan Diameter</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.fanDiameter} onChange={upd("fanDiameter")} /></div>
                                <div className={styles.formField}><label>Airflow Rate (m3/h)</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.airflowRate} onChange={upd("airflowRate")} /></div>
                                <div className={styles.formField}><label>Expansion Valve Qty</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.expansionValveQty} onChange={upd("expansionValveQty")} /></div>
                                <div className={styles.formField}><label>Discharge Line Diameter</label><input type="text" className={styles.inputElement} value={f.dischargeLineDiameter} onChange={upd("dischargeLineDiameter")} /></div>
                                <div className={styles.formField}><label>Liquid Line Diameter</label><input type="text" className={styles.inputElement} value={f.liquidLineDiameter} onChange={upd("liquidLineDiameter")} /></div>
                                <div className={styles.formField}><label>Suction Line Diameter</label><input type="text" className={styles.inputElement} value={f.suctionLineDiameter} onChange={upd("suctionLineDiameter")} /></div>
                                <div className={styles.formField}><label>Gas Tank (L)</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.gasTank} onChange={upd("gasTank")} /></div>
                                <div className={styles.formField}><label>Width</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.width} onChange={upd("width")} /></div>
                                <div className={styles.formField}><label>Length</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.length} onChange={upd("length")} /></div>
                                <div className={styles.formField}><label>Height</label><input type="number" min="0" onKeyDown={blockNeg} className={styles.inputElement} value={f.height} onChange={upd("height")} /></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.seperator}></div>

                    <div className={styles.rightContent}>
                        <div className={styles.uploadSection}>

                            <div className={styles.sizeBar}>
                                <span className={styles.sizeBarLabel}>Storage</span>
                                <div className={styles.sizeBarTrack}>
                                    <div className={`${styles.sizeBarFill}${totalBytes() > MAX_TOTAL_BYTES * 0.9 ? ` ${styles.sizeBarFillDanger}` : totalBytes() > MAX_TOTAL_BYTES * 0.7 ? ` ${styles.sizeBarFillWarn}` : ""}`} style={{ width: `${Math.min(100, (totalBytes() / MAX_TOTAL_BYTES) * 100)}%` }} />
                                </div>
                                <span className={styles.sizeBarValue}>{formatBytes(totalBytes())} / 25 MB</span>
                            </div>

                            <div className={styles.uploadCard}>
                                <div className={styles.uploadCardHeader}>
                                    <div className={styles.uploadCardTitle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Images</div>
                                    {images.length > 0 && <span className={styles.uploadBadge}>{images.length}</span>}
                                </div>
                                <div className={`${styles.dropZone}${dragOver === "image" ? ` ${styles.dropZoneActive}` : ""}`} onClick={() => imageInputRef.current?.click()} {...dropHandlers("image", onImageFiles)}>
                                    <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { onImageFiles(e.target.files); e.target.value = ""; }} />
                                    <div className={styles.dropZoneInner}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        <span className={styles.dropZoneText}>Drop images here or click to browse</span>
                                        <span className={styles.dropZoneHint}>PNG · JPG · WEBP — multiple files supported</span>
                                    </div>
                                </div>
                                {images.length > 0 && (
                                    <>
                                        <span className={styles.uploadGridHint}>Click ☆ to mark as primary · click thumbnail to preview</span>
                                        <div className={styles.imageGrid}>
                                            {images.map((u) => (
                                                <div key={u.id} className={`${styles.imageTile}${primaryId === u.id ? ` ${styles.imageTilePrimary}` : ""}`}>
                                                    <img src={u.url} alt="" className={styles.imageTileImg} onClick={() => setLightbox(u.url)} />
                                                    {primaryId === u.id && <span className={styles.primaryRing}>Primary</span>}
                                                    <button type="button" className={`${styles.starBtn}${primaryId === u.id ? ` ${styles.starBtnActive}` : ""}`} title="Set as primary" onClick={(e) => { e.stopPropagation(); setPrimaryId(u.id); }}>{primaryId === u.id ? "★" : "☆"}</button>
                                                    <button type="button" className={styles.removeTileBtn} onClick={() => removeImage(u.id)}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={styles.uploadCard}>
                                <div className={styles.uploadCardHeader}>
                                    <div className={styles.uploadCardTitle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Technical Drawings</div>
                                    {drawings.length > 0 && <span className={styles.uploadBadge}>{drawings.length}</span>}
                                </div>
                                <div className={`${styles.dropZone}${dragOver === "drawing" ? ` ${styles.dropZoneActive}` : ""}`} onClick={() => drawingInputRef.current?.click()} {...dropHandlers("drawing", onDrawingFiles)}>
                                    <input ref={drawingInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { onDrawingFiles(e.target.files); e.target.value = ""; }} />
                                    <div className={styles.dropZoneInner}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        <span className={styles.dropZoneText}>Drop drawings here or click to browse</span>
                                        <span className={styles.dropZoneHint}>PNG · JPG — technical diagrams &amp; schematics</span>
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
                                    <div className={styles.uploadCardTitle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Documents</div>
                                    {documents.length > 0 && <span className={styles.uploadBadge}>{documents.length}</span>}
                                </div>
                                <div className={`${styles.dropZone}${dragOver === "document" ? ` ${styles.dropZoneActive}` : ""}`} onClick={() => documentInputRef.current?.click()} {...dropHandlers("document", onDocumentFiles)}>
                                    <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" multiple style={{ display: "none" }} onChange={(e) => { onDocumentFiles(e.target.files); e.target.value = ""; }} />
                                    <div className={styles.dropZoneInner}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        <span className={styles.dropZoneText}>Drop files here or click to browse</span>
                                        <span className={styles.dropZoneHint}>PDF · DOC · DOCX · XLS · XLSX</span>
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
                                    <div className={styles.uploadCardTitle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Icons</div>
                                    {icons.length > 0 && <span className={styles.uploadBadge}>{icons.length}</span>}
                                </div>
                                <div className={`${styles.dropZone}${dragOver === "icon" ? ` ${styles.dropZoneActive}` : ""}`} onClick={() => iconInputRef.current?.click()} {...dropHandlers("icon", onIconFiles)}>
                                    <input ref={iconInputRef} type="file" accept="image/png, image/svg+xml, .ico" multiple style={{ display: "none" }} onChange={(e) => { onIconFiles(e.target.files); e.target.value = ""; }} />
                                    <div className={styles.dropZoneInner}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        <span className={styles.dropZoneText}>Drop icons here or click to browse</span>
                                        <span className={styles.dropZoneHint}>PNG · SVG · ICO</span>
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
                                {submitting ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
