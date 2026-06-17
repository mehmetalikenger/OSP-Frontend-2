"use client";

import { useState, useEffect } from "react";
import styles from "../addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type ComponentSpecs = { id: number; brand?: string | null; model: string; capacity: number };
type Chassis = { id: number; brand?: string | null; model: string };
type HeatPump = { id: number; model: string; type: string; mods: string[] };

const SELECT = {
    heatPump: "Select Heat Pump",
    compressor: "Select Compressor",
    evaporator: "Select Evaporator",
    condenser: "Select Condenser",
    expansionValve: "Select Expansion Valve",
    reversingValve: "Select Reversing Valve",
    chassis: "Select Chasis",
};

const specLabel = (s: ComponentSpecs) => `${[s.brand, s.model].filter(Boolean).join(" / ")} / ${s.capacity} kW`;
const chassisLabel = (c: Chassis) => [c.brand, c.model].filter(Boolean).join(" / ");
const heatPumpLabel = (h: HeatPump) => `${h.model} (${h.type})`;

export default function AddHeatPumpModPage() {
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
    const [chassisId, setChassisId] = useState<number | null>(null);

    const [compressorList, setCompressorList] = useState<ComponentSpecs[]>([]);
    const [evaporatorList, setEvaporatorList] = useState<ComponentSpecs[]>([]);
    const [condenserList, setCondenserList] = useState<ComponentSpecs[]>([]);
    const [expansionValveList, setExpansionValveList] = useState<ComponentSpecs[]>([]);
    const [reversingValveList, setReversingValveList] = useState<ComponentSpecs[]>([]);
    const [chassisList, setChassisList] = useState<Chassis[]>([]);

    // per-mode tech
    const [capacity, setCapacity] = useState("");
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
        load("/admin/component/chassis", setChassisList);
        loadHeatPumps();
    }, []);

    const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const int = (v: string) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };

    const selectedHeatPump = heatPumps.find((h) => h.id === selectedHeatPumpId);
    const unitType = selectedHeatPump?.type === "WW" ? "water_to_water" : "air_to_water";
    const existingMods = selectedHeatPump?.mods ?? [];
    const availableMods = ["Cooling", "Heating"].filter((m) => !existingMods.includes(m.toUpperCase()));

    const resetModeFields = () => {
        setCompressorSpecsId(null); setEvaporatorSpecsId(null); setCondenserSpecsId(null);
        setExpansionValveSpecsId(null); setReversingValveSpecsId(null); setChassisId(null);
        setCapacity(""); setEer(""); setCop(""); setCondenserRequiredDuty(""); setQuietCondenserRequiredDuty("");
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
            showToast("Please select a heat pump.", "error");
            setActiveTab("model");
            return;
        }
        if (availableMods.length === 0) {
            showToast("This heat pump already has both modes.", "error");
            return;
        }
        if (compressorSpecsId === null || evaporatorSpecsId === null || condenserSpecsId === null ||
            expansionValveSpecsId === null || chassisId === null) {
            showToast("Please select compressor, evaporator, condenser, expansion valve and chassis.", "error");
            setActiveTab("model");
            return;
        }

        const payload = {
            heatPumpId: selectedHeatPumpId,
            mod: unitMod === "cooling" ? "COOLING" : "HEATING",
            modeSpecsDto: {
                capacity: num(capacity),
                copErr: unitMod === "cooling" ? num(eer) : num(cop),
                condenserRequiredDuty: num(condenserRequiredDuty),
                quietCondenserRequiredDuty: num(quietCondenserRequiredDuty),
                compressorSpecsId,
                condenserSpecsId,
                evaporatorSpecsId,
                expansionValveSpecsId,
                chassisId,
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
                showToast(`${unitMod === "cooling" ? "Cooling" : "Heating"} mode added.`, "success");
                resetModeFields();
                setActiveTab("model");
                await loadHeatPumps(); // refresh so the added mode is no longer offered
                setSelectedHeatPumpId(null);
            } else {
                let msg = "Failed to add mode.";
                try {
                    const data = await res.json();
                    msg = data.message || data.error || msg;
                } catch { /* keep default */ }
                showToast(msg, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error.", "error");
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
    const chassisValue = chassisList.find((c) => c.id === chassisId);

    return (
        <div className={styles.sectionsContainer}>
            {toastInfo && (
                <div className={toastInfo.type === "error" ? toastStyles.errorToast : toastStyles.toast}>
                    {toastInfo.message}
                </div>
            )}
            <div className={styles.sectionContent} style={{ maxWidth: "1000px", flex: "none" }}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'model' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('model')}>Mod Details</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={`${styles.breadcrumbItem} ${activeTab === 'calc' ? styles.breadcrumbActive : ''}`} onClick={() => setActiveTab('calc')}>Calculation Values</span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.formSection}>
                    {activeTab === 'model' && (
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label>Heat Pump</label>
                                <Combobox
                                    options={heatPumpOptions}
                                    value={selectedHeatPump ? heatPumpLabel(selectedHeatPump) : SELECT.heatPump}
                                    onChange={handleHeatPumpSelect}
                                    className={`${styles.comboBox} ${selectedHeatPumpId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Mod</label>
                                <Combobox
                                    options={availableMods.length ? availableMods : ["No modes left"]}
                                    value={availableMods.length ? (unitMod === "cooling" ? "Cooling" : "Heating") : "No modes left"}
                                    onChange={(val) => setUnitMod(val === "Cooling" ? "cooling" : "heating")}
                                    className={styles.comboBox}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Compressor</label>
                                <Combobox
                                    options={[SELECT.compressor, ...compressorList.map(specLabel)]}
                                    value={compressorValue ? specLabel(compressorValue) : SELECT.compressor}
                                    onChange={(label) => setCompressorSpecsId(compressorList.find((s) => specLabel(s) === label)?.id ?? null)}
                                    className={`${styles.comboBox} ${compressorSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Evaporator</label>
                                <Combobox
                                    options={[SELECT.evaporator, ...evaporatorList.map(specLabel)]}
                                    value={evaporatorValue ? specLabel(evaporatorValue) : SELECT.evaporator}
                                    onChange={(label) => setEvaporatorSpecsId(evaporatorList.find((s) => specLabel(s) === label)?.id ?? null)}
                                    className={`${styles.comboBox} ${evaporatorSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Condenser</label>
                                <Combobox
                                    options={[SELECT.condenser, ...condenserList.map(specLabel)]}
                                    value={condenserValue ? specLabel(condenserValue) : SELECT.condenser}
                                    onChange={(label) => setCondenserSpecsId(condenserList.find((s) => specLabel(s) === label)?.id ?? null)}
                                    className={`${styles.comboBox} ${condenserSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Expansion Valve</label>
                                <Combobox
                                    options={[SELECT.expansionValve, ...expansionValveList.map(specLabel)]}
                                    value={expansionValveValue ? specLabel(expansionValveValue) : SELECT.expansionValve}
                                    onChange={(label) => setExpansionValveSpecsId(expansionValveList.find((s) => specLabel(s) === label)?.id ?? null)}
                                    className={`${styles.comboBox} ${expansionValveSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>4-way Reversing Valve</label>
                                <Combobox
                                    options={[SELECT.reversingValve, ...reversingValveList.map(specLabel)]}
                                    value={reversingValveValue ? specLabel(reversingValveValue) : SELECT.reversingValve}
                                    onChange={(label) => setReversingValveSpecsId(reversingValveList.find((s) => specLabel(s) === label)?.id ?? null)}
                                    className={`${styles.comboBox} ${reversingValveSpecsId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Chasis</label>
                                <Combobox
                                    options={[SELECT.chassis, ...chassisList.map(chassisLabel)]}
                                    value={chassisValue ? chassisLabel(chassisValue) : SELECT.chassis}
                                    onChange={(label) => setChassisId(chassisList.find((c) => chassisLabel(c) === label)?.id ?? null)}
                                    className={`${styles.comboBox} ${chassisId === null ? styles.placeholderText : ''}`}
                                    containerClassName={styles.comboboxContainerOverride}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Capacity (Kw)</label>
                                <input type="number" className={styles.inputElement} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>EER</label>
                                <input type="number" className={styles.inputElement} value={eer} onChange={(e) => setEer(e.target.value)} disabled={unitMod === 'heating'} />
                            </div>
                            <div className={styles.formField}>
                                <label>COP</label>
                                <input type="number" className={styles.inputElement} value={cop} onChange={(e) => setCop(e.target.value)} disabled={unitMod === 'cooling'} />
                            </div>
                            <div className={styles.formField}>
                                <label>Condenser Required Duty (kW)</label>
                                <input type="number" className={styles.inputElement} value={condenserRequiredDuty} onChange={(e) => setCondenserRequiredDuty(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>Quiet Condenser Required Duty (kW)</label>
                                <input type="number" className={styles.inputElement} value={quietCondenserRequiredDuty} onChange={(e) => setQuietCondenserRequiredDuty(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'calc' && (
                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label>Ambient (°C)</label>
                                <input type="number" className={styles.inputElement} value={ambient} onChange={(e) => setAmbient(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>Evaporator Inlet (°C)</label>
                                <input type="number" className={styles.inputElement} value={evapIn} onChange={(e) => setEvapIn(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>Evaporator Outlet (°C)</label>
                                <input type="number" className={styles.inputElement} value={evapOut} onChange={(e) => setEvapOut(e.target.value)} />
                            </div>
                            <div className={styles.formField}>
                                <label>Condenser Inlet (°C)</label>
                                <input type="number" className={styles.inputElement} value={condIn} onChange={(e) => setCondIn(e.target.value)} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} />
                            </div>
                            <div className={styles.formField}>
                                <label>Condenser Outlet (°C)</label>
                                <input type="number" className={styles.inputElement} value={condOut} onChange={(e) => setCondOut(e.target.value)} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} />
                            </div>
                        </div>
                    )}

                    <div className={styles.stepNavContainer} style={{ marginTop: "25px" }}>
                        <div className={styles.stepNavLeft}>
                            {activeTab !== 'model' && (
                                <button className={styles.stepBtn} onClick={() => setActiveTab('model')}>Previous</button>
                            )}
                            {activeTab !== 'calc' && (
                                <button className={styles.stepBtn} onClick={() => setActiveTab('calc')}>Next</button>
                            )}
                        </div>
                        {activeTab === 'calc' && (
                            <div className={styles.stepNavRight}>
                                <button className={styles.saveBtn} onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? "Adding..." : "Add Details"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
