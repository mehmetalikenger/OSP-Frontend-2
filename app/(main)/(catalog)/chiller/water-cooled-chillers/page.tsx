import { serverFetch } from "@/lib/serverApi";
import UnitCatalogPage, { UnitCard } from "../../UnitCatalogPage";

// Server component: fetch the unit list up front (forwarding the auth cookie) so the
// cards are in the initial HTML. Falls back to null -> client fetch on error.
export default async function WaterCooledChillersPage() {
    const apiPath = "/units/chillers?type=WW";

    let initialUnits: UnitCard[] | null = null;
    try {
        const res = await serverFetch(apiPath);
        if (res.ok) initialUnits = await res.json();
    } catch {
        // leave null -> client fetches as a fallback
    }

    return (
        <UnitCatalogPage
            title="Water Cooled Chillers"
            apiPath={apiPath}
            calcRoute="/calculation/water-cooled-chiller"
            altText="Water Cooled Chiller"
            initialUnits={initialUnits}
        />
    );
}
