"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type ComponentSpecs = {
    id: number;
    brand?: string | null;
    model: string;
    capacity: number;
};
type Chassis = { id: number; brand?: string | null; model: string };
type Refrigerant = { id: number; name: string; code: string };
type ChillerSummary = { id: number; model: string; type: string };

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

const specLabel = (s: ComponentSpecs) =>
    `${[s.brand, s.model].filter(Boolean).join(" / ")} / ${s.capacity} kW`;
const chassisLabel = (c: Chassis) => [c.brand, c.model].filter(Boolean).join(" / ");
const refrigerantLabel = (r: Refrigerant) => `${r.name} / ${r.code}`;
const chillerLabel = (c: ChillerSummary) => `${c.model} (${c.type})`;
const str = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

export default function Page() {
    const [activeTab, setActiveTab] = useState("model");
    const [unitType, setUnitType] = useState("air_to_water");
    const [unitMod] = useState("cooling");

    // --- Chiller being edited ---
    const [chillers, setChillers] = useState<ChillerSummary[]>([]);
    const [selectedChillerId, setSelectedChillerId] = useState<number | null>(null);

    // --- Model information ---
    const [model, setModel] = useState("");
    const [compressorSpecsId, setCompressorSpecsId] = useState<number | null>(null);
    const [evaporatorSpecsId, setEvaporatorSpecsId] = useState<number | null>(null);
    const [condenserSpecsId, setCondenserSpecsId] = useState<number | null>(null);
    const [expansionValveSpecsId, setExpansionValveSpecsId] = useState<number | null>(null);
    const [reversingValveSpecsId, setReversingValveSpecsId] = useState<number | null>(null);
    const [chassisId, setChassisId] = useState<number | null>(null);
    const [refrigerantId, setRefrigerantId] = useState<number | null>(null);

    // --- Component lists ---
    const [compressorList, setCompressorList] = useState<ComponentSpecs[]>([]);
    const [evaporatorList, setEvaporatorList] = useState<ComponentSpecs[]>([]);
    const [condenserList, setCondenserList] = useState<ComponentSpecs[]>([]);
    const [expansionValveList, setExpansionValveList] = useState<ComponentSpecs[]>([]);
    const [reversingValveList, setReversingValveList] = useState<ComponentSpecs[]>([]);
    const [chassisList, setChassisList] = useState<Chassis[]>([]);
    const [refrigerantList, setRefrigerantList] = useState<Refrigerant[]>([]);

    // --- Calculation values ---
    const [ambient, setAmbient] = useState("");
    const [evapIn, setEvapIn] = useState("");
    const [evapOut, setEvapOut] = useState("");
    const [condIn, setCondIn] = useState("");
    const [condOut, setCondOut] = useState("");

    // --- Tech details ---
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
        load("/admin/unit/chillers", setChillers);
    }, []);

    const num = (v: string) => {
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
    };
    const int = (v: string) => {
        const n = parseInt(v, 10);
        return isNaN(n) ? 0 : n;
    };

    const loadChiller = async (id: number) => {
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/${id}`, { credentials: "include", cache: "no-store" });
            if (!res.ok) {
                showToast("Failed to load chiller.", "error");
                return;
            }
            const d = await res.json();
            setModel(d.model ?? "");
            setUnitType(d.type === "WW" ? "water_to_water" : "air_to_water");

            setCompressorSpecsId(d.compressorSpecsId ?? null);
            setEvaporatorSpecsId(d.evaporatorSpecsId ?? null);
            setCondenserSpecsId(d.condenserSpecsId ?? null);
            setExpansionValveSpecsId(d.expansionValveSpecsId ?? null);
            setReversingValveSpecsId(d.fourWayReversingValveSpecsId ?? null);
            setChassisId(d.chassisId ?? null);
            setRefrigerantId(d.refrigerantId ?? null);

            setAmbient(str(d.ambient));
            setEvapIn(str(d.evapIn));
            setEvapOut(str(d.evapOut));
            setCondIn(str(d.condIn));
            setCondOut(str(d.condOut));

            setCapacity(str(d.capacity));
            setCompressorQty(str(d.compressorQty));
            setCondenserRequiredDuty(str(d.condenserRequiredDuty));
            setQuietCondenserRequiredDuty(str(d.quietCondenserRequiredDuty));
            setFanPI(str(d.fanPI));
            setEer(str(d.copErr));
            setCondenserQty(str(d.condenserQty));
            setNumberOfFans(str(d.numberOfFans));
            setFanDiameter(str(d.fanDiameter));
            setExpansionValveQty(str(d.expansionValveQty));
            setAirflowRate(str(d.airflowRate));
            setDischargeLineDiameter(d.dischargeLineDiameter ?? "");
            setLiquidLineDiameter(d.liquidLineDiameter ?? "");
            setSuctionLineDiameter(d.suctionLineDiameter ?? "");
            setGasTank(str(d.gasTank));
            setWidth(str(d.width));
            setHeight(str(d.height));
            setLength(str(d.length));
        } catch (e) {
            console.error(e);
            showToast("Network error.", "error");
        }
    };

    const handleChillerSelect = (label: string) => {
        if (label === SELECT.chiller) {
            handleCancel();
            return;
        }
        const c = chillers.find((x) => chillerLabel(x) === label);
        if (c) {
            setSelectedChillerId(c.id);
            loadChiller(c.id);
        }
    };

    const handleSave = async () => {
        if (selectedChillerId === null) {
            showToast("Please select a chiller to edit.", "error");
            return;
        }
        if (!model.trim()) {
            showToast("Please enter a model name.", "error");
            setActiveTab("model");
            return;
        }
        if (
            compressorSpecsId === null || evaporatorSpecsId === null || condenserSpecsId === null ||
            expansionValveSpecsId === null || chassisId === null || refrigerantId === null
        ) {
            showToast("Please select compressor, evaporator, condenser, expansion valve, chassis and refrigerant.", "error");
            setActiveTab("model");
            return;
        }

        const payload = {
            chillerDto: {
                model: model.trim(),
                type: unitType === "air_to_water" ? "AW" : "WW",
                mod: "COOLING",
            },
            unitDefCalcValuesDTO: {
                ambient: num(ambient),
                evapIn: num(evapIn),
                evapOut: num(evapOut),
                condIn: num(condIn),
                condOut: num(condOut),
            },
            unitTechSpecsDTO: {
                capacity: num(capacity),
                compressorSpecsId,
                compressorQty: int(compressorQty),
                condenserSpecsId,
                condenserQty: int(condenserQty),
                expansionValveSpecsId,
                expansionValveQty: int(expansionValveQty),
                evaporatorSpecsId,
                chassisId,
                fourWayReversingValveSpecsId: reversingValveSpecsId,
                refrigerantId,
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
            },
        };

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/${selectedChillerId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                showToast("Chiller updated successfully!", "success");
                // refresh the list in case the model changed
                const listRes = await fetchWithAuth(`${API}/admin/unit/chillers`, { credentials: "include", cache: "no-store" });
                if (listRes.ok) setChillers(await listRes.json());
            } else {
                let msg = "Failed to update chiller.";
                try {
                    const data = await res.json();
                    msg = data.message || data.error || msg;
                } catch {
                    /* keep default */
                }
                showToast(msg, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedChillerId(null);
        setModel("");
        setUnitType("air_to_water");
        setCompressorSpecsId(null);
        setEvaporatorSpecsId(null);
        setCondenserSpecsId(null);
        setExpansionValveSpecsId(null);
        setReversingValveSpecsId(null);
        setChassisId(null);
        setRefrigerantId(null);
        setAmbient(""); setEvapIn(""); setEvapOut(""); setCondIn(""); setCondOut("");
        setCapacity(""); setCompressorQty(""); setCondenserRequiredDuty(""); setQuietCondenserRequiredDuty("");
        setFanPI(""); setEer(""); setCondenserQty(""); setNumberOfFans(""); setFanDiameter("");
        setExpansionValveQty(""); setAirflowRate(""); setDischargeLineDiameter(""); setLiquidLineDiameter("");
        setSuctionLineDiameter(""); setGasTank(""); setWidth(""); setHeight(""); setLength("");
        setActiveTab("model");
    };

    const chillerOptions = [SELECT.chiller, ...chillers.map(chillerLabel)];
    const compressorOptions = [SELECT.compressor, ...compressorList.map(specLabel)];
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

    return (
        <div className={styles.sectionsContainer}>
            {toastInfo && (
                <div className={toastInfo.type === "error" ? toastStyles.errorToast : toastStyles.toast}>
                    {toastInfo.message}
                </div>
            )}
            <div className={styles.sectionContent}>
                <div className={styles.breadcrumbContainer}>
                    <span
                        className={`${styles.breadcrumbItem} ${activeTab === 'model' ? styles.breadcrumbActive : ''}`}
                        onClick={() => setActiveTab('model')}
                    >
                        Model Information
                    </span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span
                        className={`${styles.breadcrumbItem} ${activeTab === 'tech' ? styles.breadcrumbActive : ''}`}
                        onClick={() => setActiveTab('tech')}
                    >
                        Tech Details
                    </span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span
                        className={`${styles.breadcrumbItem} ${activeTab === 'calc' ? styles.breadcrumbActive : ''}`}
                        onClick={() => setActiveTab('calc')}
                    >
                        Calculation Values
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            {activeTab === 'model' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Chiller to Edit</label>
                                        <Combobox
                                            options={chillerOptions}
                                            value={selectedChiller ? chillerLabel(selectedChiller) : SELECT.chiller}
                                            onChange={handleChillerSelect}
                                            className={`${styles.comboBox} ${selectedChillerId === null ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Model</label>
                                        <input type="text" className={styles.inputElement} placeholder="Enter model name" value={model} onChange={(e) => setModel(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Type</label>
                                        <Combobox
                                            options={["Air to water", "Water to water"]}
                                            value={unitType === "air_to_water" ? "Air to water" : "Water to water"}
                                            onChange={(val) => setUnitType(val === "Air to water" ? "air_to_water" : "water_to_water")}
                                            className={styles.comboBox}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Mod</label>
                                        <Combobox
                                            options={["Cooling"]}
                                            value="Cooling"
                                            onChange={() => {}}
                                            className={styles.comboBox}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Compressor</label>
                                        <Combobox
                                            options={compressorOptions}
                                            value={compressorValue ? specLabel(compressorValue) : SELECT.compressor}
                                            onChange={(label) => setCompressorSpecsId(compressorList.find((s) => specLabel(s) === label)?.id ?? null)}
                                            className={`${styles.comboBox} ${compressorSpecsId === null ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Evaporator</label>
                                        <Combobox
                                            options={evaporatorOptions}
                                            value={evaporatorValue ? specLabel(evaporatorValue) : SELECT.evaporator}
                                            onChange={(label) => setEvaporatorSpecsId(evaporatorList.find((s) => specLabel(s) === label)?.id ?? null)}
                                            className={`${styles.comboBox} ${evaporatorSpecsId === null ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Condenser</label>
                                        <Combobox
                                            options={condenserOptions}
                                            value={condenserValue ? specLabel(condenserValue) : SELECT.condenser}
                                            onChange={(label) => setCondenserSpecsId(condenserList.find((s) => specLabel(s) === label)?.id ?? null)}
                                            className={`${styles.comboBox} ${condenserSpecsId === null ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Expansion Valve</label>
                                        <Combobox
                                            options={expansionValveOptions}
                                            value={expansionValveValue ? specLabel(expansionValveValue) : SELECT.expansionValve}
                                            onChange={(label) => setExpansionValveSpecsId(expansionValveList.find((s) => specLabel(s) === label)?.id ?? null)}
                                            className={`${styles.comboBox} ${expansionValveSpecsId === null ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>4-way Reversing Valve</label>
                                        <Combobox
                                            options={reversingValveOptions}
                                            value={reversingValveValue ? specLabel(reversingValveValue) : SELECT.reversingValve}
                                            onChange={(label) => setReversingValveSpecsId(reversingValveList.find((s) => specLabel(s) === label)?.id ?? null)}
                                            className={`${styles.comboBox} ${reversingValveSpecsId === null ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Chasis</label>
                                        <Combobox
                                            options={chassisOptions}
                                            value={chassisValue ? chassisLabel(chassisValue) : SELECT.chassis}
                                            onChange={(label) => setChassisId(chassisList.find((c) => chassisLabel(c) === label)?.id ?? null)}
                                            className={`${styles.comboBox} ${chassisId === null ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Refrigerant</label>
                                        <Combobox
                                            options={refrigerantOptions}
                                            value={refrigerantValue ? refrigerantLabel(refrigerantValue) : SELECT.refrigerant}
                                            onChange={(label) => setRefrigerantId(refrigerantList.find((r) => refrigerantLabel(r) === label)?.id ?? null)}
                                            className={`${styles.comboBox} ${refrigerantId === null ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
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

                            {activeTab === 'tech' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Capacity (Kw)</label>
                                        <input type="text" className={styles.inputElement} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Compressor Qty</label>
                                        <input type="text" className={styles.inputElement} value={compressorQty} onChange={(e) => setCompressorQty(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Condenser Required Duty (kW)</label>
                                        <input type="text" className={styles.inputElement} value={condenserRequiredDuty} onChange={(e) => setCondenserRequiredDuty(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Quiet Condenser Required Duty (kW)</label>
                                        <input type="text" className={styles.inputElement} value={quietCondenserRequiredDuty} onChange={(e) => setQuietCondenserRequiredDuty(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Fan Power Input (kW)</label>
                                        <input type="text" className={styles.inputElement} value={fanPI} onChange={(e) => setFanPI(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>EER</label>
                                        <input type="text" className={styles.inputElement} value={eer} onChange={(e) => setEer(e.target.value)} disabled={unitMod === 'heating'} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>COP</label>
                                        <input type="text" className={styles.inputElement} disabled={unitMod === 'cooling'} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Condenser Qty</label>
                                        <input type="text" className={styles.inputElement} value={condenserQty} onChange={(e) => setCondenserQty(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Number of Fans</label>
                                        <input type="text" className={styles.inputElement} value={numberOfFans} onChange={(e) => setNumberOfFans(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Fan Diameter</label>
                                        <input type="text" className={styles.inputElement} value={fanDiameter} onChange={(e) => setFanDiameter(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Expansion Valve Qty</label>
                                        <input type="text" className={styles.inputElement} value={expansionValveQty} onChange={(e) => setExpansionValveQty(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Airflow Rate (m3/h)</label>
                                        <input type="text" className={styles.inputElement} value={airflowRate} onChange={(e) => setAirflowRate(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Discharge Line Diameter</label>
                                        <input type="text" className={styles.inputElement} value={dischargeLineDiameter} onChange={(e) => setDischargeLineDiameter(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Liquid Line Diameter</label>
                                        <input type="text" className={styles.inputElement} value={liquidLineDiameter} onChange={(e) => setLiquidLineDiameter(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Suction Line Diameter</label>
                                        <input type="text" className={styles.inputElement} value={suctionLineDiameter} onChange={(e) => setSuctionLineDiameter(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Gas Tank (L)</label>
                                        <input type="text" className={styles.inputElement} value={gasTank} onChange={(e) => setGasTank(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Width</label>
                                        <input type="text" className={styles.inputElement} value={width} onChange={(e) => setWidth(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Height</label>
                                        <input type="text" className={styles.inputElement} value={height} onChange={(e) => setHeight(e.target.value)} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Length</label>
                                        <input type="text" className={styles.inputElement} value={length} onChange={(e) => setLength(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.seperator}></div>

                    <div className={styles.rightContent}>
                        <div className={styles.uploadSection}>
                    <div className={`${styles.uploadContainer} ${styles.imgContainer}`}>
                        Upload Image
                        <div className={styles.inputContainer}>
                            <input type="file" accept="image/*" multiple className={styles.fileInput} id="image" />
                            <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Images" />
                            <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Images" />
                        </div>
                    </div>
                    <div className={`${styles.drawingContainer} ${styles.uploadContainer}`}>
                        Upload Drawing
                        <div className={styles.inputContainer}>
                            <input type="file" accept=".pdf,.dwg,.dxf" multiple className={styles.fileInput} id="drawing" />
                            <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Drawings" />
                            <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Drawings" />
                        </div>
                    </div>
                    <div className={`${styles.docContainer} ${styles.uploadContainer}`}>
                        Upload File
                        <div className={styles.inputContainer}>
                            <input type="file" accept=".pdf,.doc,.docx" multiple className={styles.fileInput} />
                            <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Documents" id="doc" />
                            <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Documents" />
                        </div>
                    </div>
                    <div className={`${styles.iconContainer} ${styles.uploadContainer}`}>
                        Upload Icon
                        <div className={styles.inputContainer}>
                            <input type="file" accept="image/png, image/svg+xml, .ico" multiple className={styles.fileInput} />
                            <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Icons" id="icon" />
                            <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Icons" />
                        </div>
                    </div>
                </div>
                <div className={styles.stepNavContainer}>
                    <div className={styles.stepNavLeft}>
                        {activeTab !== 'model' && (
                            <button
                                className={styles.stepBtn}
                                onClick={() => setActiveTab(activeTab === 'calc' ? 'tech' : 'model')}
                            >
                                Previous
                            </button>
                        )}
                        {activeTab !== 'calc' && (
                            <button
                                className={styles.stepBtn}
                                onClick={() => setActiveTab(activeTab === 'model' ? 'tech' : 'calc')}
                            >
                                Next
                            </button>
                        )}
                    </div>
                    {activeTab === 'calc' && (
                        <div className={styles.stepNavRight}>
                            <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save'}
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
