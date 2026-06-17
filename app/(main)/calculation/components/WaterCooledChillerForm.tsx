"use client";

import { useState } from "react";
import styles from "../calculation.module.css";
import CalculationModals from "./CalculationModals";

interface CalcDefaults {
    evapIn: number;
    evapOut: number;
    condIn: number;
    condOut: number;
}

interface Props {
    defaults?: CalcDefaults | null;
}

export default function WaterCooledChillerForm({ defaults }: Props) {
    const [isModalsOpen, setIsModalsOpen] = useState(false);

    return (
        <div className={styles.sectionContent}>
            <div className={styles.input}>
                <label htmlFor="distanceForSound">Distance For Sound Pressure Level Calculation (m)</label>
                <input type="number" id="distanceForSound" min="0" />
            </div>
            <div className={`${styles.sectionHeader} ${styles.coolingSectionHeader}`}>
                <h3>Cooling</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingWaterInlet">Water Inlet Temperature (°C)</label>
                <input
                    type="number"
                    id="coolingWaterInlet"
                    key={defaults ? `evapIn-${defaults.evapIn}` : "evapIn-empty"}
                    defaultValue={defaults != null ? defaults.evapIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingWaterOutlet">Water Outlet Temperature (°C)</label>
                <input
                    type="number"
                    id="coolingWaterOutlet"
                    key={defaults ? `evapOut-${defaults.evapOut}` : "evapOut-empty"}
                    defaultValue={defaults != null ? defaults.evapOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingGlycolMixture">Glycol Mixture (%)</label>
                <input type="number" id="coolingGlycolMixture" min="0" />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.input}>
                <label htmlFor="coolingMixtureRatio">Mixture Ratio (%)</label>
                <input type="number" id="coolingMixtureRatio" min="0" />
            </div>
            <div className={`${styles.sectionHeader} ${styles.condenserSectionHeader}`}>
                <h3>Condenser</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="condenserWaterInlet">Water Inlet Temperature (°C)</label>
                <input
                    type="number"
                    id="condenserWaterInlet"
                    key={defaults ? `condIn-${defaults.condIn}` : "condIn-empty"}
                    defaultValue={defaults != null ? defaults.condIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="condenserWaterOutlet">Water Outlet Temperature (°C)</label>
                <input
                    type="number"
                    id="condenserWaterOutlet"
                    key={defaults ? `condOut-${defaults.condOut}` : "condOut-empty"}
                    defaultValue={defaults != null ? defaults.condOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="condenserGlycolMixture">Glycol Mixture (%)</label>
                <input type="number" id="condenserGlycolMixture" min="0" />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.input}>
                <label htmlFor="condenserMixtureRatio">Mixture Ratio (%)</label>
                <input type="number" id="condenserMixtureRatio" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="condenserFoulingFactor">Fouling Factor (m²K/W)</label>
                <input type="number" id="condenserFoulingFactor" min="0" />
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
