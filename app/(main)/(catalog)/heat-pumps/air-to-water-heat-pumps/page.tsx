"use client";
import UnitCatalogPage from "../../UnitCatalogPage";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AirToWaterHeatPumpsPage() {
    return (
        <UnitCatalogPage
            title="Air to Water Heat Pumps"
            apiUrl={`${API}/units/heat-pumps?type=AW`}
            calcRoute="/calculation/air-to-water-heat-pump"
            altText="Air to Water Heat Pump"
        />
    );
}
