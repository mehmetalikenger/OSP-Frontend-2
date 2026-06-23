"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { fetchWithAuth } from "@/lib/api";
import styles from "../calculation.module.css";
import { Country, State } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import AdminCombobox from "../../(dashboard)/admin-panel/AdminCombobox";
import { formatPhoneForStore, parseStoredPhone } from "@/lib/phone";

const API = process.env.NEXT_PUBLIC_API_URL;

interface CalcContext {
    unitId?: string | null;
    mod?: string;
    ambient: number;
    evapIn: number;
    evapOut: number;
    glycolType?: string | null;
    glycolPercentage?: number | null;
}

interface CalculationModalsProps {
    isOpen: boolean;
    onClose: () => void;
    initialStep?: 'result' | 'projects' | 'create';
    calc?: CalcContext;
}

interface ProjectItem {
    id: number;
    name: string;
}

export default function CalculationModals({ isOpen, onClose, initialStep = 'result', calc }: CalculationModalsProps) {
    const t = useTranslations("Calc");
    const locale = useLocale();
    const [step, setStep] = useState<'result' | 'projects' | 'create'>(initialStep);
    // Language the stored project report PDF is rendered in; defaults to the current UI locale.
    const [language, setLanguage] = useState(locale === "de" ? "de" : "en");

    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]); // projects checked for this add
    const [busy, setBusy] = useState(false);
    const [added, setAdded] = useState(false); // true right after a successful add (until selection changes)
    const [error, setError] = useState<string | null>(null);

    // Create-project form states
    const [projectName, setProjectName] = useState("");
    const [address, setAddress] = useState("");
    const [countryName, setCountryName] = useState("");
    const [countryIsoCode, setCountryIsoCode] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");        // digits value for PhoneInput
    const [dialCode, setDialCode] = useState("");  // country calling code, for storage format

    // The user's saved address/phone, used to pre-fill the create-project form so they
    // don't have to retype their own details. Also used to re-seed the form after a create.
    const [defaults, setDefaults] = useState({ address: "", countryName: "", countryIsoCode: "", city: "", phone: "", dialCode: "" });

    const countries = Country.getAllCountries();
    // States used instead of cities (better coverage for countries like Turkey).
    const cities = countryIsoCode ? State.getStatesOfCountry(countryIsoCode) : [];

    const loadProjects = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${API}/projects`, { credentials: "include", cache: "no-store" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setProjects(list.map((p: any) => ({ id: p.id, name: p.name })));
        } catch {
            setProjects([]);
        }
    }, []);

    // Pull the logged-in user's saved address/phone so the create-project form starts
    // pre-filled with their own details. Country is stored as an ISO code, so map it back
    // to the display name the combobox expects (falling back to the raw value).
    const loadUserDefaults = useCallback(async () => {
        const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        if (!userId) return;
        try {
            const res = await fetchWithAuth(`${API}/user/${userId}`, { credentials: "include", cache: "no-store" });
            if (!res.ok) return;
            const data = await res.json();
            let cName = "", cIso = "";
            if (data.country) {
                const c = Country.getAllCountries().find(c => c.isoCode === data.country);
                cName = c ? c.name : data.country;
                cIso = c ? c.isoCode : data.country;
            }
            const parsedPhone = parseStoredPhone(data.phone);
            const d = {
                address: data.address || "",
                countryName: cName,
                countryIsoCode: cIso,
                city: data.city || "",
                phone: parsedPhone.value,
                dialCode: parsedPhone.dialCode,
            };
            setDefaults(d);
            setAddress(d.address);
            setCountryName(d.countryName);
            setCountryIsoCode(d.countryIsoCode);
            setCity(d.city);
            setPhone(d.phone);
            setDialCode(d.dialCode);
        } catch {
            // Leave the form blank if the profile can't be loaded.
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setStep(initialStep);
            setError(null);
            // Selection is intentionally NOT reset here: once a project is checked it stays
            // checked until the page is refreshed, even across closing/reopening the modal.
            loadProjects();
            loadUserDefaults();
            (window as any).__preventScroll = (e: any) => {
                if (!e.target.closest('[class*="modalContent"], [class*="unitDetails"], [class*="projectsList"]')) {
                    e.preventDefault();
                }
            };
            (window as any).__preventKeyScroll = (e: any) => {
                if (['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
                    if (!e.target.closest('[class*="modalContent"], [class*="unitDetails"], [class*="projectsList"]')) {
                        e.preventDefault();
                    }
                }
            };
            window.addEventListener("wheel", (window as any).__preventScroll, { passive: false });
            window.addEventListener("touchmove", (window as any).__preventScroll, { passive: false });
            window.addEventListener("keydown", (window as any).__preventKeyScroll, { passive: false });
        } else {
            if ((window as any).__preventScroll) {
                window.removeEventListener("wheel", (window as any).__preventScroll);
                window.removeEventListener("touchmove", (window as any).__preventScroll);
                window.removeEventListener("keydown", (window as any).__preventKeyScroll);
            }
        }
        return () => {
            if ((window as any).__preventScroll) {
                window.removeEventListener("wheel", (window as any).__preventScroll);
                window.removeEventListener("touchmove", (window as any).__preventScroll);
                window.removeEventListener("keydown", (window as any).__preventKeyScroll);
            }
        };
    }, [isOpen, initialStep, loadProjects, loadUserDefaults]);

    if (!isOpen) return null;

    const handleClose = () => {
        setStep(initialStep);
        setError(null);
        onClose();
    };

    // POST the current calculation as a ProjectDetails row under one project.
    const addUnitToProject = async (projectId: number) => {
        if (!calc?.unitId) return;
        const res = await fetchWithAuth(`${API}/projects/${projectId}/details`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                unitId: Number(calc.unitId),
                mod: calc.mod || "COOLING",
                ambient: calc.ambient,
                evapIn: calc.evapIn,
                evapOut: calc.evapOut,
                glycolType: calc.glycolType ?? null,
                glycolPercentage: calc.glycolPercentage ?? null,
                language,
            }),
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
    };

    // Checkbox selection is just "which projects will receive this result" — it is NOT
    // membership, so it never reflects what a project already contains.
    const toggleSelected = (projectId: number) => {
        if (busy) return;
        // Changing the selection means a new add is possible again, so clear the
        // "added" confirmation and re-enable the Add button.
        setAdded(false);
        setSelectedIds(prev => prev.includes(projectId)
            ? prev.filter(id => id !== projectId)
            : [...prev, projectId]);
    };

    // Adds the current result to every selected project as a new ProjectDetails row.
    // The selection is intentionally KEPT after adding, so the chosen projects stay
    // checked until the page is refreshed (the checkbox is the user's confirmation of
    // which projects received the result).
    const addToSelected = async () => {
        if (!calc?.unitId || selectedIds.length === 0 || busy) return;
        setBusy(true);
        setError(null);
        try {
            for (const projectId of selectedIds) {
                await addUnitToProject(projectId);
            }
            // Confirm the add and disable the Add button until the selection changes again.
            setAdded(true);
        } catch {
            setError(t("errAddFailed"));
        } finally {
            setBusy(false);
        }
    };

    // Creating a project only creates it — it does NOT add the current result. After
    // creation we return to the projects list so the user can check the new project and
    // press Add to commit the result, just like any other project.
    const handleCreate = async () => {
        if (!projectName.trim()) {
            setError(t("errEnterProjectName"));
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`${API}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: projectName, address, country: countryName, city, phone: formatPhoneForStore(phone, dialCode) }),
            });
            if (!res.ok) throw new Error();
            // Reset the create form (re-seeding address/phone from the user's defaults),
            // refresh the list, and go back to the projects step so the newly created
            // project is visible and ready to be selected.
            setProjectName("");
            setAddress(defaults.address);
            setCountryName(defaults.countryName);
            setCountryIsoCode(defaults.countryIsoCode);
            setCity(defaults.city);
            setPhone(defaults.phone);
            setDialCode(defaults.dialCode);
            await loadProjects();
            setStep("projects");
        } catch {
            setError(t("errCreateFailed"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalCloseBtn} onClick={handleClose}>
                    <img src="../../icons/closeBtn.png" className={styles.lightIcon} alt="Close" />
                    <img src="../../icons/closeBtn-second.png" className={styles.darkIcon} alt="Close" />
                </div>

                {step === 'result' && (
                    <div className={styles.resultModalContent}>
                        <div className={styles.documentHeader}>
                            <div className={styles.documentIconWrapper}>
                                <img src="../../icons/document.png" className={styles.lightIcon} alt="Document" />
                                <img src="../../icons/document-darkMode.png" className={styles.darkIcon} alt="Document" />
                            </div>
                            <h3>calculation_results.pdf</h3>
                        </div>
                        <div className={styles.resultActions}>
                            <button className={styles.btnPrimary} onClick={() => setStep('projects')}>{t("addToProject")}</button>
                        </div>
                    </div>
                )}

                {step === 'projects' && (
                    <div className={styles.projectsModalContent}>
                        <h2>{t("projects")}</h2>
                        <div className={styles.projectsList}>
                            {projects.length === 0 && <p>{t("noProjectsCreate")}</p>}
                            {projects.map(project => {
                                const selected = selectedIds.includes(project.id);
                                return (
                                    <div
                                        key={project.id}
                                        className={styles.projectItem}
                                        style={busy ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
                                        onClick={() => toggleSelected(project.id)}
                                    >
                                        <span>{project.name}</span>
                                        <div className={`${styles.checkbox} ${selected ? styles.checkboxChecked : ''}`}>
                                            {selected && <div className={styles.tick}></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {error && <p className={styles.calcError}>{error}</p>}
                        {added && !error && <p className={styles.calcSuccess}>{t("addedToProject")}</p>}
                        <div className={styles.langSelectRow}>
                            <span className={styles.langSelectLabel}>{t("languageLabel")}</span>
                            <button
                                className={language === "en" ? styles.langSelected : styles.btnSecondary}
                                onClick={() => { setLanguage("en"); setAdded(false); }}
                                disabled={busy}
                            >
                                {t("english")}
                            </button>
                            <button
                                className={language === "de" ? styles.langSelected : styles.btnSecondary}
                                onClick={() => { setLanguage("de"); setAdded(false); }}
                                disabled={busy}
                            >
                                {t("german")}
                            </button>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.btnPrimary}
                                onClick={addToSelected}
                                disabled={busy || added || selectedIds.length === 0}
                            >
                                {busy ? t("adding") : t("add")}
                            </button>
                            <button className={styles.btnSecondary} onClick={() => setStep('create')} disabled={busy}>{t("createProject")}</button>
                        </div>
                    </div>
                )}

                {step === 'create' && (
                    <div className={styles.createModalContent}>
                        <h2>{t("createProject")}</h2>
                        <div className={styles.projectForm}>
                            <div className={styles.formRow}>
                                <label>{t("projectName")}</label>
                                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                            </div>
                            <div className={styles.formRow}>
                                <label>{t("address")}</label>
                                <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div className={styles.formRow}>
                                <label>{t("country")}</label>
                                <AdminCombobox
                                    value={countryName || "Select Country"}
                                    getLabel={(v) => v === "Select Country" ? t("selectCountry") : v}
                                    onChange={(val: string) => {
                                        const c = countries.find(c => c.name === val);
                                        if (c) {
                                            setCountryIsoCode(c.isoCode);
                                            setCountryName(c.name);
                                            setCity(""); // reset city when country changes
                                        }
                                    }}
                                    options={countries.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => c.name)}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label>{t("city")}</label>
                                <AdminCombobox
                                    value={city || "Select City"}
                                    getLabel={(v) => v === "Select City" ? t("selectCity") : v}
                                    onChange={(val: string) => setCity(val)}
                                    options={cities ? cities.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => c.name) : []}
                                    disabled={!countryIsoCode}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label>{t("phone")}</label>
                                <PhoneInput
                                    country={'us'}
                                    value={phone}
                                    onChange={(value: string, data: any) => { setPhone(value); setDialCode(data?.dialCode || ""); }}
                                    inputStyle={{ width: '100%', height: '40px', paddingLeft: '48px', borderRadius: '5px' }}
                                />
                            </div>
                            {error && <p className={styles.calcError}>{error}</p>}
                            <div className={styles.formActions}>
                                <button className={styles.btnSecondary} onClick={() => setStep('projects')} disabled={busy}>{t("cancel")}</button>
                                <button className={styles.btnPrimary} onClick={handleCreate} disabled={busy}>
                                    {busy ? t("saving") : t("save")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
