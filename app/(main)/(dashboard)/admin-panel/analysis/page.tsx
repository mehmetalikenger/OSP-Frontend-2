"use client";

import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import styles from "./analysis.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import AdminCombobox from "../AdminCombobox";

// Mock Data
const mockUnits = [
    { id: 1, model: "OffiTec Modular High-Capacity Air-Cooled", category: "Chiller", type: "Air to Water", views: 1245 },
    { id: 2, model: "EcoTherm Ground Source Heat Pump", category: "Heat Pump", type: "Water to Water", views: 980 },
    { id: 3, model: "AquaChill Water-Cooled Industrial", category: "Chiller", type: "Water to Water", views: 850 },
    { id: 4, model: "AeroHeat Air Source Packaged", category: "Heat Pump", type: "Air to Water", views: 720 },
    { id: 5, model: "Centrifugal High-Efficiency Chiller", category: "Chiller", type: "Water to Water", views: 650 },
    { id: 6, model: "MiniSplit Residential Heat Pump", category: "Heat Pump", type: "Air to Water", views: 510 },
    { id: 7, model: "Absorption Chiller System", category: "Chiller", type: "Water to Water", views: 420 },
    { id: 8, model: "Hybrid VRF Heat Pump System", category: "Heat Pump", type: "Air to Water", views: 390 },
];

const pieData = [
    { name: 'Chillers', value: 3165, color: 'var(--chiller-color)' },
    { name: 'Heat Pumps', value: 2600, color: 'var(--heatpump-color)' },
];

export default function AnalysisPage() {
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [selectedUnit, setSelectedUnit] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

    useScrollLock(!!selectedUnit);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 500);
        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Derived Data for Filters
    const categories = ["All", ...Array.from(new Set(mockUnits.map(u => u.category)))];
    const types = ["All", ...Array.from(new Set(mockUnits.map(u => u.type)))];

    // Filtered and Sorted Table Data
    const filteredUnits = useMemo(() => {
        return mockUnits.filter(unit => {
            if (categoryFilter !== "All" && unit.category !== categoryFilter) return false;
            if (typeFilter !== "All" && unit.type !== typeFilter) return false;
            return true;
        }).sort((a, b) => sortOrder === "desc" ? b.views - a.views : a.views - b.views);
    }, [categoryFilter, typeFilter, sortOrder]);

    const handleSortClick = () => {
        setSortOrder(prev => prev === "desc" ? "asc" : "desc");
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentGrid}>
                {/* Pie Chart Section */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Unit Distribution Ratio (Views)</h2>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                    stroke="var(--chart-border)"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#333' }}
                                />
                                <Legend 
                                    layout={isMobile ? "horizontal" : "vertical"} 
                                    verticalAlign={isMobile ? "bottom" : "middle"} 
                                    align={isMobile ? "center" : "right"} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table Section */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Most Viewed Units</h2>
                    
                    <div className={styles.filters}>
                        <AdminCombobox
                            value={categoryFilter}
                            onChange={(val) => setCategoryFilter(val)}
                            options={categories}
                            containerClassName={styles.filterCombobox}
                        />
                        <AdminCombobox
                            value={typeFilter}
                            onChange={(val) => setTypeFilter(val)}
                            options={types}
                            containerClassName={styles.filterCombobox}
                        />
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Model Name</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th 
                                        onClick={handleSortClick} 
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                        title="Click to sort by views"
                                    >
                                        Views {sortOrder === "desc" ? "↓" : "↑"}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUnits.length > 0 ? (
                                    filteredUnits.map((unit) => (
                                        <tr key={unit.id}>
                                            <td 
                                                className={styles.modelLink}
                                                onClick={() => setSelectedUnit(unit)}
                                            >
                                                {unit.model}
                                            </td>
                                            <td>{unit.category}</td>
                                            <td>{unit.type}</td>
                                            <td>{unit.views.toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                                            No units found for the selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Unit Details Modal (Adapted from Catalog) */}
            {selectedUnit && (
                <>
                    <div className={styles.modalOverlay} onClick={() => setSelectedUnit(null)}></div>
                    
                    {/* Mobile Modal */}
                    <div className={`${styles.unitDetails} ${styles.unitDetailsMobile}`}>
                        <div className={styles.closeBtn} onClick={() => setSelectedUnit(null)}>
                            <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Close Button" />
                            <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close Button" />
                        </div>
                        <div className={styles.unitDetailContainer}>
                            <div className={styles.unitName}>
                                <h2>{selectedUnit.model}</h2>
                            </div>
                            <div className={styles.unitImage}>
                                <img src="/images/products/745729.png" alt="Product thumbnail" />
                            </div>
                            <div className={styles.unitDesc}>
                                <p>
                                    This high-efficiency {selectedUnit.category.toLowerCase()} is engineered for robust performance 
                                    in diverse industrial environments. Offering superior thermal management and reduced operational costs.
                                </p>
                            </div>
                            <div className={styles.btnIcons}>
                                <div className={styles.icons}>
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                </div>
                                {/* Note: Calculate and Bookmark buttons are hidden as requested */}
                            </div>
                            <div className={styles.unitSpecs}>
                                <h3>Technical Specifications</h3>
                                <ul>
                                    <li>
                                        <span className={styles.specTitle}>Category:</span>
                                        <span className={styles.specValue}>{selectedUnit.category}</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Type:</span>
                                        <span className={styles.specValue}>{selectedUnit.type}</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Total Views:</span>
                                        <span className={styles.specValue}>{selectedUnit.views.toLocaleString()}</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Benefits:</span>
                                        <span className={styles.specValue}>High efficiency, reliable, easy maintenance</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Modal */}
                    <div className={`${styles.unitDetails} ${styles.unitDetailsDesktop}`}>
                        <div className={styles.closeBtn} onClick={() => setSelectedUnit(null)}>
                            <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Close Button" />
                            <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close Button" />
                        </div>
                        <div className={styles.unitDetailContainer}>
                            <div className={styles.unitName}>
                                <h2>{selectedUnit.model}</h2>
                            </div>
                            <div className={styles.unitInfo}>
                                <div className={styles.unitDesc}>
                                    <p>
                                        This high-efficiency {selectedUnit.category.toLowerCase()} is engineered for robust performance 
                                        in diverse industrial environments. Offering superior thermal management and reduced operational costs.
                                    </p>
                                </div>
                                <div className={styles.unitImage}>
                                    <img src="/images/products/745729.png" alt="Product thumbnail" />
                                </div>
                            </div>
                            <div className={styles.btnIcons}>
                                <div className={styles.icons}>
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                </div>
                                {/* Note: Calculate and Bookmark buttons are hidden as requested */}
                            </div>
                            <div className={styles.unitSpecs}>
                                <h3>Technical Specifications</h3>
                                <ul>
                                    <li>
                                        <span className={styles.specTitle}>Category:</span>
                                        <span className={styles.specValue}>{selectedUnit.category}</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Type:</span>
                                        <span className={styles.specValue}>{selectedUnit.type}</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Total Views:</span>
                                        <span className={styles.specValue}>{selectedUnit.views.toLocaleString()}</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Benefits:</span>
                                        <span className={styles.specValue}>High efficiency, reliable, easy maintenance</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
