"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "./projects.module.css";
import AdminCombobox from "../AdminCombobox";
import { fetchWithAuth } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

// One row per project-detail (unit evaluation), as returned by GET /admin/projects.
interface AdminProjectRow {
    projectId: number;
    detailId: number | null;
    projectName: string;
    username: string | null;
    company: string | null;
    country: string | null;
    category: string | null;   // CHILLER / HEAT_PUMP
    type: string | null;       // AW / WW
    model: string | null;
    documentUrl: string | null;
}

const categoryLabel = (c: string | null) =>
    c === "CHILLER" ? "Chiller" : c === "HEAT_PUMP" ? "Heat Pump" : "";

// AW/WW means different things per category, so label by both.
const typeLabel = (cat: string | null, t: string | null) => {
    if (!t) return "";
    if (cat === "CHILLER") return t === "AW" ? "Air Cooled" : "Water Cooled";
    if (cat === "HEAT_PUMP") return t === "AW" ? "Air to Water" : "Water to Water";
    return t;
};

// Owner username plus the project's company, shown together in the Username column.
const ownerLabel = (row: AdminProjectRow) =>
    [row.username, row.company].filter(Boolean).join(" / ") || "-";

export default function ProjectsPage() {
    const [rows, setRows] = useState<AdminProjectRow[]>([]);

    // Filter States
    const [usernameSearch, setUsernameSearch] = useState("");
    const [countryFilter, setCountryFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [modelFilter, setModelFilter] = useState("All");

    useEffect(() => {
        fetchWithAuth(`${API}/admin/projects`, { credentials: "include", cache: "no-store" })
            .then(r => (r.ok ? r.json() : []))
            .then((data: AdminProjectRow[]) => setRows(Array.isArray(data) ? data : []))
            .catch(() => setRows([]));
    }, []);

    // Derived options for the filter comboboxes (distinct, with an "All" entry).
    const countriesList = useMemo(
        () => ["All", ...Array.from(new Set(rows.map(r => r.country).filter(Boolean) as string[]))],
        [rows],
    );
    const categoriesList = useMemo(
        () => ["All", ...Array.from(new Set(rows.map(r => categoryLabel(r.category)).filter(Boolean)))],
        [rows],
    );
    const typesList = useMemo(
        () => ["All", ...Array.from(new Set(rows.map(r => typeLabel(r.category, r.type)).filter(Boolean)))],
        [rows],
    );
    const modelsList = useMemo(
        () => ["All", ...Array.from(new Set(rows.map(r => r.model).filter(Boolean) as string[]))],
        [rows],
    );

    const filteredProjects = useMemo(() => {
        return rows.filter(row => {
            if (usernameSearch.trim() !== "" && !ownerLabel(row).toLowerCase().includes(usernameSearch.toLowerCase())) return false;
            if (countryFilter !== "All" && row.country !== countryFilter) return false;
            if (categoryFilter !== "All" && categoryLabel(row.category) !== categoryFilter) return false;
            if (typeFilter !== "All" && typeLabel(row.category, row.type) !== typeFilter) return false;
            if (modelFilter !== "All" && row.model !== modelFilter) return false;
            return true;
        });
    }, [rows, usernameSearch, countryFilter, categoryFilter, typeFilter, modelFilter]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header (Title & Total Count) */}
                <div className={styles.pageHeader}>
                    <h2 className={styles.pageTitle}>{"Projects"}</h2>
                    <p className={styles.totalCount}>
                        {"Total Projects"} {filteredProjects.length}
                    </p>
                </div>

                <div className={styles.contentGrid}>
                    {/* Left Panel: Filters */}
                    <div className={styles.filtersContainer}>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{"Category"}</span>
                            <AdminCombobox
                                value={categoryFilter}
                                onChange={(val) => setCategoryFilter(val)}
                                options={categoriesList}
                                containerClassName={styles.filterCombobox}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{"Type"}</span>
                            <AdminCombobox
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val)}
                                options={typesList}
                                containerClassName={styles.filterCombobox}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{"Model"}</span>
                            <AdminCombobox
                                value={modelFilter}
                                onChange={(val) => setModelFilter(val)}
                                options={modelsList}
                                containerClassName={styles.filterCombobox}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{"Country"}</span>
                            <AdminCombobox
                                value={countryFilter}
                                onChange={(val) => setCountryFilter(val)}
                                options={countriesList}
                                containerClassName={styles.filterCombobox}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{"Username"}</span>
                            <input
                                type="text"
                                className={styles.textInput}
                                placeholder={"Search username..."}
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
                                    <th>{"Project Name"}</th>
                                    <th>{"Username"}</th>
                                    <th>{"Country"}</th>
                                    <th>{"Category"}</th>
                                    <th>{"Type"}</th>
                                    <th>{"Model"}</th>
                                    <th>{"Document"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.length > 0 ? (
                                    filteredProjects.map((project) => (
                                        <tr key={project.detailId ?? `proj-${project.projectId}`}>
                                            <td>{project.projectName}</td>
                                            <td>{ownerLabel(project)}</td>
                                            <td>{project.country || "-"}</td>
                                            <td>{categoryLabel(project.category) || "-"}</td>
                                            <td>{typeLabel(project.category, project.type) || "-"}</td>
                                            <td>{project.model || "-"}</td>
                                            <td>
                                                {project.documentUrl ? (
                                                    <button
                                                        type="button"
                                                        className={styles.documentLink}
                                                        onClick={() => window.open(project.documentUrl!, "_blank", "noopener,noreferrer")}
                                                    >
                                                        {"Open"}
                                                    </button>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                                            {"No projects match the selected filters."}
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
