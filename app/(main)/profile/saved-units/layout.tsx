"use client";

import { useState, createContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import sharedStyles from "../sharedProfile.module.css";
import Combobox from "./Combobox";

export const SavedUnitsContext = createContext<{
    selectedType: string;
    setSelectedType: (val: string) => void;
}>({
    selectedType: "Air to Water",
    setSelectedType: () => {},
});

export default function SavedUnitsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [selectedType, setSelectedType] = useState("");

    let title = "Saved Units";
    let comboboxOptions = ["Air to Water", "Water to Water"];
    if (pathname.includes("/chillers")) {
        title = "Chillers";
        comboboxOptions = ["Air Cooled", "Water Cooled"];
    } else if (pathname.includes("/heat-pumps")) {
        title = "Heat Pumps";
        comboboxOptions = ["Air to Water", "Water to Water"];
    }

    useEffect(() => {
        if (!comboboxOptions.includes(selectedType)) {
            setSelectedType(comboboxOptions[0]);
        }
    }, [pathname, selectedType]);

    return (
        <SavedUnitsContext.Provider value={{ selectedType, setSelectedType }}>
            <div className={sharedStyles.pageContentContainer}>
                <div className={sharedStyles.header}>
                    <div className={sharedStyles.savedUnitsHeaderContent}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className={sharedStyles.headerBullet}></div>
                            <h1>{title}</h1>
                        </div>
                        <Combobox
                            value={selectedType || comboboxOptions[0]}
                            onChange={setSelectedType}
                            options={comboboxOptions}
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
