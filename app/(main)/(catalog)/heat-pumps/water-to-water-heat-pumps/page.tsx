"use client";
import UnitCatalogPage from "../../UnitCatalogPage";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function WaterToWaterHeatPumpsPage() {
    return (
        <UnitCatalogPage
            title="Water to Water Heat Pumps"
            apiUrl={`${API}/units/heat-pumps?type=WW`}
            calcRoute="/calculation/water-to-water-heat-pump"
            altText="Water to Water Heat Pump"
        />
    );
}
