import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/serverApi";
import UnitCatalogPage, { UnitPage } from "../../UnitCatalogPage";

// Server component: fetch the unit list up front (forwarding the auth cookie) so the
// cards are in the initial HTML. Falls back to null -> client fetch on error.
export default async function WaterToWaterHeatPumpsPage() {
    const t = await getTranslations("Catalog");
    const apiPath = "/units/heat-pumps?type=WW";

    let initialData: UnitPage | null = null;
    try {
        const res = await serverFetch(apiPath);
        if (res.ok) initialData = await res.json();
    } catch {
        // leave null -> client fetches as a fallback
    }

    return (
        <UnitCatalogPage
            title={t("waterToWaterHeatPumps")}
            apiPath={apiPath}
            calcRoute="/calculation/water-to-water-heat-pump"
            altText={t("waterToWaterHeatPumps")}
            initialData={initialData}
        />
    );
}
