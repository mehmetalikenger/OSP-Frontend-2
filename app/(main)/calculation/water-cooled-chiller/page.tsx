"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import ProductAccordion from "../components/ProductAccordion";
import WaterCooledChillerForm from "../components/WaterCooledChillerForm";

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
}

function WaterCooledChillerContent() {
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
            title="Water Cooled Chiller"
            modelName={calcData ? (calcData.name || calcData.model) : undefined}
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

export default function WaterCooledChillerPage() {
    return (
        <Suspense>
            <WaterCooledChillerContent />
        </Suspense>
    );
}
