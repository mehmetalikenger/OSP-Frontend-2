"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import sharedStyles from "../sharedProfile.module.css";
import styles from "./projects.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { fetchWithAuth } from "@/lib/api";
import { Country, State } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import AdminCombobox from "../../(dashboard)/admin-panel/AdminCombobox";
import { formatPhoneForStore, parseStoredPhone } from "@/lib/phone";

const API = process.env.NEXT_PUBLIC_API_URL;

interface ProjectDetail {
    id: number;
    unitId: number | null;
    unitName: string | null;
    unitModel: string | null;
    primaryImageUrl: string | null;
    ambient: number;
    evapIn: number;
    evapOut: number;
    capacityKw: number;
    powerInputKw: number;
    copEer: number;
    pdfUrl: string | null;
}

interface Project {
    id: number;
    name: string;
    company: string | null;
    address: string | null;
    country: string | null;
    city: string | null;
    phone: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    details: ProjectDetail[];
}

export default function ProjectsPage() {
    const t = useTranslations("Projects");
    const [projects, setProjects] = useState<Project[]>([]);
    const [openId, setOpenId] = useState<number | null>(null);

    // Edit state for the currently open project (kept separate from the fetched list so
    // a Save button can appear only once something actually changes).
    const [editName, setEditName] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("");      // display name (what's stored/sent)
    const [countryIso, setCountryIso] = useState(""); // drives the city dropdown
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");        // digits value for PhoneInput
    const [dialCode, setDialCode] = useState("");  // country calling code, for storage format
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Per-project settings menu + its two actions (edit address/phone, delete project).
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Create-project form state (mirrors the calculation page's create flow).
    const countries = Country.getAllCountries();
    const [cName, setCName] = useState("");
    const [cAddress, setCAddress] = useState("");
    const [cCountryName, setCCountryName] = useState("");
    const [cCountryIso, setCCountryIso] = useState("");
    const [cCity, setCCity] = useState("");
    const [cPhone, setCPhone] = useState("");
    const [cDialCode, setCDialCode] = useState("");
    const [createBusy, setCreateBusy] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const cCities = cCountryIso ? State.getStatesOfCountry(cCountryIso) : [];

    // Cities for the inline (open-project) edit form.
    const editCities = countryIso ? State.getStatesOfCountry(countryIso) : [];
    const sortedCountryNames = countries.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => c.name);

    useScrollLock(isCreateModalOpen || isEditModalOpen || isDeleteModalOpen);

    const showToast = (message: string, error = false) => {
        setToast({ message, error });
        setTimeout(() => setToast(null), 3000);
    };

    const loadProjects = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${API}/projects`, { credentials: "include", cache: "no-store" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch {
            setProjects([]);
        }
    }, []);

    useEffect(() => { loadProjects(); }, [loadProjects]);

    const formatMobileProjectName = (name: string) =>
        name.split(" ").map(word => (word.length > 10 ? word.slice(0, 10) + "..." : word)).join(" ");

    const openProject = (p: Project) => {
        setOpenId(p.id);
        setEditName(p.name || "");
        setAddress(p.address || "");
        // The stored country may be a display name or an ISO code; map it back so the
        // combobox shows the name and the city dropdown has the right options.
        const c = p.country
            ? countries.find(c => c.isoCode === p.country) || countries.find(c => c.name === p.country)
            : undefined;
        setCountry(c ? c.name : (p.country || ""));
        setCountryIso(c ? c.isoCode : "");
        setCity(p.city || "");
        const parsedPhone = parseStoredPhone(p.phone);
        setPhone(parsedPhone.value);
        setDialCode(parsedPhone.dialCode);
        setIsDirty(false);
        setIsEditingName(false);
    };

    const closeProject = () => {
        setOpenId(null);
        setIsEditingName(false);
        setIsDirty(false);
        setSettingsMenuOpen(false);
    };

    // PUT the edited project info. The backend regenerates every report PDF for this
    // project (reusing each detail's stored inputs) and bumps the update date.
    const persist = async (): Promise<boolean> => {
        if (openId == null || saving) return false;
        setSaving(true);
        try {
            const res = await fetchWithAuth(`${API}/projects/${openId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: editName, address, country, city, phone: formatPhoneForStore(phone, dialCode) }),
            });
            if (!res.ok) throw new Error();
            const updated: Project = await res.json();
            setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
            setIsDirty(false);
            showToast(t("changesSaved"));
            return true;
        } catch {
            showToast(t("couldNotSave"), true);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const commitName = () => {
        setIsEditingName(false);
        const current = projects.find(p => p.id === openId);
        if (!current) return;
        if (editName.trim() && editName.trim() !== current.name) {
            persist();
        } else {
            setEditName(current.name); // revert an empty or unchanged edit
        }
    };

    const handleContactChange = (setter: (v: string) => void, value: string) => {
        setter(value);
        setIsDirty(true);
    };

    const deleteDetail = async (projectId: number, detailId: number) => {
        try {
            const res = await fetchWithAuth(`${API}/projects/${projectId}/details/${detailId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error();
            const updated: Project = await res.json();
            setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        } catch {
            showToast(t("couldNotRemoveUnit"), true);
        }
    };

    // Settings menu -> "Address & Phone": seed the form from the open project and show it.
    const openEditModal = () => {
        setSettingsMenuOpen(false);
        const p = projects.find(p => p.id === openId);
        if (p) {
            setAddress(p.address || "");
            const c = p.country
                ? countries.find(c => c.isoCode === p.country) || countries.find(c => c.name === p.country)
                : undefined;
            setCountry(c ? c.name : (p.country || ""));
            setCountryIso(c ? c.isoCode : "");
            setCity(p.city || "");
            const parsedPhone = parseStoredPhone(p.phone);
            setPhone(parsedPhone.value);
            setDialCode(parsedPhone.dialCode);
        }
        setIsDirty(false);
        setIsEditModalOpen(true);
    };

    const saveEdit = async () => {
        const ok = await persist();
        if (ok) setIsEditModalOpen(false);
    };

    // Settings menu -> "Delete Project": open a name-confirmation modal.
    const openDeleteModal = () => {
        setSettingsMenuOpen(false);
        setDeleteConfirmText("");
        setIsDeleteModalOpen(true);
    };

    const deleteProject = async () => {
        const p = projects.find(p => p.id === openId);
        if (!p || deleting || deleteConfirmText.trim() !== p.name) return;
        setDeleting(true);
        try {
            const res = await fetchWithAuth(`${API}/projects/${p.id}`, { method: "DELETE", credentials: "include" });
            if (!res.ok) throw new Error();
            setProjects(prev => prev.filter(pr => pr.id !== p.id));
            setIsDeleteModalOpen(false);
            setOpenId(null);
            showToast(t("projectDeleted"));
        } catch {
            showToast(t("couldNotDeleteProject"), true);
        } finally {
            setDeleting(false);
        }
    };

    // Open the create modal and pre-fill address/phone from the user's saved profile.
    const openCreateModal = async () => {
        setCName(""); setCAddress(""); setCCountryName(""); setCCountryIso(""); setCCity(""); setCPhone(""); setCDialCode("");
        setCreateError(null);
        setIsCreateModalOpen(true);
        const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        if (!userId) return;
        try {
            const res = await fetchWithAuth(`${API}/user/${userId}`, { credentials: "include", cache: "no-store" });
            if (!res.ok) return;
            const data = await res.json();
            setCAddress(data.address || "");
            const parsedPhone = parseStoredPhone(data.phone);
            setCPhone(parsedPhone.value);
            setCDialCode(parsedPhone.dialCode);
            setCCity(data.city || "");
            if (data.country) {
                const c = countries.find(c => c.isoCode === data.country);
                setCCountryName(c ? c.name : data.country);
                setCCountryIso(c ? c.isoCode : data.country);
            }
        } catch {
            // Leave the form blank if the profile can't be loaded.
        }
    };

    const handleCreate = async () => {
        if (!cName.trim()) {
            setCreateError(t("enterProjectName"));
            return;
        }
        setCreateBusy(true);
        setCreateError(null);
        try {
            const res = await fetchWithAuth(`${API}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: cName, address: cAddress, country: cCountryName, city: cCity, phone: formatPhoneForStore(cPhone, cDialCode) }),
            });
            if (!res.ok) throw new Error();
            setIsCreateModalOpen(false);
            await loadProjects();
            showToast(t("projectCreated"));
        } catch {
            setCreateError(t("couldNotCreate"));
        } finally {
            setCreateBusy(false);
        }
    };

    const renderDates = (p: Project) => (
        <div className={styles.dates}>
            <div className={styles.date}>
                <span className={styles.dateTitle}>{t("creationDate")}</span>
                <span className={styles.dateValue}>{p.createdAt || "-"}</span>
            </div>
            <div className={styles.date}>
                <span className={styles.dateTitle}>{t("updateDate")}</span>
                <span className={styles.dateValue}>{p.updatedAt || "-"}</span>
            </div>
        </div>
    );

    const renderUnitCard = (project: Project, detail: ProjectDetail, variant: "mobile" | "desktop") => {
        const closeBtn = (
            <div className={styles.closeBtn} onClick={() => deleteDetail(project.id, detail.id)}>
                <img src="/icons/closeBtn.png" alt="Close icon" className={styles.lightIcon} />
                <img src="/icons/closeBtn-second.png" alt="Close icon" className={styles.darkIcon} />
            </div>
        );
        const nameBlock = (
            <div className={styles.unitName}>
                <p>{detail.unitName || detail.unitModel || t("unit")}</p>
                {detail.unitName && detail.unitModel && (
                    <span className={styles.modelName}>{detail.unitModel}</span>
                )}
            </div>
        );
        const documentBlock = (
            <div
                className={styles.unitDocument}
                onClick={() => detail.pdfUrl && window.open(detail.pdfUrl, "_blank", "noopener,noreferrer")}
                style={detail.pdfUrl ? undefined : { opacity: 0.5, cursor: "default" }}
            >
                <div className={styles.documentIcon}>
                    <img src="/icons/projectDocument.png" alt="Project document icon" className={styles.lightIcon} />
                    <img src="/icons/projectDocument-darkMode.png" alt="Project document icon" className={styles.darkIcon} />
                </div>
                <p>{t("projectDocument")}</p>
            </div>
        );
        const imageBlock = (
            <div className={styles.unitImage}>
                <img src={detail.primaryImageUrl || "/icons/profilePic.png"} alt="Unit image" />
            </div>
        );

        if (variant === "mobile") {
            return (
                <div className={styles.unit} key={`m-${detail.id}`}>
                    {closeBtn}
                    {nameBlock}
                    {imageBlock}
                    {documentBlock}
                </div>
            );
        }
        return (
            <div className={styles.unit} key={`d-${detail.id}`}>
                {closeBtn}
                <div className={styles.unitDetails}>
                    <div className={styles.unitInfo}>
                        {nameBlock}
                        {documentBlock}
                    </div>
                    {imageBlock}
                </div>
            </div>
        );
    };

    const openProjectObj = projects.find(p => p.id === openId) || null;

    return (
        <div className={sharedStyles.pageContentContainer}>
            {toast && (
                <div className={toast.error ? styles.toastError : styles.toast}>
                    {toast.message}
                </div>
            )}
            <div className={sharedStyles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={sharedStyles.headerContent}>
                        <div className={sharedStyles.headerBullet}></div>
                        <h1>{t("title")}</h1>
                    </div>
                    <button
                        className={styles.createProjectBtn}
                        onClick={openCreateModal}
                    >
                        {t("createProject")}
                    </button>
                </div>
                <div className={sharedStyles.headerLine}></div>
            </div>
            <div className={styles.projectsContainer}>
                {projects.length === 0 && (
                    <p style={{ marginTop: "30px", color: "#888" }}>{t("noProjects")}</p>
                )}
                {projects.map(project =>
                    openId === project.id && openProjectObj ? (
                        <div className={styles.projects} key={project.id}>
                            <div className={`${styles.projectOpen} ${styles.project}`}>
                                <div className={`${styles.arrow} ${styles.arrowOpen}`} onClick={closeProject}>
                                    <img src="/icons/back.png" alt="Arrow down icon" className={styles.lightIcon} />
                                    <img src="/icons/back-darkMode.png" alt="Arrow down icon" className={styles.darkIcon} />
                                </div>
                                <div className={styles.projectHeader}>
                                    <div className={styles.projectName}>
                                        {isEditingName ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onBlur={commitName}
                                                onKeyDown={(e) => { if (e.key === "Enter") commitName(); }}
                                                className={styles.projectNameInput}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                <h2 className={styles.desktopName}>{openProjectObj.name}</h2>
                                                <h2 className={styles.mobileName}>{formatMobileProjectName(openProjectObj.name)}</h2>
                                                <div className={styles.editIcon} onClick={() => { setEditName(openProjectObj.name); setIsEditingName(true); }}>
                                                    <img src="/icons/edit.png" alt="Edit icon" className={styles.lightIcon} />
                                                    <img src="/icons/edit-darkMode.png" alt="Edit icon" className={styles.darkIcon} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className={styles.headerRight}>
                                        {renderDates(openProjectObj)}
                                        <div className={styles.settingsWrap}>
                                            <button className={styles.settingsBtn} onClick={() => setSettingsMenuOpen(o => !o)}>
                                                {t("projectSettings")}
                                            </button>
                                            {settingsMenuOpen && (
                                                <>
                                                    <div className={styles.menuBackdrop} onClick={() => setSettingsMenuOpen(false)} />
                                                    <div className={styles.settingsMenu}>
                                                        <button onClick={openEditModal}>{t("addressPhone")}</button>
                                                        <button className={styles.deleteOption} onClick={openDeleteModal}>{t("deleteProject")}</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.headerLine}></div>
                                <div className={styles.projectBody}>
                                    <div className={styles.unitContainer}>
                                        {openProjectObj.details.length === 0 ? (
                                            <p style={{ color: "#888" }}>{t("noUnits")}</p>
                                        ) : (
                                            <>
                                                <div className={styles.unitsMobile}>
                                                    {openProjectObj.details.map(d => renderUnitCard(openProjectObj, d, "mobile"))}
                                                </div>
                                                <div className={styles.unitsDesktop}>
                                                    {openProjectObj.details.map(d => renderUnitCard(openProjectObj, d, "desktop"))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`${styles.project} ${styles.projectClose}`} key={project.id} onClick={() => openProject(project)}>
                            <div className={styles.projectName}>
                                <h2 className={styles.desktopName}>{project.name}</h2>
                                <h2 className={styles.mobileName}>{formatMobileProjectName(project.name)}</h2>
                            </div>
                            {renderDates(project)}
                            <div className={styles.arrow}>
                                <img src="/icons/back.png" alt="Arrow down icon" className={styles.lightIcon} />
                                <img src="/icons/back-darkMode.png" alt="Arrow down icon" className={styles.darkIcon} />
                            </div>
                        </div>
                    )
                )}
            </div>

            {isCreateModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalCloseBtn} onClick={() => setIsCreateModalOpen(false)}>
                            <img src="/icons/closeBtn.png" className={styles.lightIcon} alt="Close" />
                            <img src="/icons/closeBtn-second.png" className={styles.darkIcon} alt="Close" />
                        </div>
                        <div className={styles.createModalContent}>
                            <h2>{t("createProject")}</h2>
                            <div className={styles.projectForm}>
                                <div className={styles.formRow}>
                                    <label>{t("projectName")}</label>
                                    <input type="text" value={cName} onChange={(e) => setCName(e.target.value)} />
                                </div>
                                <div className={styles.formRow}>
                                    <label>{t("address")}</label>
                                    <textarea value={cAddress} onChange={(e) => setCAddress(e.target.value)} />
                                </div>
                                <div className={styles.formRow}>
                                    <label>{t("country")}</label>
                                    <AdminCombobox
                                        value={cCountryName || t("selectCountry")}
                                        onChange={(val: string) => {
                                            const c = countries.find(c => c.name === val);
                                            if (c) {
                                                setCCountryIso(c.isoCode);
                                                setCCountryName(c.name);
                                                setCCity(""); // reset city when country changes
                                            }
                                        }}
                                        options={countries.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => c.name)}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label>{t("city")}</label>
                                    <AdminCombobox
                                        value={cCity || t("selectCity")}
                                        onChange={(val: string) => setCCity(val)}
                                        options={cCities ? cCities.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => c.name) : []}
                                        disabled={!cCountryIso}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label>{t("phone")}</label>
                                    <PhoneInput
                                        country={'us'}
                                        value={cPhone}
                                        onChange={(value: string, data: any) => { setCPhone(value); setCDialCode(data?.dialCode || ""); }}
                                        inputStyle={{ width: '100%', height: '40px', paddingLeft: '48px', borderRadius: '5px' }}
                                    />
                                </div>
                                {createError && <p style={{ color: "#d7292e", fontSize: "0.85rem" }}>{createError}</p>}
                                <div className={styles.formActions}>
                                    <button className={styles.btnSecondary} onClick={() => setIsCreateModalOpen(false)} disabled={createBusy}>{t("cancel")}</button>
                                    <button className={styles.btnPrimary} onClick={handleCreate} disabled={createBusy}>
                                        {createBusy ? t("saving") : t("save")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && openProjectObj && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalCloseBtn} onClick={() => setIsEditModalOpen(false)}>
                            <img src="/icons/closeBtn.png" className={styles.lightIcon} alt="Close" />
                            <img src="/icons/closeBtn-second.png" className={styles.darkIcon} alt="Close" />
                        </div>
                        <div className={styles.createModalContent}>
                            <h2>{t("addressPhone")}</h2>
                            <div className={styles.projectForm}>
                                <div className={styles.formRow}>
                                    <label>{t("address")}</label>
                                    <textarea value={address} onChange={(e) => handleContactChange(setAddress, e.target.value)} />
                                </div>
                                <div className={styles.formRow}>
                                    <label>{t("country")}</label>
                                    <AdminCombobox
                                        value={country || t("selectCountry")}
                                        onChange={(val: string) => {
                                            const c = countries.find(c => c.name === val);
                                            if (c) {
                                                setCountry(c.name);
                                                setCountryIso(c.isoCode);
                                                setCity(""); // reset city when country changes
                                                setIsDirty(true);
                                            }
                                        }}
                                        options={sortedCountryNames}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label>{t("city")}</label>
                                    <AdminCombobox
                                        value={city || t("selectCity")}
                                        onChange={(val: string) => { setCity(val); setIsDirty(true); }}
                                        options={editCities ? editCities.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => c.name) : []}
                                        disabled={!countryIso}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label>{t("phone")}</label>
                                    <PhoneInput
                                        country={'us'}
                                        value={phone}
                                        onChange={(value: string, data: any) => { setPhone(value); setDialCode(data?.dialCode || ""); setIsDirty(true); }}
                                        inputStyle={{ width: '100%', height: '40px', paddingLeft: '48px', borderRadius: '5px' }}
                                    />
                                </div>
                                <div className={styles.formActions}>
                                    <button className={styles.btnSecondary} onClick={() => setIsEditModalOpen(false)} disabled={saving}>{t("cancel")}</button>
                                    <button className={styles.btnPrimary} onClick={saveEdit} disabled={saving || !isDirty}>
                                        {saving ? t("saving") : t("save")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && openProjectObj && (
                <div className={styles.modalOverlay} onClick={() => setIsDeleteModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalCloseBtn} onClick={() => setIsDeleteModalOpen(false)}>
                            <img src="/icons/closeBtn.png" className={styles.lightIcon} alt="Close" />
                            <img src="/icons/closeBtn-second.png" className={styles.darkIcon} alt="Close" />
                        </div>
                        <div className={styles.createModalContent}>
                            <h2>{t("deleteProject")}</h2>
                            <div className={styles.deleteWarning}>
                                <p>{t.rich("deleteWarning", { name: openProjectObj.name, strong: (chunks) => <strong>{chunks}</strong> })}</p>
                                <input
                                    type="text"
                                    placeholder={t("deletePlaceholder")}
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button className={styles.btnSecondary} onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>{t("cancel")}</button>
                                <button
                                    className={styles.deleteConfirmBtn}
                                    onClick={deleteProject}
                                    disabled={deleting || deleteConfirmText.trim() !== openProjectObj.name}
                                >
                                    {deleting ? t("deleting") : t("delete")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
