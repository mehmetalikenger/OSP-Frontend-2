"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "../calculation.module.css";
import CalculationModals from "./CalculationModals";
import AdminCombobox from "../../(dashboard)/admin-panel/AdminCombobox";

// Glycol options shared by the mixture/ratio comboboxes.
const GLYCOL_TYPES = ["None", "Ethylene Glycol", "Propylene Glycol"];
const GLYCOL_RATIOS = ["5", "10", "15", "20", "25", "30", "35", "40", "45", "50"];

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
    const t = useTranslations("Calc");
    const [isModalsOpen, setIsModalsOpen] = useState(false);
    const [glycolType, setGlycolType] = useState("");
    const [glycolRatio, setGlycolRatio] = useState("");

    const glycolLabel = (v: string): string => (({
        "None": t("none"),
        "Ethylene Glycol": t("ethyleneGlycol"),
        "Propylene Glycol": t("propyleneGlycol"),
        "Select Ratio": t("selectRatio"),
    } as Record<string, string>)[v] ?? v);

    return (
        <div className={styles.sectionContent}>
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
                    onChange={(v) => setGlycolRatio(v)}
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
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="coolingDryBulbAmbient"
                    key={coolingDefaults ? `c-ambient-${coolingDefaults.ambient}` : "c-ambient-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.ambient : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingWaterInlet">{t("waterInletTemp")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="coolingWaterInlet"
                    key={coolingDefaults ? `c-evapIn-${coolingDefaults.evapIn}` : "c-evapIn-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.evapIn : ""}
                />
            </div>
            <div className={`${styles.sectionHeader} ${styles.heatingSectionHeader}`}>
                <h3>{t("heating")}</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingDryBulbAmbient">{t("dryBulbAmbient")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="heatingDryBulbAmbient"
                    key={heatingDefaults ? `h-ambient-${heatingDefaults.ambient}` : "h-ambient-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.ambient : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="wetBulbAmbientTemperature">{t("wetBulbAmbient")}</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="wetBulbAmbientTemperature" />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingWaterInlet">{t("waterInletTemp")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="heatingWaterInlet"
                    key={heatingDefaults ? `h-condIn-${heatingDefaults.condIn}` : "h-condIn-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.condIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingWaterOutlet">{t("waterOutletTemp")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="heatingWaterOutlet"
                    key={heatingDefaults ? `h-condOut-${heatingDefaults.condOut}` : "h-condOut-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.condOut : ""}
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
            <button className={styles.calcBtn} onClick={() => setIsModalsOpen(true)}>
                {t("calculate")}
            </button>

            <CalculationModals
                isOpen={isModalsOpen}
                onClose={() => setIsModalsOpen(false)}
            />
        </div>
    );
}
