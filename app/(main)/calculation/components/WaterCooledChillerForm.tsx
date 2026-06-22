"use client";

import { useState } from "react";
import styles from "../calculation.module.css";
import CalculationModals from "./CalculationModals";
import AdminCombobox from "../../(dashboard)/admin-panel/AdminCombobox";

// Glycol options shared by the mixture/ratio comboboxes.
const GLYCOL_TYPES = ["None", "Ethylene Glycol", "Propylene Glycol"];
const GLYCOL_RATIOS = ["5", "10", "15", "20", "25", "30", "35", "40", "45", "50"];

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
    const [coolingGlycolType, setCoolingGlycolType] = useState("");
    const [coolingGlycolRatio, setCoolingGlycolRatio] = useState("");
    const [condenserGlycolType, setCondenserGlycolType] = useState("");
    const [condenserGlycolRatio, setCondenserGlycolRatio] = useState("");

    return (
        <div className={styles.sectionContent}>
            <div className={styles.input}>
                <label htmlFor="distanceForSound">Distance For Sound Pressure Level Calculation (m)</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="distanceForSound" min="0" />
            </div>
            <div className={`${styles.sectionHeader} ${styles.coolingSectionHeader}`}>
                <h3>Cooling</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingWaterInlet">Water Inlet Temperature (°C)</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="coolingWaterInlet"
                    key={defaults ? `evapIn-${defaults.evapIn}` : "evapIn-empty"}
                    defaultValue={defaults != null ? defaults.evapIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingWaterOutlet">Water Outlet Temperature (°C)</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="coolingWaterOutlet"
                    key={defaults ? `evapOut-${defaults.evapOut}` : "evapOut-empty"}
                    defaultValue={defaults != null ? defaults.evapOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label>Glycol Mixture (%)</label>
                <AdminCombobox
                    value={coolingGlycolType || "None"}
                    options={GLYCOL_TYPES}
                    onChange={(v) => {
                        const val = v === "None" ? "" : v;
                        setCoolingGlycolType(val);
                        if (!val) setCoolingGlycolRatio("");
                    }}
                />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.input}>
                <label>Mixture Ratio (%)</label>
                <AdminCombobox
                    value={coolingGlycolRatio || "Select Ratio"}
                    options={GLYCOL_RATIOS}
                    disabled={!coolingGlycolType}
                    onChange={(v) => setCoolingGlycolRatio(v)}
                />
            </div>
            <div className={`${styles.sectionHeader} ${styles.condenserSectionHeader}`}>
                <h3>Condenser</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="condenserWaterInlet">Water Inlet Temperature (°C)</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="condenserWaterInlet"
                    key={defaults ? `condIn-${defaults.condIn}` : "condIn-empty"}
                    defaultValue={defaults != null ? defaults.condIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="condenserWaterOutlet">Water Outlet Temperature (°C)</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="condenserWaterOutlet"
                    key={defaults ? `condOut-${defaults.condOut}` : "condOut-empty"}
                    defaultValue={defaults != null ? defaults.condOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label>Glycol Mixture (%)</label>
                <AdminCombobox
                    value={condenserGlycolType || "None"}
                    options={GLYCOL_TYPES}
                    onChange={(v) => {
                        const val = v === "None" ? "" : v;
                        setCondenserGlycolType(val);
                        if (!val) setCondenserGlycolRatio("");
                    }}
                />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.input}>
                <label>Mixture Ratio (%)</label>
                <AdminCombobox
                    value={condenserGlycolRatio || "Select Ratio"}
                    options={GLYCOL_RATIOS}
                    disabled={!condenserGlycolType}
                    onChange={(v) => setCondenserGlycolRatio(v)}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="condenserFoulingFactor">Fouling Factor (m²K/W)</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="condenserFoulingFactor" min="0" />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.input}>
                <label htmlFor="calculationMethod">Calculation Method</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="calculationMethod" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="deltaT">ΔT (°C)</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="deltaT" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="foulingFactor">Fouling Factor (m²K/W)</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="foulingFactor" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="heightAboveSeaLevel">Height Above Sea Level (m)</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="heightAboveSeaLevel" min="0" />
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
