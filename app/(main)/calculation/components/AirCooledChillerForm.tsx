"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "@/lib/api";
import styles from "../calculation.module.css";
import CalculationModals from "./CalculationModals";

const API = process.env.NEXT_PUBLIC_API_URL;

interface CalcDefaults {
    ambient: number;
    evapIn: number;
    evapOut: number;
}

interface CalcResult {
    refrigeratingCapacity: number;
    powerInput: number;
    copEer: number;
}

interface Props {
    unitId?: string | null;
    defaults?: CalcDefaults | null;
}

export default function AirCooledChillerForm({ unitId, defaults }: Props) {
    const [ambient, setAmbient] = useState("");
    const [evapIn, setEvapIn] = useState("");
    const [evapOut, setEvapOut] = useState("");

    const [result, setResult] = useState<CalcResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const [modalOpen, setModalOpen] = useState(false);

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

    const handleCalculate = async () => {
        if (!unitId) {
            setError("This unit could not be identified. Please reopen it from the catalog.");
            return;
        }

        const a = parseFloat(ambient);
        const wi = parseFloat(evapIn);
        const wo = parseFloat(evapOut);
        if (isNaN(a) || a < -5 || a > 50) {
            setError("Dry bulb ambient temperature must be between -5 and 50 °C.");
            return;
        }
        if (isNaN(wi) || wi < -30 || wi > 25) {
            setError("Water inlet temperature must be between -30 and 25 °C.");
            return;
        }
        if (isNaN(wo) || wo < -35 || wo > 20) {
            setError("Water outlet temperature must be between -35 and 20 °C.");
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
                }),
            });

            if (!res.ok) throw new Error(`Request failed (${res.status})`);

            const data: CalcResult = await res.json();
            setResult(data);
        } catch {
            setError("We couldn't complete the calculation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fmt = (n: number) =>
        n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className={styles.calcLayout}>
            <div className={styles.sectionContent}>
                <div className={styles.calcFormColumn}>
                    <div className={styles.input}>
                        <label htmlFor="glycolMixture">Glycol Mixture</label>
                        <input type="number" id="glycolMixture" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="mixtureRatio">Mixture Ratio (%)</label>
                        <input type="number" id="mixtureRatio" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="distanceForSound">Distance For Sound Pressure Level Calculation (m)</label>
                        <input type="number" id="distanceForSound" min="0" />
                    </div>
                    <div className={`${styles.sectionHeader} ${styles.coolingSectionHeader}`}>
                        <h3>Cooling</h3>
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="dryBulbAmbientTemperature">Dry Bulb Ambient Temperature (°C)</label>
                        <input
                            type="number"
                            id="dryBulbAmbientTemperature"
                            min="-5"
                            max="50"
                            value={ambient}
                            onChange={(e) => setAmbient(e.target.value)}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="waterInletTemperature">Water Inlet Temperature (°C)</label>
                        <input
                            type="number"
                            id="waterInletTemperature"
                            min="-30"
                            max="25"
                            value={evapIn}
                            onChange={(e) => setEvapIn(e.target.value)}
                        />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="waterOutletTemperature">Water Outlet Temperature (°C)</label>
                        <input
                            type="number"
                            id="waterOutletTemperature"
                            min="-35"
                            max="20"
                            value={evapOut}
                            onChange={(e) => setEvapOut(e.target.value)}
                        />
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.input}>
                        <label htmlFor="calculationMethod">Calculation Method</label>
                        <input type="number" id="calculationMethod" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="deltaT">ΔT (°C)</label>
                        <input type="number" id="deltaT" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="foulingFactor">Fouling Factor (m²K/W)</label>
                        <input type="number" id="foulingFactor" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="heightAboveSeaLevel">Height Above Sea Level (m)</label>
                        <input type="number" id="heightAboveSeaLevel" min="0" />
                    </div>
                    <div className={styles.input}>
                        <label htmlFor="minAmbientTemperature">Min. Ambient Temperature (°C)</label>
                        <input type="number" id="minAmbientTemperature" />
                    </div>

                    {error && <p className={styles.calcError}>{error}</p>}

                    <button
                        className={styles.calcBtn}
                        onClick={handleCalculate}
                        disabled={loading}
                    >
                        {loading ? "Calculating…" : "Calculate"}
                    </button>
                </div>
            </div>

            {result && (
                <div className={styles.resultsPanel} ref={resultsRef}>
                    <div className={styles.resultsHeader}>
                        <div className={styles.resultsHeaderTitle}>
                            <h3>Calculation Results</h3>
                        </div>
                        <button
                            className={styles.resultsCloseBtn}
                            onClick={() => setResult(null)}
                            aria-label="Close results"
                        >
                            <img src="/icons/closeBtn.png" className={styles.lightIcon} alt="" />
                            <img src="/icons/closeBtn-second.png" className={styles.darkIcon} alt="" />
                        </button>
                    </div>

                    <div className={styles.resultsGrid}>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>Refrigerating Capacity</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.refrigeratingCapacity)}
                                <span className={styles.resultMetricUnit}>kW</span>
                            </span>
                        </div>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>Power Input</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.powerInput)}
                                <span className={styles.resultMetricUnit}>kW</span>
                            </span>
                        </div>
                        <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>EER</span>
                            <span className={styles.resultMetricValue}>
                                {fmt(result.copEer)}
                            </span>
                        </div>
                    </div>

                    <div className={styles.resultsCardActions}>
                        <button className={styles.btnSecondary} onClick={() => window.print()}>Download Result File</button>
                        <button className={styles.btnPrimary} onClick={() => setModalOpen(true)}>Add to project</button>
                    </div>
                </div>
            )}

            <CalculationModals isOpen={modalOpen} onClose={() => setModalOpen(false)} initialStep="projects" />
        </div>
    );
}
