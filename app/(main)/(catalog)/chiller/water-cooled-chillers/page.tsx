"use client";
import UnitCatalogPage from "../../UnitCatalogPage";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function WaterCooledChillersPage() {
    return (
        <UnitCatalogPage
            title="Water Cooled Chillers"
            apiUrl={`${API}/units/chillers?type=WW`}
            calcRoute="/calculation/water-cooled-chiller"
            altText="Water Cooled Chiller"
        />
    );
}
