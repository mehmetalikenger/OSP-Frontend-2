import Navbar from "@/components/Navbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* The Navbar stays fixed at the top of every page in this group */}
            <Navbar />

            {/* This is where your individual pages (like /profile or /units) will inject their UI */}
            <main className="flex-1 p-6 bg-slate-50">
                {children}
            </main>
        </div>
    );
}