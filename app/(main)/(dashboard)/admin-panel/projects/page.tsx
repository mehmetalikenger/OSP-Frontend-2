"use client";

import { useState, useMemo } from "react";
import styles from "./projects.module.css";
import AdminCombobox from "../AdminCombobox";

// Mock Data
const mockProjects = [
    { id: 1, projectName: "Alpha Cooling System", username: "john_doe", country: "USA", category: "Chiller", type: "Air to Water", model: "OffiTec Modular", document: "spec_sheet_v1.pdf" },
    { id: 2, projectName: "Beta Heating Plant", username: "sarah_smith", country: "Canada", category: "Heat Pump", type: "Water to Water", model: "EcoTherm Ground Source", document: "installation_guide.pdf" },
    { id: 3, projectName: "Gamma Data Center", username: "tech_guru", country: "UK", category: "Chiller", type: "Water to Water", model: "AquaChill Industrial", document: "blueprint_final.pdf" },
    { id: 4, projectName: "Delta Residential", username: "jane_doe", country: "Australia", category: "Heat Pump", type: "Air to Water", model: "AeroHeat Packaged", document: "warranty_info.pdf" },
    { id: 5, projectName: "Epsilon Office Park", username: "admin_master", country: "Germany", category: "Chiller", type: "Water to Water", model: "Centrifugal High-Efficiency", document: "service_manual.pdf" },
    { id: 6, projectName: "Zeta Factory Cool", username: "industrial_corp", country: "Japan", category: "Chiller", type: "Air to Water", model: "OffiTec Modular", document: "maintenance_log.pdf" },
    { id: 7, projectName: "Eta School District", username: "public_works", country: "France", category: "Heat Pump", type: "Air to Water", model: "MiniSplit Residential", document: "compliance_cert.pdf" },
    { id: 8, projectName: "Theta Supermarket", username: "retail_king", country: "USA", category: "Chiller", type: "Water to Water", model: "Absorption Chiller System", document: "energy_audit.pdf" },
];

export default function ProjectsPage() {
    // Filter States
    const [usernameSearch, setUsernameSearch] = useState("");
    const [countryFilter, setCountryFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    // Derived Data for Combobox Filters
    const countriesList = ["All", ...Array.from(new Set(mockProjects.map(p => p.country)))];
    const categoriesList = ["All", ...Array.from(new Set(mockProjects.map(p => p.category)))];
    const typesList = ["All", ...Array.from(new Set(mockProjects.map(p => p.type)))];

    // Filtered Table Data
    const filteredProjects = useMemo(() => {
        return mockProjects.filter(project => {
            if (usernameSearch.trim() !== "" && !project.username.toLowerCase().includes(usernameSearch.toLowerCase())) return false;
            if (countryFilter !== "All" && project.country !== countryFilter) return false;
            if (categoryFilter !== "All" && project.category !== categoryFilter) return false;
            if (typeFilter !== "All" && project.type !== typeFilter) return false;
            return true;
        });
    }, [usernameSearch, countryFilter, categoryFilter, typeFilter]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header (Title & Total Count) */}
                <div className={styles.pageHeader}>
                    <h2 className={styles.pageTitle}>Projects</h2>
                    <p className={styles.totalCount}>
                        Total Projects {filteredProjects.length}
                    </p>
                </div>

                <div className={styles.contentGrid}>
                    {/* Left Panel: Filters */}
                    <div className={styles.filtersContainer}>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>Category</span>
                            <AdminCombobox
                                value={categoryFilter}
                                onChange={(val) => setCategoryFilter(val)}
                                options={categoriesList}
                                containerClassName={styles.filterCombobox}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>Type</span>
                            <AdminCombobox
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val)}
                                options={typesList}
                                containerClassName={styles.filterCombobox}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>Country</span>
                            <AdminCombobox
                                value={countryFilter}
                                onChange={(val) => setCountryFilter(val)}
                                options={countriesList}
                                containerClassName={styles.filterCombobox}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>Username</span>
                            <input 
                                type="text"
                                className={styles.textInput}
                                placeholder="Search username..."
                                value={usernameSearch}
                                onChange={(e) => setUsernameSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Right Panel: Data Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Project Name</th>
                                    <th>Username</th>
                                    <th>Country</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Model</th>
                                    <th>Document</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.length > 0 ? (
                                    filteredProjects.map((project) => (
                                        <tr key={project.id}>
                                            <td>{project.projectName}</td>
                                            <td>{project.username}</td>
                                            <td>{project.country}</td>
                                            <td>{project.category}</td>
                                            <td>{project.type}</td>
                                            <td>{project.model}</td>
                                            <td>{project.document}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                                            No projects match the selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
