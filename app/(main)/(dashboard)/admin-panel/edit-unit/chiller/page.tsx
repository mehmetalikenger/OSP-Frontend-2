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

type ComponentSpecs = { id: number; brand?: string | null; model: string; capacity: number };
type CompressorSpecs = { id: number; brand?: string | null; model: string; type?: string | null; capacity: number; powerInput: number };
type Chassis = { id: number; brand?: string | null; model: string };
type Refrigerant = { id: number; name: string; code: string };
type ChillerSummary = { id: number; model: string; type: string };

// file is undefined for existing server assets; serverId is the DB id for those
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

const SELECT = {
    chiller: "Select Chiller",
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
const chillerLabel = (c: ChillerSummary) => `${c.model} (${c.type})`;
const str = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

export default function Page() {
    const t = useTranslations("AdminUnit");
    const display = (v: string) => {
        const map: Record<string, string> = {
            "Select Chiller": t("selectChiller"),
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
        };
        return map[v] ?? v;
    };
    const [activeTab, setActiveTab] = useState("model");
    const [unitType, setUnitType] = useState("air_to_water");
    const [unitMod] = useState("cooling");

    const [chillers, setChillers] = useState<ChillerSummary[]>([]);
    const [selectedChillerId, setSelectedChillerId] = useState<number | null>(null);

    const [model, setModel] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [compressorSpecsId, setCompressorSpecsId] = useState<number | null>(null);
    const [evaporatorSpecsId, setEvaporatorSpecsId] = useState<number | null>(null);
    const [condenserSpecsId, setCondenserSpecsId] = useState<number | null>(null);
    const [expansionValveSpecsId, setExpansionValveSpecsId] = useState<number | null>(null);
    const [reversingValveSpecsId, setReversingValveSpecsId] = useState<number | null>(null);
    const [chassisId, setChassisId] = useState<number | null>(null);
    const [refrigerantId, setRefrigerantId] = useState<number | null>(null);

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

    useEffect(() => {
        const load = async (path: string, setter: (d: any) => void) => {
            try {
                const res = await fetchWithAuth(`${API}${path}`, { credentials: "include", cache: "no-store" });
                if (res.ok) setter(await res.json());
            } catch (e) { console.error(`Failed to load ${path}`, e); }
        };
        load("/admin/component/allCompressorSpecs", setCompressorList);
        load("/admin/component/allEvaporatorSpecs", setEvaporatorList);
        load("/admin/component/allCondenserSpecs", setCondenserList);
        load("/admin/component/allExpansionValveSpecs", setExpansionValveList);
        load("/admin/component/allFourWayReversingValveSpecs", setReversingValveList);
        load("/admin/component/chassis", setChassisList);
        load("/admin/component/refrigerants", setRefrigerantList);
        load("/admin/unit/chillers", setChillers);
    }, []);

    const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const int = (v: string) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };
    const blockNeg = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); };

    const loadChiller = async (id: number) => {
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/${id}`, { credentials: "include", cache: "no-store" });
            if (!res.ok) { showToast(t("failedToLoadChiller"), "error"); return; }
            const d = await res.json();
            setModel(d.model ?? "");
            setName(d.name ?? "");
            setDescription(d.description ?? "");
            setUnitType(d.type === "WW" ? "water_to_water" : "air_to_water");
            setCompressorSpecsId(d.compressorSpecsId ?? null);
            setEvaporatorSpecsId(d.evaporatorSpecsId ?? null);
            setCondenserSpecsId(d.condenserSpecsId ?? null);
            setExpansionValveSpecsId(d.expansionValveSpecsId ?? null);
            setReversingValveSpecsId(d.fourWayReversingValveSpecsId ?? null);
            setChassisId(d.chassisId ?? null);
            setRefrigerantId(d.refrigerantId ?? null);
            setAmbient(str(d.ambient)); setEvapIn(str(d.evapIn)); setEvapOut(str(d.evapOut));
            setCondIn(str(d.condIn)); setCondOut(str(d.condOut));
            setCapacity(str(d.capacity)); setMaxCapacity(str(d.maxCapacity)); setCompressorQty(str(d.compressorQty));
            setCondenserRequiredDuty(str(d.condenserRequiredDuty));
            setQuietCondenserRequiredDuty(str(d.quietCondenserRequiredDuty));
            setFanPI(str(d.fanPI)); setEer(str(d.copErr)); setCondenserQty(str(d.condenserQty));
            setFanType(d.fanType || "EC");
            setNumberOfFans(str(d.numberOfFans)); setFanDiameter(str(d.fanDiameter));
            setExpansionValveQty(str(d.expansionValveQty)); setAirflowRate(str(d.airflowRate));
            setDischargeLineDiameter(d.dischargeLineDiameter ?? "");
            setLiquidLineDiameter(d.liquidLineDiameter ?? "");
            setSuctionLineDiameter(d.suctionLineDiameter ?? "");
            setGasTank(str(d.gasTank));
            setWaterInletConnection(d.waterInletConnection || "");
            setWaterOutletConnection(d.waterOutletConnection || "");
            setWidth(str(d.width)); setHeight(str(d.height)); setLength(str(d.length));
            setMinWaterInlet(str(d.minWaterInlet)); setMaxWaterInlet(str(d.maxWaterInlet));
            setMinWaterOutlet(str(d.minWaterOutlet)); setMaxWaterOutlet(str(d.maxWaterOutlet));
            setMinAmbient(str(d.minAmbient)); setMaxAmbient(str(d.maxAmbient));

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

    const handleChillerSelect = (label: string) => {
        if (label === SELECT.chiller) { handleCancel(); return; }
        const c = chillers.find((x) => chillerLabel(x) === label);
        if (c) { setSelectedChillerId(c.id); loadChiller(c.id); }
    };

    // Uploads only newly added files (existing server assets are untouched) directly
    // to R2 via presigned URLs. The primary is only set here when it's a new image;
    // re-primarying an existing image is handled by handleSetPrimary.
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
        if (selectedChillerId === null) { showToast(t("selectChillerToEdit"), "error"); return; }
        if (!model.trim()) { showToast(t("enterModelNameError"), "error"); setActiveTab("model"); return; }
        if (compressorSpecsId === null || evaporatorSpecsId === null || condenserSpecsId === null ||
            expansionValveSpecsId === null || chassisId === null || refrigerantId === null) {
            showToast(t("selectComponentsError"), "error");
            setActiveTab("model"); return;
        }

        const payload = {
            chillerDto: { model: model.trim(), name: name.trim(), description: description.trim(), type: unitType === "air_to_water" ? "AW" : "WW", mod: "COOLING" },
            unitDefCalcValuesDTO: { ambient: num(ambient), evapIn: num(evapIn), evapOut: num(evapOut), condIn: num(condIn), condOut: num(condOut) },
            unitTechSpecsDTO: {
                capacity: num(capacity), maxCapacity: num(maxCapacity), compressorSpecsId, compressorQty: int(compressorQty),
                condenserSpecsId, condenserQty: int(condenserQty), expansionValveSpecsId,
                expansionValveQty: int(expansionValveQty), evaporatorSpecsId, chassisId,
                fourWayReversingValveSpecsId: reversingValveSpecsId, refrigerantId,
                condenserRequiredDuty: num(condenserRequiredDuty), quietCondenserRequiredDuty: num(quietCondenserRequiredDuty),
                fanPI: num(fanPI), copErr: num(eer), width: num(width), length: num(length), height: num(height),
                fanType, numberOfFans: int(numberOfFans), fanDiameter: num(fanDiameter), airflowRate: num(airflowRate),
                dischargeLineDiameter, liquidLineDiameter, suctionLineDiameter, gasTank: num(gasTank),
                waterInletConnection, waterOutletConnection,
                minWaterInlet: num(minWaterInlet), maxWaterInlet: num(maxWaterInlet),
                minWaterOutlet: num(minWaterOutlet), maxWaterOutlet: num(maxWaterOutlet),
                minAmbient: num(minAmbient), maxAmbient: num(maxAmbient),
            },
        };

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/${selectedChillerId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload),
            });
            if (res.ok) {
                try {
                    await uploadNewAssets(selectedChillerId);
                    showToast(t("chillerUpdatedSuccess"), "success");
                } catch (uploadErr) {
                    console.error("Asset upload failed", uploadErr);
                    showToast(uploadErr instanceof Error ? uploadErr.message : t("chillerSavedUploadFailed"), "error");
                }
                const listRes = await fetchWithAuth(`${API}/admin/unit/chillers`, { credentials: "include", cache: "no-store" });
                if (listRes.ok) setChillers(await listRes.json());
            } else {
                let msg = t("failedToUpdateChiller");
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

    const handleCancel = () => {
        setSelectedChillerId(null);
        setModel(""); setName(""); setDescription(""); setUnitType("air_to_water");
        setCompressorSpecsId(null); setEvaporatorSpecsId(null); setCondenserSpecsId(null);
        setExpansionValveSpecsId(null); setReversingValveSpecsId(null); setChassisId(null); setRefrigerantId(null);
        setAmbient(""); setEvapIn(""); setEvapOut(""); setCondIn(""); setCondOut("");
        setCapacity(""); setMaxCapacity(""); setCompressorQty(""); setCondenserRequiredDuty(""); setQuietCondenserRequiredDuty("");
        setFanPI(""); setEer(""); setCondenserQty(""); setFanType("EC"); setNumberOfFans(""); setFanDiameter("");
        setExpansionValveQty(""); setAirflowRate(""); setDischargeLineDiameter(""); setLiquidLineDiameter("");
        setSuctionLineDiameter(""); setGasTank(""); setWaterInletConnection(""); setWaterOutletConnection(""); setWidth(""); setHeight(""); setLength("");
        setMinWaterInlet(""); setMaxWaterInlet(""); setMinWaterOutlet(""); setMaxWaterOutlet(""); setMinAmbient(""); setMaxAmbient("");
        clearUploads();
        setActiveTab("model");
    };

    const handleDelete = async () => {
        if (selectedChillerId === null) { showToast(t("selectChillerToDelete"), "error"); return; }
        const ok = await confirm({ title: t("deleteChillerTitle"), message: t("deleteChillerMessage"), confirmText: t("delete") });
        if (!ok) return;
        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/${selectedChillerId}`, { method: "DELETE", credentials: "include" });
            if (res.ok) {
                showToast(t("chillerDeleted"), "success");
                handleCancel();
                const listRes = await fetchWithAuth(`${API}/admin/unit/chillers`, { credentials: "include", cache: "no-store" });
                if (listRes.ok) setChillers(await listRes.json());
            } else {
                showToast(t("failedToDeleteChiller"), "error");
            }
        } catch (e) {
            console.error(e);
            showToast(t("networkError"), "error");
        } finally {
            setSubmitting(false);
        }
    };

    const chillerOptions = [SELECT.chiller, ...chillers.map(chillerLabel)];
    const compressorOptions = [SELECT.compressor, ...compressorList.map(compressorLabel)];
    const evaporatorOptions = [SELECT.evaporator, ...evaporatorList.map(specLabel)];
    const condenserOptions = [SELECT.condenser, ...condenserList.map(specLabel)];
    const expansionValveOptions = [SELECT.expansionValve, ...expansionValveList.map(specLabel)];
    const reversingValveOptions = [SELECT.reversingValve, ...reversingValveList.map(specLabel)];
    const chassisOptions = [SELECT.chassis, ...chassisList.map(chassisLabel)];
    const refrigerantOptions = [SELECT.refrigerant, ...refrigerantList.map(refrigerantLabel)];

    const compressorValue = compressorList.find((s) => s.id === compressorSpecsId);
    const evaporatorValue = evaporatorList.find((s) => s.id === evaporatorSpecsId);
    const condenserValue = condenserList.find((s) => s.id === condenserSpecsId);
    const expansionValveValue = expansionValveList.find((s) => s.id === expansionValveSpecsId);
    const reversingValveValue = reversingValveList.find((s) => s.id === reversingValveSpecsId);
    const chassisValue = chassisList.find((c) => c.id === chassisId);
    const refrigerantValue = refrigerantList.find((r) => r.id === refrigerantId);
    const selectedChiller = chillers.find((c) => c.id === selectedChillerId);

    const modelComplete =
        model.trim() !== "" &&
        compressorSpecsId !== null && evaporatorSpecsId !== null && condenserSpecsId !== null &&
        expansionValveSpecsId !== null && chassisId !== null && refrigerantId !== null;

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
                                    <div className={styles.formField}><label>{t("chillerToEdit")}</label><Combobox options={chillerOptions} value={selectedChiller ? chillerLabel(selectedChiller) : SELECT.chiller} getLabel={display} onChange={handleChillerSelect} className={`${styles.comboBox} ${selectedChillerId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("model")}</label><input type="text" className={styles.inputElement} placeholder={t("enterModelName")} value={model} onChange={(e) => setModel(e.target.value)} /></div>
                                    <div className={styles.formField}><label>{t("name")}</label><input type="text" className={styles.inputElement} placeholder={t("enterDisplayName")} value={name} onChange={(e) => setName(e.target.value)} /></div>
                                    <div className={`${styles.formField} ${styles.formFieldFullWidth}`}><label>{t("description")}</label><textarea className={styles.inputElement} placeholder={t("enterUnitDescription")} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
                                    <div className={styles.formField}><label>{t("type")}</label><Combobox options={["Air to water", "Water to water"]} value={unitType === "air_to_water" ? "Air to water" : "Water to water"} getLabel={display} onChange={(val) => setUnitType(val === "Air to water" ? "air_to_water" : "water_to_water")} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("mod")}</label><Combobox options={["Cooling"]} value="Cooling" getLabel={display} onChange={() => {}} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("compressor")}</label><Combobox options={compressorOptions} value={compressorValue ? compressorLabel(compressorValue) : SELECT.compressor} getLabel={display} onChange={(label) => setCompressorSpecsId(compressorList.find((s) => compressorLabel(s) === label)?.id ?? null)} className={`${styles.comboBox} ${compressorSpecsId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("evaporator")}</label><Combobox options={evaporatorOptions} value={evaporatorValue ? specLabel(evaporatorValue) : SELECT.evaporator} getLabel={display} onChange={(label) => setEvaporatorSpecsId(evaporatorList.find((s) => specLabel(s) === label)?.id ?? null)} className={`${styles.comboBox} ${evaporatorSpecsId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("condenser")}</label><Combobox options={condenserOptions} value={condenserValue ? specLabel(condenserValue) : SELECT.condenser} getLabel={display} onChange={(label) => setCondenserSpecsId(condenserList.find((s) => specLabel(s) === label)?.id ?? null)} className={`${styles.comboBox} ${condenserSpecsId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("expansionValve")}</label><Combobox options={expansionValveOptions} value={expansionValveValue ? specLabel(expansionValveValue) : SELECT.expansionValve} getLabel={display} onChange={(label) => setExpansionValveSpecsId(expansionValveList.find((s) => specLabel(s) === label)?.id ?? null)} className={`${styles.comboBox} ${expansionValveSpecsId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("reversingValve")}</label><Combobox options={reversingValveOptions} value={reversingValveValue ? specLabel(reversingValveValue) : SELECT.reversingValve} getLabel={display} onChange={(label) => setReversingValveSpecsId(reversingValveList.find((s) => specLabel(s) === label)?.id ?? null)} className={`${styles.comboBox} ${reversingValveSpecsId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("chasis")}</label><Combobox options={chassisOptions} value={chassisValue ? chassisLabel(chassisValue) : SELECT.chassis} getLabel={display} onChange={(label) => setChassisId(chassisList.find((c) => chassisLabel(c) === label)?.id ?? null)} className={`${styles.comboBox} ${chassisId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
                                    <div className={styles.formField}><label>{t("refrigerant")}</label><Combobox options={refrigerantOptions} value={refrigerantValue ? refrigerantLabel(refrigerantValue) : SELECT.refrigerant} getLabel={display} onChange={(label) => setRefrigerantId(refrigerantList.find((r) => refrigerantLabel(r) === label)?.id ?? null)} className={`${styles.comboBox} ${refrigerantId === null ? styles.placeholderText : ''}`} containerClassName={styles.comboboxContainerOverride} /></div>
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
                                    <div className={styles.formField}><label>{t("fanType")}</label><Combobox options={["EC"]} value={fanType} getLabel={display} onChange={setFanType} className={styles.comboBox} containerClassName={styles.comboboxContainerOverride} /></div>
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
                        <div className={styles.stepNavContainer}>
                            <div className={styles.stepNavLeft}>
                                {activeTab !== 'model' && <button className={styles.stepBtn} onClick={() => setActiveTab(activeTab === 'calc' ? 'tech' : 'model')}>{t("previous")}</button>}
                                {activeTab !== 'calc' && <button className={styles.stepBtn} disabled={activeTab === 'model' && !modelComplete} onClick={() => { setActiveTab(activeTab === 'model' ? 'tech' : 'calc'); scrollToFormTop(); }}>{t("next")}</button>}
                            </div>
                            {activeTab === 'calc' && (
                                <div className={styles.stepNavRight}>
                                    {selectedChillerId !== null && <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e' }} onClick={handleDelete} disabled={submitting}>{t("delete")}</button>}
                                    <button className={styles.cancelBtn} onClick={handleCancel}>{t("cancel")}</button>
                                    <button className={styles.saveBtn} onClick={handleSave} disabled={submitting}>{submitting ? t("saving") : t("save")}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
