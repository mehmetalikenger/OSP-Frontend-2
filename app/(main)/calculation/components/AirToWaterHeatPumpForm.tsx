"use client";

import { useState } from "react";
import styles from "../calculation.module.css";
import CalculationModals from "./CalculationModals";

interface CalcDefaults {
    ambient: number;
    evapIn: number;
    evapOut: number;
    condIn: number;
    condOut: number;
}

interface Props {
    coolingDefaults?: CalcDefaults | null;
    heatingDefaults?: CalcDefaults | null;
}

export default function AirToWaterHeatPumpForm({ coolingDefaults, heatingDefaults }: Props) {
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
                <label htmlFor="coolingDryBulbAmbient">Dry Bulb Ambient Temperature (°C)</label>
                <input
                    type="number"
                    id="coolingDryBulbAmbient"
                    key={coolingDefaults ? `c-ambient-${coolingDefaults.ambient}` : "c-ambient-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.ambient : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingWaterInlet">Water Inlet Temperature (°C)</label>
                <input
                    type="number"
                    id="coolingWaterInlet"
                    key={coolingDefaults ? `c-evapIn-${coolingDefaults.evapIn}` : "c-evapIn-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.evapIn : ""}
                />
            </div>
            <div className={`${styles.sectionHeader} ${styles.heatingSectionHeader}`}>
                <h3>Heating</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingDryBulbAmbient">Dry Bulb Ambient Temperature (°C)</label>
                <input
                    type="number"
                    id="heatingDryBulbAmbient"
                    key={heatingDefaults ? `h-ambient-${heatingDefaults.ambient}` : "h-ambient-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.ambient : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="wetBulbAmbientTemperature">Wet Bulb Ambient Temperature (°C)</label>
                <input type="number" id="wetBulbAmbientTemperature" />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingWaterInlet">Water Inlet Temperature (°C)</label>
                <input
                    type="number"
                    id="heatingWaterInlet"
                    key={heatingDefaults ? `h-condIn-${heatingDefaults.condIn}` : "h-condIn-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.condIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingWaterOutlet">Water Outlet Temperature (°C)</label>
                <input
                    type="number"
                    id="heatingWaterOutlet"
                    key={heatingDefaults ? `h-condOut-${heatingDefaults.condOut}` : "h-condOut-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.condOut : ""}
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
