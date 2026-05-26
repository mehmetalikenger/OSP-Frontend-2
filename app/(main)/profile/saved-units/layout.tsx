"use client";

import { useState, createContext } from "react";
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
    const [selectedType, setSelectedType] = useState("Air to Water");

    let title = "Saved Units";
    if (pathname.includes("/chillers")) {
        title = "Chillers";
    } else if (pathname.includes("/heat-pumps")) {
        title = "Heat Pumps";
    }

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
                            value={selectedType}
                            onChange={setSelectedType}
                            options={["Air to Water", "Water to Water"]}
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
