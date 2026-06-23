"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import styles from "../addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type ComponentSpecs = { id: number; brand?: string | null; model: string; capacity: number };
type CompressorSpecs = { id: number; brand?: string | null; model: string; type?: string | null; capacity: number; powerInput: number };
type HeatPump = { id: number; model: string; type: string; mods: string[] };

const SELECT = {
    heatPump: "Select Heat Pump",
    compressor: "Select Compressor",
    evaporator: "Select Evaporator",
    condenser: "Select Condenser",
    expansionValve: "Select Expansion Valve",
    reversingValve: "Select Reversing Valve",
};

const specLabel = (s: ComponentSpecs) => `${s.model} / C: ${s.capacity}`;
const compressorLabel = (s: CompressorSpecs) => `${[s.brand, s.model, s.type].filter(Boolean).join(" / ")} / C: ${s.capacity} / PI: ${s.powerInput}`;
const heatPumpLabel = (h: HeatPump) => `${h.model} (${h.type})`;

export default function AddHeatPumpModPage() {
    const t = useTranslations("AdminUnit");
    const display = (v: string): string => (({
        "Select Heat Pump": t("selectHeatPump"),
        "Select Compressor": t("selectCompressor"),
        "Select Evaporator": t("selectEvaporator"),
        "Select Condenser": t("selectCondenser"),
        "Select Expansion Valve": t("selectExpansionValve"),
        "Select Reversing Valve": t("selectReversingValve"),
        "Cooling": t("cooling"),
        "Heating": t("heating"),
        "No modes left": t("noModesLeft"),
    } as Record<string, string>)[v] ?? v);
    const [activeTab, setActiveTab] = useState("model");

    const [heatPumps, setHeatPumps] = useState<HeatPump[]>([]);
    const [selectedHeatPumpId, setSelectedHeatPumpId] = useState<number | null>(null);
    const [unitMod, setUnitMod] = useState("cooling");

    // per-mode component selections
    const [compressorSpecsId, setCompressorSpecsId] = useState<number | null>(null);
    const [evaporatorSpecsId, setEvaporatorSpecsId] = useState<number | null>(null);
    const [condenserSpecsId, setCondenserSpecsId] = useState<number | null>(null);
    const [expansionValveSpecsId, setExpansionValveSpecsId] = useState<number | null>(null);
    const [reversingValveSpecsId, setReversingValveSpecsId] = useState<number | null>(null);

    const [compressorList, setCompressorList] = useState<CompressorSpecs[]>([]);
    const [evaporatorList, setEvaporatorList] = useState<ComponentSpecs[]>([]);
    const [condenserList, setCondenserList] = useState<ComponentSpecs[]>([]);
    const [expansionValveList, setExpansionValveList] = useState<ComponentSpecs[]>([]);
    const [reversingValveList, setReversingValveList] = useState<ComponentSpecs[]>([]);

    // per-mode tech
    const [capacity, setCapacity] = useState("");
    const [maxCapacity, setMaxCapacity] = useState("");
    const [eer, setEer] = useState("");
    const [cop, setCop] = useState("");
    const [condenserRequiredDuty, setCondenserRequiredDuty] = useState("");
    const [quietCondenserRequiredDuty, setQuietCondenserRequiredDuty] = useState("");

    // per-mode calc
    const [ambient, setAmbient] = useState("");
    const [evapIn, setEvapIn] = useState("");
    const [evapOut, setEvapOut] = useState("");
    const [condIn, setCondIn] = useState("");
    const [condOut, setCondOut] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [toastInfo, setToastInfo] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const scrollToFormTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToastInfo({ message, type });
        setTimeout(() => setToastInfo(null), 3500);
    };

    const loadHeatPumps = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pumps`, { credentials: "include", cache: "no-store" });
            if (res.ok) setHeatPumps(await res.json());
        } catch (e) {
            console.error("Failed to load heat pumps", e);
        }
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
        loadHeatPumps();
    }, []);

    const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

    const selectedHeatPump = heatPumps.find((h) => h.id === selectedHeatPumpId);
    const unitType = selectedHeatPump?.type === "WW" ? "water_to_water" : "air_to_water";
    const existingMods = selectedHeatPump?.mods ?? [];
    const availableMods = ["Cooling", "Heating"].filter((m) => !existingMods.includes(m.toUpperCase()));

    const resetModeFields = () => {
        setCompressorSpecsId(null); setEvaporatorSpecsId(null); setCondenserSpecsId(null);
        setExpansionValveSpecsId(null); setReversingValveSpecsId(null);
        setCapacity(""); setMaxCapacity(""); setEer(""); setCop(""); setCondenserRequiredDuty(""); setQuietCondenserRequiredDuty("");
        setAmbient(""); setEvapIn(""); setEvapOut(""); setCondIn(""); setCondOut("");
    };

    const handleHeatPumpSelect = (label: string) => {
        if (label === SELECT.heatPump) {
            setSelectedHeatPumpId(null);
            resetModeFields();
            return;
        }
        const h = heatPumps.find((x) => heatPumpLabel(x) === label);
        if (h) {
            setSelectedHeatPumpId(h.id);
            const avail = ["Cooling", "Heating"].filter((m) => !h.mods.includes(m.toUpperCase()));
            setUnitMod((avail[0] ?? "Cooling").toLowerCase());
            resetModeFields();
        }
    };

    const handleSubmit = async () => {
        if (selectedHeatPumpId === null) {
            showToast(t("pleaseSelectHeatPump"), "error");
            setActiveTab("model");
            return;
        }
        if (availableMods.length === 0) {
            showToast(t("bothModesExist"), "error");
            return;
        }
        if (compressorSpecsId === null || evaporatorSpecsId === null || condenserSpecsId === null ||
            expansionValveSpecsId === null) {
            showToast(t("selectComponentsMod"), "error");
            setActiveTab("model");
            return;
        }

        const payload = {
            heatPumpId: selectedHeatPumpId,
            mod: unitMod === "cooling" ? "COOLING" : "HEATING",
            modeSpecsDto: {
                capacity: num(capacity),
                maxCapacity: num(maxCapacity),
                copErr: unitMod === "cooling" ? num(eer) : num(cop),
                condenserRequiredDuty: num(condenserRequiredDuty),
                quietCondenserRequiredDuty: num(quietCondenserRequiredDuty),
                compressorSpecsId,
                condenserSpecsId,
                evaporatorSpecsId,
                expansionValveSpecsId,
                fourWayReversingValveSpecsId: reversingValveSpecsId,
            },
            unitDefCalcValuesDTO: {
                ambient: num(ambient),
                evapIn: num(evapIn),
                evapOut: num(evapOut),
                condIn: num(condIn),
                condOut: num(condOut),
            },
        };

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pump/details`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                showToast(t("modeAdded", { mode: unitMod === "cooling" ? t("cooling") : t("heating") }), "success");
                resetModeFields();
                setActiveTab("model");
                await loadHeatPumps(); // refresh so the added mode is no longer offered
                setSelectedHeatPumpId(null);
            } else {
                let msg = t("failedAddMode");
                try {
                    const data = await res.json();
                    msg = data.message || data.error || msg;
                } catch { /* keep default */ }
                showToast(msg, "error");
            }
        } catch (e) {
            console.error(e);
            showToast(t("networkError"), "error");
        } finally {
            setSubmitting(false);
        }
    };

    const heatPumpOptions = [SELECT.heatPump, ...heatPumps.map(heatPumpLabel)];
    const compressorValue = compressorList.find((s) => s.id === compressorSpecsId);
    const evaporatorValue = evaporatorList.find((s) => s.id === evaporatorSpecsId);
    const condenserValue = condenserList.find((s) => s.id === condenserSpecsId);
    const expansionValveValue = expansionValveList.find((s) => s.id === expansionValveSpecsId);
    const reversingValveValue = reversingValveList.find((s) => s.id === reversingValveSpecsId);

    const modelComplete =
        selectedHeatPumpId !== null && compressorSpecsId !== null && evaporatorSpecsId !== null &&
        condenserSpecsId !== null && expansionValveSpecsId !== null;

    return (
        <div className={styles.sectionsContainer}>
            {toastInfo && (
                <div className={toastInfo.type === "error" ? toastStyles.errorToast : toastStyles.toast}>
                    {toastInfo.message}
                </div>
            )}
            <div className={styles.sectionContent} ref={topRef} style={{ maxWidth: "1000px", flex: "none" }}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'model' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('model')}>{t("modDetails")}</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'calc' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('calc')}>{t("calcValues")}</span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.formSection}>
                    {activeTab === 'model' && (
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label>{t("heatPump")}</label>
                                <Combobox
                                    options={heatPumpOptions}
                                    value={selectedHeatPump ? heatPumpLabel(selectedHeatPump) : SELECT.heatPump}
                                    onChange={handleHeatPumpSelect}
                                    getLabel={display}
                                    className={`${styles.comboBox} ${selectedHeatPumpId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("mod")}</label>
                                <Combobox
                                    options={availableMods.length ? availableMods : ["No modes left"]}
                                    value={availableMods.length ? (unitMod === "cooling" ? "Cooling" : "Heating") : "No modes left"}
                                    onChange={(val) => setUnitMod(val === "Cooling" ? "cooling" : "heating")}
                                    getLabel={display}
                                    className={styles.comboBox}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("capacityKw")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("maxCapacityKw")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("eer")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={eer} onChange={(e) => setEer(e.target.value)} disabled={unitMod === 'heating'} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("cop")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={cop} onChange={(e) => setCop(e.target.value)} disabled={unitMod === 'cooling'} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("condenserRequiredDuty")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={condenserRequiredDuty} onChange={(e) => setCondenserRequiredDuty(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("quietCondenserRequiredDuty")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={quietCondenserRequiredDuty} onChange={(e) => setQuietCondenserRequiredDuty(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("compressor")}</label>
                                <Combobox
                                    options={[SELECT.compressor, ...compressorList.map(compressorLabel)]}
                                    value={compressorValue ? compressorLabel(compressorValue) : SELECT.compressor}
                                    onChange={(label) => setCompressorSpecsId(compressorList.find((s) => compressorLabel(s) === label)?.id ?? null)}
                                    getLabel={display}
                                    className={`${styles.comboBox} ${compressorSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("evaporator")}</label>
                                <Combobox
                                    options={[SELECT.evaporator, ...evaporatorList.map(specLabel)]}
                                    value={evaporatorValue ? specLabel(evaporatorValue) : SELECT.evaporator}
                                    onChange={(label) => setEvaporatorSpecsId(evaporatorList.find((s) => specLabel(s) === label)?.id ?? null)}
                                    getLabel={display}
                                    className={`${styles.comboBox} ${evaporatorSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("condenser")}</label>
                                <Combobox
                                    options={[SELECT.condenser, ...condenserList.map(specLabel)]}
                                    value={condenserValue ? specLabel(condenserValue) : SELECT.condenser}
                                    onChange={(label) => setCondenserSpecsId(condenserList.find((s) => specLabel(s) === label)?.id ?? null)}
                                    getLabel={display}
                                    className={`${styles.comboBox} ${condenserSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("expansionValve")}</label>
                                <Combobox
                                    options={[SELECT.expansionValve, ...expansionValveList.map(specLabel)]}
                                    value={expansionValveValue ? specLabel(expansionValveValue) : SELECT.expansionValve}
                                    onChange={(label) => setExpansionValveSpecsId(expansionValveList.find((s) => specLabel(s) === label)?.id ?? null)}
                                    getLabel={display}
                                    className={`${styles.comboBox} ${expansionValveSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("reversingValve")}</label>
                                <Combobox
                                    options={[SELECT.reversingValve, ...reversingValveList.map(specLabel)]}
                                    value={reversingValveValue ? specLabel(reversingValveValue) : SELECT.reversingValve}
                                    onChange={(label) => setReversingValveSpecsId(reversingValveList.find((s) => specLabel(s) === label)?.id ?? null)}
                                    getLabel={display}
                                    className={`${styles.comboBox} ${reversingValveSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'calc' && (
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label>{t("ambient")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={ambient} onChange={(e) => setAmbient(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("evapInlet")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={evapIn} onChange={(e) => setEvapIn(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("evapOutlet")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={evapOut} onChange={(e) => setEvapOut(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("condInlet")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={condIn} onChange={(e) => setCondIn(e.target.value)} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} />
                            </div>
                            <div className={styles.formField}>
                                <label>{t("condOutlet")}</label>
                                <input type="number" onWheel={(e) => e.currentTarget.blur()} className={styles.inputElement} value={condOut} onChange={(e) => setCondOut(e.target.value)} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} />
                            </div>
                        </div>
                    )}

                    <div className={styles.stepNavContainer} style={{ marginTop: "25px" }}>
                        <div className={styles.stepNavLeft}>
                            {activeTab !== 'model' && (
                                <button className={styles.stepBtn} onClick={() => setActiveTab('model')}>{t("previous")}</button>
                            )}
                            {activeTab !== 'calc' && (
                                <button className={styles.stepBtn} disabled={activeTab === 'model' && !modelComplete} onClick={() => { setActiveTab('calc'); scrollToFormTop(); }}>{t("next")}</button>
                            )}
                        </div>
                        {activeTab === 'calc' && (
                            <div className={styles.stepNavRight}>
                                <button className={styles.saveBtn} onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? t("adding") : t("addDetails")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
