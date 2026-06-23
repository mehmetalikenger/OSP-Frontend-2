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
    const t = useTranslations("Calc");
    const glycolLabel = (v: string): string => (({
        "None": t("none"),
        "Ethylene Glycol": t("ethyleneGlycol"),
        "Propylene Glycol": t("propyleneGlycol"),
        "Select Ratio": t("selectRatio"),
    } as Record<string, string>)[v] ?? v);
    const [isModalsOpen, setIsModalsOpen] = useState(false);
    const [coolingGlycolType, setCoolingGlycolType] = useState("");
    const [coolingGlycolRatio, setCoolingGlycolRatio] = useState("");
    const [condenserGlycolType, setCondenserGlycolType] = useState("");
    const [condenserGlycolRatio, setCondenserGlycolRatio] = useState("");
    const [heatingGlycolType, setHeatingGlycolType] = useState("");
    const [heatingGlycolRatio, setHeatingGlycolRatio] = useState("");

    return (
        <div className={styles.sectionContent}>
            <div className={styles.input}>
                <label htmlFor="distanceForSound">{t("distanceForSound")}</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="distanceForSound" min="0" />
            </div>
            <div className={`${styles.sectionHeader} ${styles.coolingSectionHeader}`}>
                <h3>{t("cooling")}</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingEvapInlet">{t("waterInletTemp")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="coolingEvapInlet"
                    key={coolingDefaults ? `c-evapIn-${coolingDefaults.evapIn}` : "c-evapIn-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.evapIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingEvapOutlet">{t("waterOutletTemp")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="coolingEvapOutlet"
                    key={coolingDefaults ? `c-evapOut-${coolingDefaults.evapOut}` : "c-evapOut-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.evapOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label>{t("glycolMixturePct")}</label>
                <AdminCombobox
                    getLabel={glycolLabel}
                    value={coolingGlycolType || "None"}
                    options={GLYCOL_TYPES}
                    onChange={(v) => {
                        const val = v === "None" ? "" : v;
                        setCoolingGlycolType(val);
                        if (!val) setCoolingGlycolRatio("");
                    }}
                />
            </div>
            <div className={styles.input}>
                <label>{t("mixtureRatio")}</label>
                <AdminCombobox
                    getLabel={glycolLabel}
                    value={coolingGlycolRatio || "Select Ratio"}
                    options={GLYCOL_RATIOS}
                    disabled={!coolingGlycolType}
                    onChange={(v) => setCoolingGlycolRatio(v)}
                />
            </div>
            <div className={`${styles.sectionHeader} ${styles.condenserSectionHeader}`}>
                <h3>{t("condenser")}</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingCondInlet">{t("waterInletTemp")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="coolingCondInlet"
                    key={coolingDefaults ? `c-condIn-${coolingDefaults.condIn}` : "c-condIn-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.condIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="coolingCondOutlet">{t("waterOutletTemp")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="coolingCondOutlet"
                    key={coolingDefaults ? `c-condOut-${coolingDefaults.condOut}` : "c-condOut-empty"}
                    defaultValue={coolingDefaults != null ? coolingDefaults.condOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label>{t("glycolMixturePct")}</label>
                <AdminCombobox
                    getLabel={glycolLabel}
                    value={condenserGlycolType || "None"}
                    options={GLYCOL_TYPES}
                    onChange={(v) => {
                        const val = v === "None" ? "" : v;
                        setCondenserGlycolType(val);
                        if (!val) setCondenserGlycolRatio("");
                    }}
                />
            </div>
            <div className={styles.input}>
                <label>{t("mixtureRatio")}</label>
                <AdminCombobox
                    getLabel={glycolLabel}
                    value={condenserGlycolRatio || "Select Ratio"}
                    options={GLYCOL_RATIOS}
                    disabled={!condenserGlycolType}
                    onChange={(v) => setCondenserGlycolRatio(v)}
                />
            </div>
            <div className={`${styles.sectionHeader} ${styles.heatingSectionHeader}`}>
                <h3>{t("heating")}</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingSourceInlet">{t("sourceWaterInlet")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="heatingSourceInlet"
                    key={heatingDefaults ? `h-evapIn-${heatingDefaults.evapIn}` : "h-evapIn-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.evapIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingSourceOutlet">{t("sourceWaterOutlet")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="heatingSourceOutlet"
                    key={heatingDefaults ? `h-evapOut-${heatingDefaults.evapOut}` : "h-evapOut-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.evapOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingSupplyInlet">{t("supplyWaterInlet")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="heatingSupplyInlet"
                    key={heatingDefaults ? `h-condIn-${heatingDefaults.condIn}` : "h-condIn-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.condIn : ""}
                />
            </div>
            <div className={styles.input}>
                <label htmlFor="heatingSupplyOutlet">{t("supplyWaterOutlet")}</label>
                <input
                    type="number" onWheel={(e) => e.currentTarget.blur()}
                    id="heatingSupplyOutlet"
                    key={heatingDefaults ? `h-condOut-${heatingDefaults.condOut}` : "h-condOut-empty"}
                    defaultValue={heatingDefaults != null ? heatingDefaults.condOut : ""}
                />
            </div>
            <div className={styles.input}>
                <label>{t("glycolMixturePct")}</label>
                <AdminCombobox
                    getLabel={glycolLabel}
                    value={heatingGlycolType || "None"}
                    options={GLYCOL_TYPES}
                    onChange={(v) => {
                        const val = v === "None" ? "" : v;
                        setHeatingGlycolType(val);
                        if (!val) setHeatingGlycolRatio("");
                    }}
                />
            </div>
            <div className={styles.input}>
                <label>{t("mixtureRatio")}</label>
                <AdminCombobox
                    getLabel={glycolLabel}
                    value={heatingGlycolRatio || "Select Ratio"}
                    options={GLYCOL_RATIOS}
                    disabled={!heatingGlycolType}
                    onChange={(v) => setHeatingGlycolRatio(v)}
                />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.input}>
                <label htmlFor="foulingFactor">{t("foulingFactor")}</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="foulingFactor" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="calculationMethod">{t("calcMethod")}</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="calculationMethod" min="0" />
            </div>
            <div className={styles.input}>
                <label htmlFor="deltaT">{t("deltaT")}</label>
                <input type="number" onWheel={(e) => e.currentTarget.blur()} id="deltaT" min="0" />
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
