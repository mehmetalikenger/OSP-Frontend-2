import Navbar from "@/components/Navbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 p-6 bg-slate-50">
                {children}
            </main>
        </div>
    );
}