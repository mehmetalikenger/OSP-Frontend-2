"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import styles from "../calculation.module.css";
import { Country, State } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import AdminCombobox from "../../(dashboard)/admin-panel/AdminCombobox";

const API = process.env.NEXT_PUBLIC_API_URL;

interface CalcContext {
    unitId?: string | null;
    mod?: string;
    ambient: number;
    evapIn: number;
    evapOut: number;
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
    const [step, setStep] = useState<'result' | 'projects' | 'create'>(initialStep);

    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]); // projects checked for this add
    const [addedIds, setAddedIds] = useState<number[]>([]);        // projects added to this session (feedback only)
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create-project form states
    const [projectName, setProjectName] = useState("");
    const [address, setAddress] = useState("");
    const [countryName, setCountryName] = useState("");
    const [countryIsoCode, setCountryIsoCode] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");

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

    useEffect(() => {
        if (isOpen) {
            setStep(initialStep);
            setError(null);
            setSelectedIds([]);
            setAddedIds([]);
            loadProjects();
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
    }, [isOpen, initialStep, loadProjects]);

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
            }),
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
    };

    // Checkbox selection is just "which projects will receive this result" — it is NOT
    // membership, so it never reflects what a project already contains.
    const toggleSelected = (projectId: number) => {
        if (busy) return;
        setSelectedIds(prev => prev.includes(projectId)
            ? prev.filter(id => id !== projectId)
            : [...prev, projectId]);
    };

    // Adds the current result to every selected project as a new ProjectDetails row, then
    // clears the selection. There is no duplicate-blocking by design: the same unit/result
    // can be added to the same project again — just re-select it and Add again (e.g. after
    // recalculating). Clearing the selection after a commit is what prevents an accidental
    // double-add from a single Add click.
    const addToSelected = async () => {
        if (!calc?.unitId || selectedIds.length === 0 || busy) return;
        setBusy(true);
        setError(null);
        try {
            for (const projectId of selectedIds) {
                await addUnitToProject(projectId);
            }
            setAddedIds(prev => Array.from(new Set([...prev, ...selectedIds])));
            setSelectedIds([]);
        } catch {
            setError("Could not add to the selected project(s). Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const handleCreateAndAdd = async () => {
        if (!projectName.trim()) {
            setError("Please enter a project name.");
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`${API}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: projectName, address, country: countryName, city, phone }),
            });
            if (!res.ok) throw new Error();
            const project = await res.json();
            if (calc?.unitId) {
                await addUnitToProject(project.id);
                setAddedIds(prev => [...prev, project.id]);
            }
            // Reset the create form, refresh the list, and go back to the projects
            // step so the newly created (and now containing this unit) project is visible.
            setProjectName(""); setAddress(""); setCountryName(""); setCountryIsoCode(""); setCity(""); setPhone("");
            await loadProjects();
            setStep("projects");
        } catch {
            setError("Could not create the project. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
                            <button className={styles.btnPrimary} onClick={() => setStep('projects')}>Add to project</button>
                        </div>
                    </div>
                )}

                {step === 'projects' && (
                    <div className={styles.projectsModalContent}>
                        <h2>Projects</h2>
                        <div className={styles.projectsList}>
                            {projects.length === 0 && <p>No projects yet. Create one below.</p>}
                            {projects.map(project => {
                                const selected = selectedIds.includes(project.id);
                                const added = addedIds.includes(project.id);
                                return (
                                    <div
                                        key={project.id}
                                        className={styles.projectItem}
                                        style={busy ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
                                        onClick={() => toggleSelected(project.id)}
                                    >
                                        <span>
                                            {project.name}
                                            {added && <span style={{ marginLeft: 8, opacity: 0.6, fontSize: '0.85em' }}>✓ added</span>}
                                        </span>
                                        <div className={`${styles.checkbox} ${selected ? styles.checkboxChecked : ''}`}>
                                            {selected && <div className={styles.tick}></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {error && <p className={styles.calcError}>{error}</p>}
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.btnPrimary}
                                onClick={addToSelected}
                                disabled={busy || selectedIds.length === 0}
                            >
                                {busy ? "Adding…" : "Add"}
                            </button>
                            <button className={styles.btnSecondary} onClick={() => setStep('create')} disabled={busy}>Create Project</button>
                        </div>
                    </div>
                )}

                {step === 'create' && (
                    <div className={styles.createModalContent}>
                        <h2>Create Project</h2>
                        <div className={styles.projectForm}>
                            <div className={styles.formRow}>
                                <label>Project Name</label>
                                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                            </div>
                            <div className={styles.formRow}>
                                <label>Address</label>
                                <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div className={styles.formRow}>
                                <label>Country</label>
                                <AdminCombobox
                                    value={countryName || "Select Country"}
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
                                <label>City</label>
                                <AdminCombobox
                                    value={city || "Select City"}
                                    onChange={(val: string) => setCity(val)}
                                    options={cities ? cities.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => c.name) : []}
                                    disabled={!countryIsoCode}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label>Phone</label>
                                <PhoneInput
                                    country={'us'}
                                    value={phone}
                                    onChange={(value: string) => setPhone(value)}
                                    inputStyle={{ width: '100%', height: '40px', paddingLeft: '48px', borderRadius: '5px' }}
                                />
                            </div>
                            {error && <p className={styles.calcError}>{error}</p>}
                            <div className={styles.formActions}>
                                <button className={styles.btnSecondary} onClick={() => setStep('projects')} disabled={busy}>Cancel</button>
                                <button className={styles.btnPrimary} onClick={handleCreateAndAdd} disabled={busy}>
                                    {busy ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
