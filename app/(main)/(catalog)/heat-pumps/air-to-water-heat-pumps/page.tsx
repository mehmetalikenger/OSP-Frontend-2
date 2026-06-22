import { serverFetch } from "@/lib/serverApi";
import UnitCatalogPage, { UnitPage } from "../../UnitCatalogPage";

// Server component: fetch the unit list up front (forwarding the auth cookie) so the
// cards are in the initial HTML. Falls back to null -> client fetch on error.
export default async function AirToWaterHeatPumpsPage() {
    const apiPath = "/units/heat-pumps?type=AW";

    let initialData: UnitPage | null = null;
    try {
        const res = await serverFetch(apiPath);
        if (res.ok) initialData = await res.json();
    } catch {
        // leave null -> client fetches as a fallback
    }

    return (
        <UnitCatalogPage
            title="Air to Water Heat Pumps"
            apiPath={apiPath}
            calcRoute="/calculation/air-to-water-heat-pump"
            altText="Air to Water Heat Pump"
            initialData={initialData}
        />
    );
}
