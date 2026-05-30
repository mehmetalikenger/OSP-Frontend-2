"use client";

import { useState } from "react";
import styles from "../calculation.module.css";
import CalculationModals from "./CalculationModals";

export default function AirToWaterHeatPumpForm() {
    const [isModalsOpen, setIsModalsOpen] = useState(false);

    return (
        <div className={styles.sectionContent}>
            <div className={styles.input}>
                <label htmlFor="glycolMixture">Glycol Mixture</label>
                <input type="number" id="glycolMixture" />
            </div>
            <div className={styles.input}>
                <label htmlFor="mixtureRatio">Mixture Ratio (%)</label>
                <input type="number" id="mixtureRatio" />
            </div>
            <div className={styles.input}>
                <label htmlFor="distanceForSound">Distance For Sound Pressure Level Calculation (m)</label>
                <input type="number" id="distanceForSound" />
            </div>
            <div className={`${styles.sectionHeader} ${styles.coolingSectionHeader}`}>
                <h3>Cooling</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="dryBulbAmbientTemperature">Dry Bulb Ambient Temperature (°C)</label>
                <input type="number" id="dryBulbAmbientTemperature" />
            </div>
            <div className={styles.input}>
                <label htmlFor="waterInletTemperature">Water Inlet Temperature (°C)</label>
                <input type="number" id="waterInletTemperature" />
            </div>
            <div className={`${styles.sectionHeader} ${styles.heatingSectionHeader}`}>
                <h3>Heating</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="dryBulbAmbientTemperature">Dry Bulb Ambient Temperature (°C)</label>
                <input type="number" id="dryBulbAmbientTemperature" />
            </div>
            <div className={styles.input}>
                <label htmlFor="wetBulbAmbientTemperature">Wet Bulb Ambient Temperature (°C)</label>
                <input type="number" id="wetBulbAmbientTemperature" />
            </div>
            <div className={styles.input}>
                <label htmlFor="waterInletTemperature">Water Inlet Temperature (°C)</label>
                <input type="number" id="waterInletTemperature" />
            </div>
            <div className={styles.input}>
                <label htmlFor="waterOutletTemperature">Water Outlet Temperature (°C)</label>
                <input type="number" id="waterOutletTemperature" />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.input}>
                <label htmlFor="calculationMethod">Calculation Method</label>
                <input type="number" id="calculationMethod" />
            </div>
            <div className={styles.input}>
                <label htmlFor="deltaT">ΔT (°C)</label>
                <input type="number" id="deltaT" />
            </div>
            <div className={styles.input}>
                <label htmlFor="foulingFactor">Fouling Factor (m²K/W)</label>
                <input type="number" id="foulingFactor" />
            </div>
            <div className={styles.input}>
                <label htmlFor="heightAboveSeaLevel">Height Above Sea Level (m)</label>
                <input type="number" id="heightAboveSeaLevel" />
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
