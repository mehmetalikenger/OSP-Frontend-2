"use client";
import UnitCatalogPage from "../../UnitCatalogPage";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AirCooledChillersPage() {
    return (
        <UnitCatalogPage
            title="Air Cooled Chillers"
            apiUrl={`${API}/units/chillers?type=AW`}
            calcRoute="/calculation/air-cooled-chiller"
            altText="Air Cooled Chiller"
        />
    );
}
