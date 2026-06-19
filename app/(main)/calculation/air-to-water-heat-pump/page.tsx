"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import ProductAccordion from "../components/ProductAccordion";
import AirToWaterHeatPumpForm from "../components/AirToWaterHeatPumpForm";

const API = process.env.NEXT_PUBLIC_API_URL;

interface CalcAsset { url: string; fileName: string | null; }
interface TechSpec { label: string; value: string; }
interface Defaults { ambient: number; condensation: number; evaporation: number; subcooling: number; superheat: number; evapIn: number; evapOut: number; condIn: number; condOut: number; }
interface UnitCalcData {
    name: string | null;
    model: string;
    images: CalcAsset[];
    drawings: CalcAsset[];
    documents: CalcAsset[];
    specs: TechSpec[];
    coolingDefaults: Defaults | null;
    heatingDefaults: Defaults | null;
}

function AirToWaterHeatPumpContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [calcData, setCalcData] = useState<UnitCalcData | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchWithAuth(`${API}/units/${id}/calc-data`, { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .then((data: UnitCalcData | null) => setCalcData(data))
            .catch(() => {});
    }, [id]);

    return (
        <ProductAccordion
            title="Air to Water Heat Pump"
            unitName={calcData?.name || undefined}
            modelName={calcData?.model || undefined}
            images={calcData?.images}
            drawings={calcData?.drawings}
            documents={calcData?.documents}
            specs={calcData?.specs}
            calculationForm={calcData ? (
                <AirToWaterHeatPumpForm
                    coolingDefaults={calcData.coolingDefaults}
                    heatingDefaults={calcData.heatingDefaults}
                />
            ) : (
                <AirToWaterHeatPumpForm />
            )}
        />
    );
}

export default function AirToWaterHeatPumpPage() {
    return (
        <Suspense>
            <AirToWaterHeatPumpContent />
        </Suspense>
    );
}
