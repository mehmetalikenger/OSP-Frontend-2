import { serverFetch } from "@/lib/serverApi";
import AirCooledChillerClient, { UnitCalcData } from "./AirCooledChillerClient";

// Server component: fetch the unit's calc-data on the server (forwarding the user's
// auth cookie) so the name/model/specs are already in the initial HTML — no blank
// flash while the client fetches. If the call fails (e.g. the access token is expired
// at render time), we pass null and the client falls back to its own fetch-with-refresh.
export default async function AirCooledChillerPage({
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
            // leave initialData null -> client fetches as a fallback
        }
    }

    return <AirCooledChillerClient id={id ?? null} initialData={initialData} />;
}
