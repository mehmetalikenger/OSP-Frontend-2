"use client";

import { useState } from "react";
import styles from "../calculation.module.css";

interface ProductAccordionProps {
    title: string;
    modelName?: string;
    calculationForm?: React.ReactNode;
    documentsContent?: React.ReactNode;
    imagesContent?: React.ReactNode;
    drawingsContent?: React.ReactNode;
    techSpecsContent?: React.ReactNode;
}

export default function ProductAccordion({
    title,
    modelName,
    calculationForm,
    documentsContent,
    imagesContent,
    drawingsContent,
    techSpecsContent
}: ProductAccordionProps) {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <div className={styles.headerBullet}></div>
                <h1>{title}</h1>
            </div>
            <div className={styles.headerLine}></div>
            {modelName && (
                <div className={styles.modelContainer}>
                    <h2>Model</h2>
                    <p className={styles.modelName}>{modelName}</p>
                </div>
            )}
            <div className={styles.sectionContainer}>
                <div className={styles.section}>
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'calculation' ? styles.active : ''}`}
                        onClick={() => toggleSection('calculation')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={`${styles.sectionIcon}`}>
                                <img className={styles.lightIcon} src="../../icons/calculation.png" alt="Calculation" />
                                <img className={styles.darkIcon} src="../../icons/calculation-darkMode.png" alt="Calculation" />
                            </div>
                            <h2>Calculation</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'calculation' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'calculation' && calculationForm}
                </div>

                <div className={styles.section}>
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'documents' ? styles.active : ''}`}
                        onClick={() => toggleSection('documents')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={`${styles.sectionIcon}`}>
                                <img className={styles.lightIcon} src="../../icons/document.png" alt="Documents" />
                                <img className={styles.darkIcon} src="../../icons/document-darkMode.png" alt="Documents" />
                            </div>
                            <h2>Documents</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'documents' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'documents' && documentsContent}
                </div>

                <div className={styles.section}>
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'images' ? styles.active : ''}`}
                        onClick={() => toggleSection('images')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={`${styles.sectionIcon}`}>
                                <img className={styles.lightIcon} src="../../icons/image.png" alt="Images" />
                                <img className={styles.darkIcon} src="../../icons/image-darkMode.png" alt="Images" />
                            </div>
                            <h2>Images</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'images' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'images' && imagesContent}
                </div>

                <div className={styles.section}>
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'drawings' ? styles.active : ''}`}
                        onClick={() => toggleSection('drawings')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={`${styles.sectionIcon}`}>
                                <img className={styles.lightIcon} src="../../icons/drawing.png" alt="Drawings" />
                                <img className={styles.darkIcon} src="../../icons/drawing-darkMode.png" alt="Drawings" />
                            </div>
                            <h2>Drawings</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'drawings' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'drawings' && drawingsContent}
                </div>

                <div className={styles.section}>
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'techSpecs' ? styles.active : ''}`}
                        onClick={() => toggleSection('techSpecs')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={`${styles.sectionIcon}`}>
                                <img className={styles.lightIcon} src="../../icons/techSpec.png" alt="Tech Specs" />
                                <img className={styles.darkIcon} src="../../icons/techSpec-darkMode.png" alt="Tech Specs" />
                            </div>
                            <h2>Tech Specs</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'techSpecs' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'techSpecs' && techSpecsContent}
                </div>
            </div>
        </div>
    );
}
