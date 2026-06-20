import { serverFetch } from "@/lib/serverApi";
import WaterToWaterHeatPumpClient, { UnitCalcData } from "./WaterToWaterHeatPumpClient";

// Server component: fetch calc-data up front (forwarding the auth cookie) so the
// name/model/specs are in the initial HTML. Falls back to null -> client fetch on error.
export default async function WaterToWaterHeatPumpPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const { id } = await searchParams;

    let initialData: UnitCalcData | null = null;
    if (id) {
        try {
            const res = await serverFetch(`/units/${id}/calc-data`);
            if (res.ok) initialData = await res.json();
        } catch {
            // leave null -> client fetches as a fallback
        }
    }

    return <WaterToWaterHeatPumpClient id={id ?? null} initialData={initialData} />;
}
