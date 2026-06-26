"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { fetchWithAuth } from "@/lib/api";
import styles from "../calculation.module.css";
import CalculationModals from "./CalculationModals";
import AdminCombobox from "../../(dashboard)/admin-panel/AdminCombobox";

const API = process.env.NEXT_PUBLIC_API_URL;

// Glycol options shared by the mixture/ratio comboboxes.
const GLYCOL_TYPES = ["None", "Ethylene Glycol", "Propylene Glycol"];
const GLYCOL_RATIOS = ["5", "10", "15", "20", "25", "30", "35", "40", "45", "50"];
const FREQUENCIES = ["50", "60"];
const SUCTION_MODES = ["Superheat", "Suction Gas Temp"];

interface CalcDefaults {
    evapIn: number;
    evapOut: number;
    condIn: number;
    condOut: number;
}

interface CalcResult {
    refrigeratingCapacity: number;
    powerInput: number;
    copEer: number;
    flowRate: number;
    pressureDrop: number;
    massFlow: number;
    condenserDuty: number;
    dischargeTemp: number;
    withinEnvelope: boolean;
    faithfulEngine: boolean;
}

interface Props {
    unitId?: string | null;
    coolingDefaults?: CalcDefaults | null;
    heatingDefaults?: CalcDefaults | null;
}

export default function WaterToWaterHeatPumpForm({ unitId, coolingDefaults, heatingDefaults }: Props) {
    const t = useTranslations("Calc");
    const locale = useLocale();
    const glycolLabel = (v: string): string => (({
        "None": t("none"),
        "Ethylene Glycol": t("ethyleneGlycol"),
        "Propylene Glycol": t("propyleneGlycol"),
        "Select Ratio": t("selectRatio"),
    } as Record<string, string>)[v] ?? v);
    const suctionLabel = (v: string): string => (({
        "Superheat": t("superheat"),
        "Suction Gas Temp": t("suctionGasTemp"),
    } as Record<string, string>)[v] ?? v);

    const [coolingGlycolType, setCoolingGlycolType] = useState("");
    const [coolingGlycolRatio, setCoolingGlycolRatio] = useState("");
    const [condenserGlycolType, setCondenserGlycolType] = useState("");
    const [condenserGlycolRatio, setCondenserGlycolRatio] = useState("");
    const [heatingGlycolType, setHeatingGlycolType] = useState("");
    const [heatingGlycolRatio, setHeatingGlycolRatio] = useState("");

    // Cooling inputs: evaporator (chilled water) + condenser water circuits.
    const [coolEvapIn, setCoolEvapIn] = useState("");
    const [coolEvapOut, setCoolEvapOut] = useState("");
    const [coolCondIn, setCoolCondIn] = useState("");
    const [coolCondOut, setCoolCondOut] = useState("");
    // Cooling compressor / refrigerant-cycle inputs.
    const [coolFrequency, setCoolFrequency] = useState("50");
    const [coolSubcooling, setCoolSubcooling] = useState("5");
    const [coolSuctionMode, setCoolSuctionMode] = useState("Superheat");
    const [coolSuctionValue, setCoolSuctionValue] = useState("10");
    // Heating inputs: source (evaporator) + supply (condenser) water circuits.
    const [heatEvapIn, setHeatEvapIn] = useState("");
    const [heatEvapOut, setHeatEvapOut] = useState("");
    const [heatCondIn, setHeatCondIn] = useState("");
    const [heatCondOut, setHeatCondOut] = useState("");
    // Heating compressor / refrigerant-cycle inputs.
    const [heatFrequency, setHeatFrequency] = useState("50");
    const [heatSubcooling, setHeatSubcooling] = useState("5");
    const [heatSuctionMode, setHeatSuctionMode] = useState("Superheat");
    const [heatSuctionValue, setHeatSuctionValue] = useState("10");

    const [coolingResult, setCoolingResult] = useState<CalcResult | null>(null);
    const [heatingResult, setHeatingResult] = useState<CalcResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [langModalOpen, setLangModalOpen] = useState(false);

    // Seed the temperature fields from the unit's per-mode default values once they load.
    useEffect(() => {
        if (coolingDefaults) {
            setCoolEvapIn(String(coolingDefaults.evapIn));
            setCoolEvapOut(String(coolingDefaults.evapOut));
            setCoolCondIn(String(coolingDefaults.condIn));
            setCoolCondOut(String(coolingDefaults.condOut));
        }
    }, [coolingDefaults]);

    useEffect(() => {
        if (heatingDefaults) {
            setHeatEvapIn(String(heatingDefaults.evapIn));
            setHeatEvapOut(String(heatingDefaults.evapOut));
            setHeatCondIn(String(heatingDefaults.condIn));
            setHeatCondOut(String(heatingDefaults.condOut));
        }
    }, [heatingDefaults]);

    const hasResults = coolingResult != null || heatingResult != null;

    useEffect(() => {
        if (hasResults) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [hasResults]);

    // Editing any calc input invalidates the shown results (the download / add-to-project
    // actions read the live fields), so close the results to force a fresh Calculate.
    const onCalcInput = (setter: (v: string) => void) => (value: string) => {
        setter(value);
        setCoolingResult(null);
        setHeatingResult(null);
    };

    // Compressor-cycle fields for a mode, shared by the calculate / report / add-to-project bodies.
    const refrigerantInputs = (freq: string, sub: string, suctMode: string, suctVal: string): Record<string, number> => {
        const base: Record<string, number> = {
            frequencyHz: parseFloat(freq) || 50,
            subcooling: parseFloat(sub) || 0,
        };
        if (suctMode === "Suction Gas Temp") {
            base.suctionGasTemp = parseFloat(suctVal) || 0;
        } else {
            base.superheat = parseFloat(suctVal) || 10;
        }
        return base;
    };

    const handleCalculate = async () => {
        if (!unitId) {
            setError(t("errNoUnit"));
            return;
        }
        if (coolingGlycolType && !coolingGlycolRatio) {
            setError(t("errSelectRatio"));
            return;
        }
        if (heatingGlycolType && !heatingGlycolRatio) {
            setError(t("errSelectRatio"));
            return;
        }

        // Operating-condition ranges (cooling = evaporator/chilled water; heating = supply/hot water).
        const inRange = (v: string, lo: number, hi: number) => {
            const n = parseFloat(v);
            return !isNaN(n) && n >= lo && n <= hi;
        };
        if (!inRange(coolEvapIn, -30, 25)) { setError(t("errCoolInletRange")); return; }
        if (!inRange(coolEvapOut, -25, 20)) { setError(t("errCoolOutletRange")); return; }
        if (!inRange(heatCondIn, 5, 70)) { setError(t("errHeatInletRange")); return; }
        if (!inRange(heatCondOut, 10, 75)) { setError(t("errHeatOutletRange")); return; }

        setLoading(true);
        setError(null);

        const body = (mod: "COOLING" | "HEATING") => ({
            unitId: Number(unitId),
            mod,
            // WW units have no ambient; the backend WW bridge ignores it.
            ambient: 0,
            evapIn: mod === "COOLING" ? (parseFloat(coolEvapIn) || 0) : (parseFloat(heatEvapIn) || 0),
            evapOut: mod === "COOLING" ? (parseFloat(coolEvapOut) || 0) : (parseFloat(heatEvapOut) || 0),
            condIn: mod === "COOLING" ? (parseFloat(coolCondIn) || 0) : (parseFloat(heatCondIn) || 0),
            condOut: mod === "COOLING" ? (parseFloat(coolCondOut) || 0) : (parseFloat(heatCondOut) || 0),
            glycolType: mod === "COOLING" ? (coolingGlycolType || null) : (heatingGlycolType || null),
            glycolPercentage: mod === "COOLING"
                ? (coolingGlycolRatio ? Number(coolingGlycolRatio) : null)
                : (heatingGlycolRatio ? Number(heatingGlycolRatio) : null),
            ...(mod === "COOLING"
                ? refrigerantInputs(coolFrequency, coolSubcooling, coolSuctionMode, coolSuctionValue)
                : refrigerantInputs(heatFrequency, heatSubcooling, heatSuctionMode, heatSuctionValue)),
        });

        try {
            const post = (mod: "COOLING" | "HEATING") =>
                fetchWithAuth(`${API}/units/calculate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(body(mod)),
                }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Request failed (${r.status})`))));

            const [cooling, heating] = await Promise.all([post("COOLING"), post("HEATING")]);
            setCoolingResult(cooling);
            setHeatingResult(heating);
        } catch {
            setError(t("errCalcFailed"));
        } finally {
            setLoading(false);
        }
    };

    // Combined report: both the cooling and heating inputs/outputs in one PDF.
    const handleDownloadReport = async (language: string) => {
        if (!unitId) return;
        setLangModalOpen(false);
        setDownloading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`${API}/units/${Number(unitId)}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    mod: "COOLING",
                    ambient: 0,
                    evapIn: parseFloat(coolEvapIn) || 0,
                    evapOut: parseFloat(coolEvapOut) || 0,
                    condIn: parseFloat(coolCondIn) || 0,
                    condOut: parseFloat(coolCondOut) || 0,
                    // Heat pumps render a dual-mode PDF: the heating block is included too.
                    dualMode: true,
                    heatingAmbient: 0,
                    heatingWaterInlet: parseFloat(heatCondIn) || 0,
                    heatingWaterOutlet: parseFloat(heatCondOut) || 0,
                    ...refrigerantInputs(coolFrequency, coolSubcooling, coolSuctionMode, coolSuctionValue),
                    heatingFrequencyHz: parseFloat(heatFrequency) || 50,
                    heatingSubcooling: parseFloat(heatSubcooling) || 0,
                    ...(heatSuctionMode === "Suction Gas Temp"
                        ? { heatingSuctionGasTemp: parseFloat(heatSuctionValue) || 0 }
                        : { heatingSuperheat: parseFloat(heatSuctionValue) || 10 }),
                    glycolType: coolingGlycolType || null,
                    glycolPercentage: coolingGlycolRatio ? Number(coolingGlycolRatio) : null,
                    language,
                }),
            });
            if (!res.ok) throw new Error(`Request failed (${res.status})`);

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "unit-report.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch {
            setError(t("errReportFailed"));
        } finally {
            setDownloading(false);
        }
    };

    const fmt = (n: number) =>
        n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });

    // One result panel for a mode. `heating` switches the capacity/efficiency labels.
    const resultPanel = (r: CalcResult, heating: boolean) => (
        <>
            {r.faithfulEngine && !r.withinEnvelope && (
                <p className={styles.calcError}>{t("envelopeWarning")}</p>
            )}
            <div className={styles.resultsGrid}>
                <div className={styles.resultMetric}>
                    <span className={styles.resultMetricLabel}>{heating ? t("heatingCapacity") : t("refrigeratingCapacity")}</span>
                    <span className={styles.resultMetricValue}>{fmt(r.refrigeratingCapacity)}<span className={styles.resultMetricUnit}>kW</span></span>
                </div>
                <div className={styles.resultMetric}>
                    <span className={styles.resultMetricLabel}>{t("powerInput")}</span>
                    <span className={styles.resultMetricValue}>{fmt(r.powerInput)}<span className={styles.resultMetricUnit}>kW</span></span>
                </div>
                <div className={styles.resultMetric}>
                    <span className={styles.resultMetricLabel}>{heating ? t("cop") : t("eer")}</span>
                    <span className={styles.resultMetricValue}>{fmt(r.copEer)}</span>
                </div>
                <div className={styles.resultMetric}>
                    <span className={styles.resultMetricLabel}>{t("flowRate")}</span>
                    <span className={styles.resultMetricValue}>{fmt(r.flowRate)}<span className={styles.resultMetricUnit}>m³/h</span></span>
                </div>
                <div className={styles.resultMetric}>
                    <span className={styles.resultMetricLabel}>{t("pressureDrop")}</span>
                    <span className={styles.resultMetricValue}>{fmt(r.pressureDrop)}<span className={styles.resultMetricUnit}>kPa</span></span>
                </div>
                <div className={styles.resultMetric}>
                    <span className={styles.resultMetricLabel}>{t("massFlow")}</span>
                    <span className={styles.resultMetricValue}>{fmt(r.massFlow)}<span className={styles.resultMetricUnit}>kg/h</span></span>
                </div>
                <div className={styles.resultMetric}>
                    <span className={styles.resultMetricLabel}>{t("condenserDuty")}</span>
                    <span className={styles.resultMetricValue}>{fmt(r.condenserDuty)}<span className={styles.resultMetricUnit}>kW</span></span>
                </div>
                <div className={styles.resultMetric}>
                    <span className={styles.resultMetricLabel}>{t("dischargeTemp")}</span>
                    <span className={styles.resultMetricValue}>{fmt(r.dischargeTemp)}<span className={styles.resultMetricUnit}>°C</span></span>
                </div>
            </div>
        </>
    );

    return (
        <div className={styles.calcLayout}>
            <div className={styles.sectionContent}>
                <div className={styles.calcFormColumn}>
                    <div className={styles.input}>
                        <label htmlFor="distanceForSound">{t("distanceForSound")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="distanceForSound" min="0" />
                    </div>

                    <div className={`${styles.sectionHeader} ${styles.coolingSectionHeader}`}>
                        <h3>{t("cooling")}</h3>
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="coolingEvapInlet">{t("waterInletTemp")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="coolingEvapInlet" min="-30" max="25"
                            value={coolEvapIn} onChange={(e) => onCalcInput(setCoolEvapIn)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="coolingEvapOutlet">{t("waterOutletTemp")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="coolingEvapOutlet" min="-25" max="20"
                            value={coolEvapOut} onChange={(e) => onCalcInput(setCoolEvapOut)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label>{t("glycolMixturePct")}</label>
                        <AdminCombobox
                            getLabel={glycolLabel}
                            value={coolingGlycolType || "None"}
                            options={GLYCOL_TYPES}
                            onChange={(v) => {
                                const val = v === "None" ? "" : v;
                                setCoolingGlycolType(val);
                                if (!val) setCoolingGlycolRatio("");
                                setCoolingResult(null);
                                setHeatingResult(null);
                            }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label>{t("mixtureRatio")}</label>
                        <AdminCombobox
                            getLabel={glycolLabel}
                            value={coolingGlycolRatio || "Select Ratio"}
                            options={GLYCOL_RATIOS}
                            disabled={!coolingGlycolType}
                            onChange={(v) => { setCoolingGlycolRatio(v); setCoolingResult(null); setHeatingResult(null); }}
                        />
                    </div>

                    <div className={`${styles.sectionHeader} ${styles.condenserSectionHeader}`}>
                        <h3>{t("condenser")}</h3>
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="coolingCondInlet">{t("waterInletTemp")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="coolingCondInlet"
                            value={coolCondIn} onChange={(e) => onCalcInput(setCoolCondIn)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="coolingCondOutlet">{t("waterOutletTemp")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="coolingCondOutlet"
                            value={coolCondOut} onChange={(e) => onCalcInput(setCoolCondOut)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label>{t("glycolMixturePct")}</label>
                        <AdminCombobox
                            getLabel={glycolLabel}
                            value={condenserGlycolType || "None"}
                            options={GLYCOL_TYPES}
                            onChange={(v) => {
                                const val = v === "None" ? "" : v;
                                setCondenserGlycolType(val);
                                if (!val) setCondenserGlycolRatio("");
                                setCoolingResult(null);
                                setHeatingResult(null);
                            }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label>{t("mixtureRatio")}</label>
                        <AdminCombobox
                            getLabel={glycolLabel}
                            value={condenserGlycolRatio || "Select Ratio"}
                            options={GLYCOL_RATIOS}
                            disabled={!condenserGlycolType}
                            onChange={(v) => { setCondenserGlycolRatio(v); setCoolingResult(null); setHeatingResult(null); }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label>{t("frequency")}</label>
                        <AdminCombobox
                            value={coolFrequency}
                            options={FREQUENCIES}
                            onChange={(v) => { setCoolFrequency(v); setCoolingResult(null); setHeatingResult(null); }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="coolingSubcooling">{t("subcooling")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="coolingSubcooling" min="0"
                            value={coolSubcooling} onChange={(e) => onCalcInput(setCoolSubcooling)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label>{t("suctionMode")}</label>
                        <AdminCombobox
                            value={coolSuctionMode}
                            options={SUCTION_MODES}
                            getLabel={suctionLabel}
                            onChange={(v) => { setCoolSuctionMode(v); setCoolingResult(null); setHeatingResult(null); }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="coolingSuctionValue">{coolSuctionMode === "Suction Gas Temp" ? t("suctionGasTemp") : t("superheat")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="coolingSuctionValue"
                            value={coolSuctionValue} onChange={(e) => onCalcInput(setCoolSuctionValue)(e.target.value)} />
                    </div>

                    <div className={`${styles.sectionHeader} ${styles.heatingSectionHeader}`}>
                        <h3>{t("heating")}</h3>
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heatingSourceInlet">{t("sourceWaterInlet")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heatingSourceInlet"
                            value={heatEvapIn} onChange={(e) => onCalcInput(setHeatEvapIn)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heatingSourceOutlet">{t("sourceWaterOutlet")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heatingSourceOutlet"
                            value={heatEvapOut} onChange={(e) => onCalcInput(setHeatEvapOut)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heatingSupplyInlet">{t("supplyWaterInlet")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heatingSupplyInlet" min="5" max="70"
                            value={heatCondIn} onChange={(e) => onCalcInput(setHeatCondIn)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heatingSupplyOutlet">{t("supplyWaterOutlet")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heatingSupplyOutlet" min="10" max="75"
                            value={heatCondOut} onChange={(e) => onCalcInput(setHeatCondOut)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label>{t("glycolMixturePct")}</label>
                        <AdminCombobox
                            getLabel={glycolLabel}
                            value={heatingGlycolType || "None"}
                            options={GLYCOL_TYPES}
                            onChange={(v) => {
                                const val = v === "None" ? "" : v;
                                setHeatingGlycolType(val);
                                if (!val) setHeatingGlycolRatio("");
                                setCoolingResult(null);
                                setHeatingResult(null);
                            }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label>{t("mixtureRatio")}</label>
                        <AdminCombobox
                            getLabel={glycolLabel}
                            value={heatingGlycolRatio || "Select Ratio"}
                            options={GLYCOL_RATIOS}
                            disabled={!heatingGlycolType}
                            onChange={(v) => { setHeatingGlycolRatio(v); setCoolingResult(null); setHeatingResult(null); }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label>{t("frequency")}</label>
                        <AdminCombobox
                            value={heatFrequency}
                            options={FREQUENCIES}
                            onChange={(v) => { setHeatFrequency(v); setCoolingResult(null); setHeatingResult(null); }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heatingSubcooling">{t("subcooling")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heatingSubcooling" min="0"
                            value={heatSubcooling} onChange={(e) => onCalcInput(setHeatSubcooling)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label>{t("suctionMode")}</label>
                        <AdminCombobox
                            value={heatSuctionMode}
                            options={SUCTION_MODES}
                            getLabel={suctionLabel}
                            onChange={(v) => { setHeatSuctionMode(v); setCoolingResult(null); setHeatingResult(null); }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heatingSuctionValue">{heatSuctionMode === "Suction Gas Temp" ? t("suctionGasTemp") : t("superheat")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heatingSuctionValue"
                            value={heatSuctionValue} onChange={(e) => onCalcInput(setHeatSuctionValue)(e.target.value)} />
                    </div>

                    <div className={styles.divider}></div>
                    <div className={styles.input}>
                        <label htmlFor="foulingFactor">{t("foulingFactor")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="foulingFactor" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="calculationMethod">{t("calcMethod")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="calculationMethod" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="deltaT">{t("deltaT")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="deltaT" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heightAboveSeaLevel">{t("heightAboveSea")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heightAboveSeaLevel" min="0" />
                    </div>

                    {error && <p className={styles.calcError}>{error}</p>}

                    <button className={styles.calcBtn} onClick={handleCalculate} disabled={loading}>
                        {loading ? t("calculating") : t("calculate")}
                    </button>
                </div>
            </div>

            {hasResults && (
                <div className={styles.resultsPanel} ref={resultsRef}>
                    <div className={styles.resultsHeader}>
                        <div className={styles.resultsHeaderTitle}>
                            <h3>{t("calcResults")}</h3>
                        </div>
                        <button
                            className={styles.resultsCloseBtn}
                            onClick={() => { setCoolingResult(null); setHeatingResult(null); }}
                            aria-label={t("closeResults")}
                        >
                            <img src="/icons/closeBtn.png" className={styles.lightIcon} alt="" />
                            <img src="/icons/closeBtn-second.png" className={styles.darkIcon} alt="" />
                        </button>
                    </div>

                    {coolingResult && (
                        <>
                            <div className={`${styles.sectionHeader} ${styles.coolingSectionHeader}`}><h3>{t("cooling")}</h3></div>
                            {resultPanel(coolingResult, false)}
                        </>
                    )}
                    {heatingResult && (
                        <>
                            <div className={`${styles.sectionHeader} ${styles.heatingSectionHeader}`}><h3>{t("heating")}</h3></div>
                            {resultPanel(heatingResult, true)}
                        </>
                    )}

                    <div className={styles.resultsCardActions}>
                        <button className={styles.btnSecondary} onClick={() => setLangModalOpen(true)} disabled={downloading}>
                            {downloading ? t("preparing") : t("downloadResultFile")}
                        </button>
                        <button className={styles.btnPrimary} onClick={() => setModalOpen(true)}>{t("addToProject")}</button>
                    </div>
                </div>
            )}

            {langModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalCloseBtn} onClick={() => setLangModalOpen(false)}>
                            <img src="../../icons/closeBtn.png" className={styles.lightIcon} alt="Close" />
                            <img src="../../icons/closeBtn-second.png" className={styles.darkIcon} alt="Close" />
                        </div>
                        <h2>{t("selectLanguage")}</h2>
                        <div className={styles.modalFooter}>
                            <button className={locale === "en" ? styles.langSelected : styles.btnSecondary} onClick={() => handleDownloadReport("en")}>
                                {t("english")}
                            </button>
                            <button className={locale === "de" ? styles.langSelected : styles.btnSecondary} onClick={() => handleDownloadReport("de")}>
                                {t("german")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CalculationModals
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                initialStep="projects"
                calc={{
                    unitId,
                    mod: "COOLING",
                    ambient: 0,
                    evapIn: parseFloat(coolEvapIn) || 0,
                    evapOut: parseFloat(coolEvapOut) || 0,
                    glycolType: coolingGlycolType || null,
                    glycolPercentage: coolingGlycolRatio ? Number(coolingGlycolRatio) : null,
                    ...refrigerantInputs(coolFrequency, coolSubcooling, coolSuctionMode, coolSuctionValue),
                }}
            />
        </div>
    );
}
