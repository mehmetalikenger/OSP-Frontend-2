"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
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

// Returns a stable, locale-independent key (translated at display time). Using a
// key here keeps the filter options and the row comparisons consistent in any
// language, since both sides go through this same mapping.
const categoryKey = (c: string | null) =>
    c === "CHILLER" ? "chiller" : c === "HEAT_PUMP" ? "heatPump" : "";

// AW/WW means different things per category, so key by both.
const typeKey = (cat: string | null, type: string | null) => {
    if (!type) return "";
    if (cat === "CHILLER") return type === "AW" ? "airCooled" : "waterCooled";
    if (cat === "HEAT_PUMP") return type === "AW" ? "airToWater" : "waterToWater";
    return type;
};

const TRANSLATABLE_KEYS = ["chiller", "heatPump", "airCooled", "waterCooled", "airToWater", "waterToWater"];

// Owner username plus the project's company, shown together in the Username column.
const ownerLabel = (row: AdminProjectRow) =>
    [row.username, row.company].filter(Boolean).join(" / ") || "-";

export default function ProjectsPage() {
    const t = useTranslations("AdminProjects");
    // Translate a key ("All" sentinel, category/type keys); pass other values
    // (countries, model names from the backend) through unchanged.
    const labelFor = (v: string) =>
        v === "All" ? t("all") : TRANSLATABLE_KEYS.includes(v) ? t(v) : v;
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
        () => ["All", ...Array.from(new Set(rows.map(r => categoryKey(r.category)).filter(Boolean)))],
        [rows],
    );
    const typesList = useMemo(
        () => ["All", ...Array.from(new Set(rows.map(r => typeKey(r.category, r.type)).filter(Boolean)))],
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
            if (categoryFilter !== "All" && categoryKey(row.category) !== categoryFilter) return false;
            if (typeFilter !== "All" && typeKey(row.category, row.type) !== typeFilter) return false;
            if (modelFilter !== "All" && row.model !== modelFilter) return false;
            return true;
        });
    }, [rows, usernameSearch, countryFilter, categoryFilter, typeFilter, modelFilter]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header (Title & Total Count) */}
                <div className={styles.pageHeader}>
                    <h2 className={styles.pageTitle}>{t("title")}</h2>
                    <p className={styles.totalCount}>
                        {t("totalProjects")} {filteredProjects.length}
                    </p>
                </div>

                <div className={styles.contentGrid}>
                    {/* Left Panel: Filters */}
                    <div className={styles.filtersContainer}>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{t("category")}</span>
                            <AdminCombobox
                                value={categoryFilter}
                                onChange={(val) => setCategoryFilter(val)}
                                options={categoriesList}
                                containerClassName={styles.filterCombobox}
                                getLabel={labelFor}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{t("type")}</span>
                            <AdminCombobox
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val)}
                                options={typesList}
                                containerClassName={styles.filterCombobox}
                                getLabel={labelFor}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{t("model")}</span>
                            <AdminCombobox
                                value={modelFilter}
                                onChange={(val) => setModelFilter(val)}
                                options={modelsList}
                                containerClassName={styles.filterCombobox}
                                getLabel={labelFor}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{t("country")}</span>
                            <AdminCombobox
                                value={countryFilter}
                                onChange={(val) => setCountryFilter(val)}
                                options={countriesList}
                                containerClassName={styles.filterCombobox}
                                getLabel={labelFor}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>{t("username")}</span>
                            <input
                                type="text"
                                className={styles.textInput}
                                placeholder={t("searchUsername")}
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
                                    <th>{t("colProjectName")}</th>
                                    <th>{t("username")}</th>
                                    <th>{t("country")}</th>
                                    <th>{t("category")}</th>
                                    <th>{t("type")}</th>
                                    <th>{t("model")}</th>
                                    <th>{t("colDocument")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.length > 0 ? (
                                    filteredProjects.map((project) => (
                                        <tr key={project.detailId ?? `proj-${project.projectId}`}>
                                            <td>{project.projectName}</td>
                                            <td>{ownerLabel(project)}</td>
                                            <td>{project.country || "-"}</td>
                                            <td>{labelFor(categoryKey(project.category)) || "-"}</td>
                                            <td>{labelFor(typeKey(project.category, project.type)) || "-"}</td>
                                            <td>{project.model || "-"}</td>
                                            <td>
                                                {project.documentUrl ? (
                                                    <button
                                                        type="button"
                                                        className={styles.documentLink}
                                                        onClick={() => window.open(project.documentUrl!, "_blank", "noopener,noreferrer")}
                                                    >
                                                        {t("open")}
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
                                            {t("noProjects")}
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
