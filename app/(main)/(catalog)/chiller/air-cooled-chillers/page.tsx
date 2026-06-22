import { serverFetch } from "@/lib/serverApi";
import UnitCatalogPage, { UnitPage } from "../../UnitCatalogPage";

// Server component: fetch the unit list up front (forwarding the auth cookie) so the
// cards are in the initial HTML. Falls back to null -> client fetch on error.
export default async function AirCooledChillersPage() {
    const apiPath = "/units/chillers?type=AW";

    let initialData: UnitPage | null = null;
    try {
        const res = await serverFetch(apiPath);
        if (res.ok) initialData = await res.json();
    } catch {
        // leave null -> client fetches as a fallback
    }

    return (
        <UnitCatalogPage
            title="Air Cooled Chillers"
            apiPath={apiPath}
            calcRoute="/calculation/air-cooled-chiller"
            altText="Air Cooled Chiller"
            initialData={initialData}
        />
    );
}
