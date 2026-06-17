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
    coolingDefaults?: CalcDefaults | null;
    heatingDefaults?: CalcDefaults | null;
}

export default function WaterToWaterHeatPumpForm({ coolingDefaults, heatingDefaults }: Props) {
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
                <label htmlFor="coolingEvapInlet">Water Inlet Temperature (°C)</label>
                <input
                    type="number"
                    id="coolingEvapInlet"
                    key={coolingDefaults ? `c-evapIn-${coolingDefaults.evapIn}` : "c-evapIn-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.evapIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingEvapOutlet">Water Outlet Temperature (°C)</label>
                <input
                    type="number"
                    id="coolingEvapOutlet"
                    key={coolingDefaults ? `c-evapOut-${coolingDefaults.evapOut}` : "c-evapOut-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.evapOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingGlycolMixture">Glycol Mixture (%)</label>
                <input type="number" id="coolingGlycolMixture" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingMixtureRatio">Mixture Ratio (%)</label>
                <input type="number" id="coolingMixtureRatio" min="0" />
            </div>
            <div className={`${styles.sectionHeader} ${styles.condenserSectionHeader}`}>
                <h3>Condenser</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingCondInlet">Water Inlet Temperature (°C)</label>
                <input
                    type="number"
                    id="coolingCondInlet"
                    key={coolingDefaults ? `c-condIn-${coolingDefaults.condIn}` : "c-condIn-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.condIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingCondOutlet">Water Outlet Temperature (°C)</label>
                <input
                    type="number"
                    id="coolingCondOutlet"
                    key={coolingDefaults ? `c-condOut-${coolingDefaults.condOut}` : "c-condOut-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.condOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="condenserGlycolMixture">Glycol Mixture (%)</label>
                <input type="number" id="condenserGlycolMixture" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="condenserMixtureRatio">Mixture Ratio (%)</label>
                <input type="number" id="condenserMixtureRatio" min="0" />
            </div>
            <div className={`${styles.sectionHeader} ${styles.heatingSectionHeader}`}>
                <h3>Heating</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingSourceInlet">Source Water Inlet Temperature (°C)</label>
                <input
                    type="number"
                    id="heatingSourceInlet"
                    key={heatingDefaults ? `h-evapIn-${heatingDefaults.evapIn}` : "h-evapIn-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.evapIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingSourceOutlet">Source Water Outlet Temperature (°C)</label>
                <input
                    type="number"
                    id="heatingSourceOutlet"
                    key={heatingDefaults ? `h-evapOut-${heatingDefaults.evapOut}` : "h-evapOut-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.evapOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingSupplyInlet">Supply Water Inlet Temperature (°C)</label>
                <input
                    type="number"
                    id="heatingSupplyInlet"
                    key={heatingDefaults ? `h-condIn-${heatingDefaults.condIn}` : "h-condIn-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.condIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingSupplyOutlet">Supply Water Outlet Temperature (°C)</label>
                <input
                    type="number"
                    id="heatingSupplyOutlet"
                    key={heatingDefaults ? `h-condOut-${heatingDefaults.condOut}` : "h-condOut-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.condOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingGlycolMixture">Glycol Mixture (%)</label>
                <input type="number" id="heatingGlycolMixture" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingMixtureRatio">Mixture Ratio (%)</label>
                <input type="number" id="heatingMixtureRatio" min="0" />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.input}>
                <label htmlFor="foulingFactor">Fouling Factor (m²K/W)</label>
                <input type="number" id="foulingFactor" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="calculationMethod">Calculation Method</label>
                <input type="number" id="calculationMethod" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="deltaT">ΔT (°C)</label>
                <input type="number" id="deltaT" min="0" />
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
