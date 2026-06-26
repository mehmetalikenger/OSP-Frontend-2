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
    defaults?: CalcDefaults | null;
}

export default function AirCooledChillerForm({ unitId, defaults }: Props) {
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
    const [ambient, setAmbient] = useState("");
    const [evapIn, setEvapIn] = useState("");
    const [evapOut, setEvapOut] = useState("");
    const [glycolType, setGlycolType] = useState("");
    const [glycolRatio, setGlycolRatio] = useState("");
    // Compressor / refrigerant-cycle inputs.
    const [frequency, setFrequency] = useState("50");
    const [subcooling, setSubcooling] = useState("5");
    const [suctionMode, setSuctionMode] = useState("Superheat");
    const [suctionValue, setSuctionValue] = useState("10");

    const [result, setResult] = useState<CalcResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const [modalOpen, setModalOpen] = useState(false);
    // The download flow asks the user which language to render the PDF in first.
    const [langModalOpen, setLangModalOpen] = useState(false);

    // Seed the temperature fields from the unit's default cooling values once they load.
    useEffect(() => {
        if (defaults) {
            setAmbient(String(defaults.ambient));
            setEvapIn(String(defaults.evapIn));
            setEvapOut(String(defaults.evapOut));
        }
    }, [defaults]);

    // Scroll to the results once a calculation completes.
    useEffect(() => {
        if (result) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [result]);

    // Compressor-cycle fields shared by the calculate / report / add-to-project bodies.
    const refrigerantInputs = (): Record<string, number> => {
        const base: Record<string, number> = {
            frequencyHz: parseFloat(frequency) || 50,
            subcooling: parseFloat(subcooling) || 0,
        };
        if (suctionMode === "Suction Gas Temp") {
            base.suctionGasTemp = parseFloat(suctionValue) || 0;
        } else {
            base.superheat = parseFloat(suctionValue) || 10;
        }
        return base;
    };

    const handleCalculate = async () => {
        if (!unitId) {
            setError(t("errNoUnit"));
            return;
        }

        const a = parseFloat(ambient);
        const wi = parseFloat(evapIn);
        const wo = parseFloat(evapOut);
        if (isNaN(a) || a < -5 || a > 50) {
            setError(t("errAmbientRange"));
            return;
        }
        if (isNaN(wi) || wi < -30 || wi > 25) {
            setError(t("errInletRange"));
            return;
        }
        if (isNaN(wo) || wo < -35 || wo > 20) {
            setError(t("errOutletRange"));
            return;
        }
        if (glycolType && !glycolRatio) {
            setError(t("errSelectRatio"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetchWithAuth(`${API}/units/calculate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    unitId: Number(unitId),
                    mod: "COOLING",
                    ambient: parseFloat(ambient) || 0,
                    evapIn: parseFloat(evapIn) || 0,
                    evapOut: parseFloat(evapOut) || 0,
                    condIn: 0,
                    condOut: 0,
                    glycolType: glycolType || null,
                    glycolPercentage: glycolRatio ? Number(glycolRatio) : null,
                    ...refrigerantInputs(),
                }),
            });

            if (!res.ok) throw new Error(`Request failed (${res.status})`);

            const data: CalcResult = await res.json();
            setResult(data);
        } catch {
            setError(t("errCalcFailed"));
        } finally {
            setLoading(false);
        }
    };

    // Ask the backend to build the PDF report from the current inputs and download it.
    // `language` ("en"/"de") chooses which localized version of the report to render.
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
                    ambient: parseFloat(ambient) || 0,
                    evapIn: parseFloat(evapIn) || 0,
                    evapOut: parseFloat(evapOut) || 0,
                    glycolType: glycolType || null,
                    glycolPercentage: glycolRatio ? Number(glycolRatio) : null,
                    ...refrigerantInputs(),
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

    // Editing any input that feeds the calculation makes the shown results stale —
    // the Download / Add-to-project actions read the live fields — so close the
    // results panel to force a fresh Calculate before the user can act on them.
    const onCalcInput = (setter: (v: string) => void) => (value: string) => {
        setter(value);
        setResult(null);
    };

    const fmt = (n: number) =>
        n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });

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
                                setResult(null);
                            }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label>{t("mixtureRatio")}</label>
                        <AdminCombobox
                            value={glycolRatio || "Select Ratio"}
                            options={GLYCOL_RATIOS}
                            getLabel={glycolLabel}
                            disabled={!glycolType}
                            onChange={(v) => { setGlycolRatio(v); setResult(null); }}
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
                        <label htmlFor="dryBulbAmbientTemperature">{t("dryBulbAmbient")}</label>
                        <input
                            type="number" onWheel={(e) => e.currentTarget.blur()}
                            id="dryBulbAmbientTemperature"
                            min="-5"
                            max="50"
                            value={ambient}
                            onChange={(e) => onCalcInput(setAmbient)(e.target.value)}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="waterInletTemperature">{t("waterInletTemp")}</label>
                        <input
                            type="number" onWheel={(e) => e.currentTarget.blur()}
                            id="waterInletTemperature"
                            min="-30"
                            max="25"
                            value={evapIn}
                            onChange={(e) => onCalcInput(setEvapIn)(e.target.value)}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="waterOutletTemperature">{t("waterOutletTemp")}</label>
                        <input
                            type="number" onWheel={(e) => e.currentTarget.blur()}
                            id="waterOutletTemperature"
                            min="-35"
                            max="20"
                            value={evapOut}
                            onChange={(e) => onCalcInput(setEvapOut)(e.target.value)}
                        />
                    </div>
                    <div className={styles.input}>
                        <label>{t("frequency")}</label>
                        <AdminCombobox
                            value={frequency}
                            options={FREQUENCIES}
                            onChange={(v) => { setFrequency(v); setResult(null); }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="subcooling">{t("subcooling")}</label>
                        <input
                            type="number" onWheel={(e) => e.currentTarget.blur()}
                            id="subcooling"
                            min="0"
                            value={subcooling}
                            onChange={(e) => onCalcInput(setSubcooling)(e.target.value)}
                        />
                    </div>
                    <div className={styles.input}>
                        <label>{t("suctionMode")}</label>
                        <AdminCombobox
                            value={suctionMode}
                            options={SUCTION_MODES}
                            getLabel={suctionLabel}
                            onChange={(v) => { setSuctionMode(v); setResult(null); }}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="suctionValue">{suctionMode === "Suction Gas Temp" ? t("suctionGasTemp") : t("superheat")}</label>
                        <input
                            type="number" onWheel={(e) => e.currentTarget.blur()}
                            id="suctionValue"
                            value={suctionValue}
                            onChange={(e) => onCalcInput(setSuctionValue)(e.target.value)}
                        />
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
                    <div className={styles.input}>
                        <label htmlFor="minAmbientTemperature">{t("minAmbient")}</label>
                        <input type="number" onWheel={(e) => e.currentTarget.blur()} id="minAmbientTemperature" />
                    </div>

                    {error && <p className={styles.calcError}>{error}</p>}

                    <button
                        className={styles.calcBtn}
                        onClick={handleCalculate}
                        disabled={loading}
                    >
                        {loading ? t("calculating") : t("calculate")}
                    </button>
                </div>
            </div>

            {result && (
                <div className={styles.resultsPanel} ref={resultsRef}>
                    <div className={styles.resultsHeader}>
                        <div className={styles.resultsHeaderTitle}>
                            <h3>{t("calcResults")}</h3>
                        </div>
                        <button
                            className={styles.resultsCloseBtn}
                            onClick={() => setResult(null)}
                            aria-label={t("closeResults")}
                        >
                            <img src="/icons/closeBtn.png" className={styles.lightIcon} alt="" />
                            <img src="/icons/closeBtn-second.png" className={styles.darkIcon} alt="" />
                        </button>
                    </div>

                    {result.faithfulEngine && !result.withinEnvelope && (
                        <p className={styles.calcError}>{t("envelopeWarning")}</p>
                    )}

                    <div className={styles.resultsGrid}>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>{t("refrigeratingCapacity")}</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.refrigeratingCapacity)}
                                <span className={styles.resultMetricUnit}>kW</span>
                            </span>
                        </div>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>{t("powerInput")}</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.powerInput)}
                                <span className={styles.resultMetricUnit}>kW</span>
                            </span>
                        </div>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>{t("eer")}</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.copEer)}
                            </span>
                        </div>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>{t("flowRate")}</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.flowRate)}
                                <span className={styles.resultMetricUnit}>m³/h</span>
                            </span>
                        </div>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>{t("pressureDrop")}</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.pressureDrop)}
                                <span className={styles.resultMetricUnit}>kPa</span>
                            </span>
                        </div>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>{t("massFlow")}</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.massFlow)}
                                <span className={styles.resultMetricUnit}>kg/h</span>
                            </span>
                        </div>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>{t("condenserDuty")}</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.condenserDuty)}
                                <span className={styles.resultMetricUnit}>kW</span>
                            </span>
                        </div>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>{t("dischargeTemp")}</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.dischargeTemp)}
                                <span className={styles.resultMetricUnit}>°C</span>
                            </span>
                        </div>
                    </div>

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
                            <button
                                className={locale === "en" ? styles.langSelected : styles.btnSecondary}
                                onClick={() => handleDownloadReport("en")}
                            >
                                {t("english")}
                            </button>
                            <button
                                className={locale === "de" ? styles.langSelected : styles.btnSecondary}
                                onClick={() => handleDownloadReport("de")}
                            >
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
                    ambient: parseFloat(ambient) || 0,
                    evapIn: parseFloat(evapIn) || 0,
                    evapOut: parseFloat(evapOut) || 0,
                    glycolType: glycolType || null,
                    glycolPercentage: glycolRatio ? Number(glycolRatio) : null,
                    ...refrigerantInputs(),
                }}
            />
        </div>
    );
}
