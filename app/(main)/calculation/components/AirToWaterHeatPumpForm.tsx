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
    ambient: number;
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

export default function AirToWaterHeatPumpForm({ unitId, coolingDefaults, heatingDefaults }: Props) {
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

    const [glycolType, setGlycolType] = useState("");
    const [glycolRatio, setGlycolRatio] = useState("");

    // Cooling inputs (evaporator/chilled-water side).
    const [coolAmbient, setCoolAmbient] = useState("");
    const [coolWaterIn, setCoolWaterIn] = useState("");
    const [coolWaterOut, setCoolWaterOut] = useState("");
    // Cooling compressor / refrigerant-cycle inputs.
    const [coolFrequency, setCoolFrequency] = useState("50");
    const [coolSubcooling, setCoolSubcooling] = useState("5");
    const [coolSuctionMode, setCoolSuctionMode] = useState("Superheat");
    const [coolSuctionValue, setCoolSuctionValue] = useState("10");
    // Heating inputs (condenser/hot-water side).
    const [heatAmbient, setHeatAmbient] = useState("");
    const [heatWaterIn, setHeatWaterIn] = useState("");
    const [heatWaterOut, setHeatWaterOut] = useState("");
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
            setCoolAmbient(String(coolingDefaults.ambient));
            setCoolWaterIn(String(coolingDefaults.evapIn));
            setCoolWaterOut(String(coolingDefaults.evapOut));
        }
    }, [coolingDefaults]);

    useEffect(() => {
        if (heatingDefaults) {
            setHeatAmbient(String(heatingDefaults.ambient));
            setHeatWaterIn(String(heatingDefaults.condIn));
            setHeatWaterOut(String(heatingDefaults.condOut));
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
        if (glycolType && !glycolRatio) {
            setError(t("errSelectRatio"));
            return;
        }

        // Operating-condition ranges (cooling = evaporator/chilled water; heating = condenser/hot water).
        const inRange = (v: string, lo: number, hi: number) => {
            const n = parseFloat(v);
            return !isNaN(n) && n >= lo && n <= hi;
        };
        if (!inRange(coolAmbient, -5, 50)) { setError(t("errCoolAmbientRange")); return; }
        if (!inRange(coolWaterIn, -30, 25)) { setError(t("errCoolInletRange")); return; }
        if (!inRange(coolWaterOut, -25, 20)) { setError(t("errCoolOutletRange")); return; }
        if (!inRange(heatAmbient, -20, 40)) { setError(t("errHeatAmbientRange")); return; }
        if (!inRange(heatWaterIn, 5, 70)) { setError(t("errHeatInletRange")); return; }
        if (!inRange(heatWaterOut, 10, 75)) { setError(t("errHeatOutletRange")); return; }

        setLoading(true);
        setError(null);

        const glycolPercentage = glycolRatio ? Number(glycolRatio) : null;
        const body = (mod: "COOLING" | "HEATING") => ({
            unitId: Number(unitId),
            mod,
            ambient: mod === "COOLING" ? (parseFloat(coolAmbient) || 0) : (parseFloat(heatAmbient) || 0),
            evapIn: mod === "COOLING" ? (parseFloat(coolWaterIn) || 0) : 0,
            evapOut: mod === "COOLING" ? (parseFloat(coolWaterOut) || 0) : 0,
            condIn: mod === "HEATING" ? (parseFloat(heatWaterIn) || 0) : 0,
            condOut: mod === "HEATING" ? (parseFloat(heatWaterOut) || 0) : 0,
            glycolType: glycolType || null,
            glycolPercentage,
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
                    ambient: parseFloat(coolAmbient) || 0,
                    evapIn: parseFloat(coolWaterIn) || 0,
                    evapOut: parseFloat(coolWaterOut) || 0,
                    // Heat pumps render a dual-mode PDF: the heating block is included too.
                    dualMode: true,
                    heatingAmbient: parseFloat(heatAmbient) || 0,
                    heatingWaterInlet: parseFloat(heatWaterIn) || 0,
                    heatingWaterOutlet: parseFloat(heatWaterOut) || 0,
                    ...refrigerantInputs(coolFrequency, coolSubcooling, coolSuctionMode, coolSuctionValue),
                    heatingFrequencyHz: parseFloat(heatFrequency) || 50,
                    heatingSubcooling: parseFloat(heatSubcooling) || 0,
                    ...(heatSuctionMode === "Suction Gas Temp"
                        ? { heatingSuctionGasTemp: parseFloat(heatSuctionValue) || 0 }
                        : { heatingSuperheat: parseFloat(heatSuctionValue) || 10 }),
                    glycolType: glycolType || null,
                    glycolPercentage: glycolRatio ? Number(glycolRatio) : null,
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
                        <label>{t("glycolMixture")}</label>
                        <AdminCombobox
                            value={glycolType || "None"}
                            options={GLYCOL_TYPES}
                            getLabel={glycolLabel}
                            onChange={(v) => {
                                const val = v === "None" ? "" : v;
                                setGlycolType(val);
                                if (!val) setGlycolRatio("");
                                setCoolingResult(null);
                                setHeatingResult(null);
                            }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label>{t("mixtureRatio")}</label>
                        <AdminCombobox
                            value={glycolRatio || "Select Ratio"}
                            options={GLYCOL_RATIOS}
                            disabled={!glycolType}
                            getLabel={glycolLabel}
                            onChange={(v) => { setGlycolRatio(v); setCoolingResult(null); setHeatingResult(null); }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="distanceForSound">{t("distanceForSound")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="distanceForSound" min="0" />
                    </div>

                    <div className={`${styles.sectionHeader} ${styles.coolingSectionHeader}`}>
                        <h3>{t("cooling")}</h3>
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="coolingDryBulbAmbient">{t("dryBulbAmbient")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="coolingDryBulbAmbient" min="-5" max="50"
                            value={coolAmbient} onChange={(e) => onCalcInput(setCoolAmbient)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="coolingWaterInlet">{t("waterInletTemp")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="coolingWaterInlet" min="-30" max="25"
                            value={coolWaterIn} onChange={(e) => onCalcInput(setCoolWaterIn)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="coolingWaterOutlet">{t("waterOutletTemp")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="coolingWaterOutlet" min="-25" max="20"
                            value={coolWaterOut} onChange={(e) => onCalcInput(setCoolWaterOut)(e.target.value)} />
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
                        <label htmlFor="heatingDryBulbAmbient">{t("dryBulbAmbient")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heatingDryBulbAmbient" min="-20" max="40"
                            value={heatAmbient} onChange={(e) => onCalcInput(setHeatAmbient)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="wetBulbAmbientTemperature">{t("wetBulbAmbient")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="wetBulbAmbientTemperature" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heatingWaterInlet">{t("waterInletTemp")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heatingWaterInlet" min="5" max="70"
                            value={heatWaterIn} onChange={(e) => onCalcInput(setHeatWaterIn)(e.target.value)} />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heatingWaterOutlet">{t("waterOutletTemp")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heatingWaterOutlet" min="10" max="75"
                            value={heatWaterOut} onChange={(e) => onCalcInput(setHeatWaterOut)(e.target.value)} />
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
                        <label htmlFor="calculationMethod">{t("calcMethod")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="calculationMethod" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="deltaT">{t("deltaT")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="deltaT" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="foulingFactor">{t("foulingFactor")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="foulingFactor" min="0" />
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
                    ambient: parseFloat(coolAmbient) || 0,
                    evapIn: parseFloat(coolWaterIn) || 0,
                    evapOut: parseFloat(coolWaterOut) || 0,
                    glycolType: glycolType || null,
                    glycolPercentage: glycolRatio ? Number(glycolRatio) : null,
                    ...refrigerantInputs(coolFrequency, coolSubcooling, coolSuctionMode, coolSuctionValue),
                }}
            />
        </div>
    );
}
