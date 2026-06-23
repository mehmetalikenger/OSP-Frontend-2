"use client";

import { useState, createContext } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import sharedStyles from "../sharedProfile.module.css";
import Combobox from "./Combobox";

// Maps the internal option keys (kept stable for the page logic) to message keys.
const OPTION_LABEL_KEYS: Record<string, string> = {
    "Air to Water": "airToWater",
    "Water to Water": "waterToWater",
    "Air Cooled": "airCooled",
    "Water Cooled": "waterCooled",
};

export const SavedUnitsContext = createContext<{
    selectedType: string;
    setSelectedType: (val: string) => void;
}>({
    selectedType: "Air to Water",
    setSelectedType: () => {},
});

export default function SavedUnitsLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations("SavedUnits");
    const pathname = usePathname();
    const [selectedType, setSelectedType] = useState("");

    // Display-only translation for the combobox; the option values stay in English
    // because the chillers/heat-pumps pages branch on them (e.g. === "Air Cooled").
    const optionLabel = (value: string) =>
        OPTION_LABEL_KEYS[value] ? t(OPTION_LABEL_KEYS[value]) : value;

    let title = t("titleSavedUnits");
    let comboboxOptions = ["Air to Water", "Water to Water"];
    if (pathname.includes("/chillers")) {
        title = t("titleChillers");
        comboboxOptions = ["Air Cooled", "Water Cooled"];
    } else if (pathname.includes("/heat-pumps")) {
        title = t("titleHeatPumps");
        comboboxOptions = ["Air to Water", "Water to Water"];
    }

    const effectiveSelectedType = comboboxOptions.includes(selectedType) ? selectedType : comboboxOptions[0];

    return (
        <SavedUnitsContext.Provider value={{ selectedType: effectiveSelectedType, setSelectedType }}>
            <div className={sharedStyles.pageContentContainer}>
                <div className={sharedStyles.header}>
                    <div className={sharedStyles.savedUnitsHeaderContent}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className={sharedStyles.headerBullet}></div>
                            <h1>{title}</h1>
                        </div>
                        <Combobox
                            value={effectiveSelectedType}
                            onChange={setSelectedType}
                            options={comboboxOptions}
                            getLabel={optionLabel}
                        />
                    </div>
                    <div className={sharedStyles.headerLine}></div>
                </div>
                <div style={{ marginTop: "20px" }}>
                    {children}
                </div>
            </div>
        </SavedUnitsContext.Provider>
    );
}
