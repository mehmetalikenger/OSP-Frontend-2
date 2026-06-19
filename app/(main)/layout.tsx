import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import DisableNumberInputScroll from "./DisableNumberInputScroll";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isDark = (await cookies()).get("theme")?.value === "dark";

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <DisableNumberInputScroll />
            <Navbar initialDark={isDark} />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </main>
        </div>
    );
}
