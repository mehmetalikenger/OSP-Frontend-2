"use client";

import { useState, useEffect } from "react";
import styles from "../calculation.module.css";

interface CalculationModalsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CalculationModals({ isOpen, onClose }: CalculationModalsProps) {
    const [step, setStep] = useState<'result' | 'projects' | 'create'>('result');
    const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

    // Form states
    const [projectName, setProjectName] = useState("");
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");

    const mockProjects = [
        { id: 1, name: "Project Alpha" },
        { id: 2, name: "Istanbul Headquarters" },
        { id: 3, name: "New Data Center" },
    ];

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setStep('result');
        onClose();
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
                            <button className={styles.btnSecondary}>Download</button>
                            <button className={styles.btnPrimary} onClick={() => setStep('projects')}>Add to project</button>
                        </div>
                    </div>
                )}

                {step === 'projects' && (
                    <div className={styles.projectsModalContent}>
                        <h2>Projects</h2>
                        <div className={styles.projectsList}>
                            {mockProjects.map(project => (
                                <div 
                                    key={project.id} 
                                    className={styles.projectItem}
                                    onClick={() => {
                                        setSelectedProjects(prev => 
                                            prev.includes(project.id) 
                                                ? prev.filter(id => id !== project.id) 
                                                : [...prev, project.id]
                                        );
                                    }}
                                >
                                    <span>{project.name}</span>
                                    <div className={`${styles.checkbox} ${selectedProjects.includes(project.id) ? styles.checkboxChecked : ''}`}>
                                        {selectedProjects.includes(project.id) && (
                                            <div className={styles.tick}></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnPrimary} onClick={() => setStep('create')}>Create Project</button>
                        </div>
                    </div>
                )}

                {step === 'create' && (
                    <div className={styles.createModalContent}>
                        <h2>Create Project</h2>
                        <div className={styles.projectForm}>
                            <div className={styles.formRow}>
                                <label>Project Name</label>
                                <input 
                                    type="text" 
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label>Address</label>
                                <textarea 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label>Country</label>
                                <input 
                                    type="text" 
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label>City</label>
                                <input 
                                    type="text" 
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label>Phone</label>
                                <input 
                                    type="text" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button className={styles.btnSecondary} onClick={() => setStep('projects')}>Cancel</button>
                                <button className={styles.btnPrimary} onClick={handleClose}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
