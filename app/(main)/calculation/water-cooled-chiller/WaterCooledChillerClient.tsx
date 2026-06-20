"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import ProductAccordion from "../components/ProductAccordion";
import WaterCooledChillerForm from "../components/WaterCooledChillerForm";

const API = process.env.NEXT_PUBLIC_API_URL;

interface CalcAsset { url: string; fileName: string | null; }
interface TechSpec { label: string; value: string; }
interface Defaults { ambient: number; condensation: number; evaporation: number; subcooling: number; superheat: number; evapIn: number; evapOut: number; condIn: number; condOut: number; }
export interface UnitCalcData {
    name: string | null;
    model: string;
    images: CalcAsset[];
    drawings: CalcAsset[];
    documents: CalcAsset[];
    specs: TechSpec[];
    coolingDefaults: Defaults | null;
}

export default function WaterCooledChillerClient({
    id,
    initialData,
}: {
    id: string | null;
    initialData: UnitCalcData | null;
}) {
    const [calcData, setCalcData] = useState<UnitCalcData | null>(initialData);

    // Fallback: only fetch on the client if the server didn't provide the data.
    useEffect(() => {
        if (!id || calcData) return;
        fetchWithAuth(`${API}/units/${id}/calc-data`, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : null))
            .then((data: UnitCalcData | null) => setCalcData(data))
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <ProductAccordion
            title="Water Cooled Chiller"
            unitName={calcData?.name || undefined}
            modelName={calcData?.model || undefined}
            images={calcData?.images}
            drawings={calcData?.drawings}
            documents={calcData?.documents}
            specs={calcData?.specs}
            calculationForm={calcData ? (
                <WaterCooledChillerForm defaults={calcData.coolingDefaults} />
            ) : (
                <WaterCooledChillerForm />
            )}
        />
    );
}
