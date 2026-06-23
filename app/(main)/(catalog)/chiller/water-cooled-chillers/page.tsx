import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/serverApi";
import UnitCatalogPage, { UnitPage } from "../../UnitCatalogPage";

// Server component: fetch the unit list up front (forwarding the auth cookie) so the
// cards are in the initial HTML. Falls back to null -> client fetch on error.
export default async function WaterCooledChillersPage() {
    const t = await getTranslations("Catalog");
    const apiPath = "/units/chillers?type=WW";

    let initialData: UnitPage | null = null;
    try {
        const res = await serverFetch(apiPath);
        if (res.ok) initialData = await res.json();
    } catch {
        // leave null -> client fetches as a fallback
    }

    return (
        <UnitCatalogPage
            title={t("waterCooledChillers")}
            apiPath={apiPath}
            calcRoute="/calculation/water-cooled-chiller"
            altText={t("waterCooledChillers")}
            initialData={initialData}
        />
    );
}
