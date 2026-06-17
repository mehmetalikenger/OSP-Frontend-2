"use client";

import { useState } from "react";
import styles from "../calculation.module.css";
import CalculationModals from "./CalculationModals";

interface CalcDefaults {
    ambient: number;
    evapIn: number;
    evapOut: number;
}

interface Props {
    defaults?: CalcDefaults | null;
}

export default function AirCooledChillerForm({ defaults }: Props) {
    const [isModalsOpen, setIsModalsOpen] = useState(false);

    return (
        <div className={styles.sectionContent}>
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
                    key={defaults ? `ambient-${defaults.ambient}` : "ambient-empty"}
                    defaultValue={defaults != null ? defaults.ambient : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="waterInletTemperature">Water Inlet Temperature (°C)</label>
                <input
                    type="number"
                    id="waterInletTemperature"
                    key={defaults ? `evapIn-${defaults.evapIn}` : "evapIn-empty"}
                    defaultValue={defaults != null ? defaults.evapIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="waterOutletTemperature">Water Outlet Temperature (°C)</label>
                <input
                    type="number"
                    id="waterOutletTemperature"
                    key={defaults ? `evapOut-${defaults.evapOut}` : "evapOut-empty"}
                    defaultValue={defaults != null ? defaults.evapOut : ""}
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
            <button className={styles.calcBtn} onClick={() => setIsModalsOpen(true)}>
                Calculate
            </button>

            <CalculationModals
                isOpen={isModalsOpen}
                onClose={() => setIsModalsOpen(false)}
            />
        </div>
    );
}
