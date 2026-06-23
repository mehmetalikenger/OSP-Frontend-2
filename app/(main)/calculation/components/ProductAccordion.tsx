"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "../calculation.module.css";

interface CalcAsset {
    url: string;
    fileName: string | null;
}

interface TechSpec {
    label: string;
    value: string;
}

interface ProductAccordionProps {
    title: string;
    unitName?: string;
    modelName?: string;
    calculationForm?: React.ReactNode;
    images?: CalcAsset[];
    drawings?: CalcAsset[];
    documents?: CalcAsset[];
    specs?: TechSpec[];
}

export default function ProductAccordion({
    title,
    unitName,
    modelName,
    calculationForm,
    images = [],
    drawings = [],
    documents = [],
    specs = [],
}: ProductAccordionProps) {
    const t = useTranslations("Calc");
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
    const [fullscreenArray, setFullscreenArray] = useState<string[] | null>(null);

    useEffect(() => {
        let isDesktop = window.innerWidth >= 1200;

        const handleResize = () => {
            const currentlyDesktop = window.innerWidth >= 1200;
            if (currentlyDesktop && !isDesktop) {
                setActiveSection((prev) => prev ? prev : "calculation");
            }
            isDesktop = currentlyDesktop;
        };

        if (isDesktop) {
            setActiveSection("calculation");
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [zoomScale, setZoomScale] = useState<number>(1);
    const [zoomOrigin, setZoomOrigin] = useState<string>("center center");

    const handleZoomInteraction = (clientX: number, clientY: number, currentTarget: HTMLDivElement) => {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = ((clientX - left) / width) * 100;
        const y = ((clientY - top) / height) * 100;
        setZoomOrigin(`${x}% ${y}%`);
        setZoomScale(2.5);
    };

    const handleZoomReset = () => {
        setZoomScale(1);
        setTimeout(() => setZoomOrigin("center center"), 200);
    };

    const toggleSection = (section: string) => {
        const isDesktop = window.innerWidth >= 1200;
        const isOpening = activeSection !== section;

        if (isDesktop && !isOpening) return;

        setActiveSection(isOpening ? section : null);

        if (isOpening) {
            setTimeout(() => {
                const element = document.getElementById(`section-${section}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    useEffect(() => {
        if (fullscreenArray !== null) {
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
    }, [fullscreenArray]);

    const imageUrls = images.map(i => i.url);
    const drawingUrls = drawings.map(d => d.url);

    return (
        <div className={styles.main}>
            <div className={styles.backBtnContainer} onClick={() => router.back()}>
                <img src="/icons/back-arrow-2.png" className={styles.lightIcon} alt="Back" />
                <img src="/icons/back-arrow.png" className={styles.darkIcon} alt="Back" />
            </div>
            <div className={styles.header}>
                <div className={styles.headerBullet}></div>
                <h1>{title}</h1>
            </div>
            <div className={styles.headerLine}></div>
            {(unitName || modelName) && (
                <div className={styles.modelContainer}>
                    {unitName && (
                        <>
                            <h2>{t("name")}</h2>
                            <p className={styles.modelName}>{unitName}</p>
                        </>
                    )}
                    {modelName && (
                        <>
                            <h2>{t("model")}</h2>
                            <p className={styles.modelName}>{modelName}</p>
                        </>
                    )}
                </div>
            )}
            <div className={styles.sectionContainer}>
                <div className={styles.section} id="section-calculation">
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'calculation' ? styles.active : ''}`}
                        onClick={() => toggleSection('calculation')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={styles.sectionIcon}>
                                <img className={styles.lightIcon} src="../../icons/calculation.png" alt="Calculation" />
                                <img className={styles.darkIcon} src="../../icons/calculation-darkMode.png" alt="Calculation" />
                            </div>
                            <h2>{t("calculation")}</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'calculation' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'calculation' && calculationForm}
                </div>

                <div className={styles.section} id="section-documents">
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'documents' ? styles.active : ''}`}
                        onClick={() => toggleSection('documents')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={styles.sectionIcon}>
                                <img className={styles.lightIcon} src="../../icons/document.png" alt="Documents" />
                                <img className={styles.darkIcon} src="../../icons/document-darkMode.png" alt="Documents" />
                            </div>
                            <h2>{t("documents")}</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'documents' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'documents' && (
                        <div className={styles.sectionContent}>
                            <div className={styles.documentsContainer}>
                                {documents.length > 0 ? documents.map((doc, i) => (
                                    <div className={styles.document} key={i}>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            {doc.fileName || t("documentN", { n: i + 1 })}
                                        </a>
                                    </div>
                                )) : (
                                    <p style={{ padding: "12px", color: "#888" }}>{t("noDocuments")}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.section} id="section-images">
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'images' ? styles.active : ''}`}
                        onClick={() => toggleSection('images')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={styles.sectionIcon}>
                                <img className={styles.lightIcon} src="../../icons/image.png" alt="Images" />
                                <img className={styles.darkIcon} src="../../icons/image-darkMode.png" alt="Images" />
                            </div>
                            <h2>{t("images")}</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'images' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'images' && (
                        <div className={styles.sectionContent}>
                            <div className={styles.imagesContainer}>
                                {images.length > 0 ? imageUrls.map((src, index) => (
                                    <div className={styles.image} key={index} onClick={() => {
                                        setFullscreenArray(imageUrls);
                                        setFullscreenIndex(index);
                                        handleZoomReset();
                                    }}>
                                        <img src={src} alt="product image" style={{ cursor: 'pointer' }} />
                                    </div>
                                )) : (
                                    <p style={{ padding: "12px", color: "#888" }}>{t("noImages")}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.section} id="section-drawings">
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'drawings' ? styles.active : ''}`}
                        onClick={() => toggleSection('drawings')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={styles.sectionIcon}>
                                <img className={styles.lightIcon} src="../../icons/drawing.png" alt="Drawings" />
                                <img className={styles.darkIcon} src="../../icons/drawing-darkMode.png" alt="Drawings" />
                            </div>
                            <h2>{t("drawings")}</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'drawings' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'drawings' && (
                        <div className={styles.sectionContent}>
                            <div className={styles.imagesContainer}>
                                {drawings.length > 0 ? drawingUrls.map((src, index) => (
                                    <div className={styles.image} key={index} onClick={() => {
                                        setFullscreenArray(drawingUrls);
                                        setFullscreenIndex(index);
                                        handleZoomReset();
                                    }}>
                                        <img src={src} alt="drawing" style={{ cursor: 'pointer' }} />
                                    </div>
                                )) : (
                                    <p style={{ padding: "12px", color: "#888" }}>{t("noDrawings")}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.section} id="section-techSpecs">
                    <div
                        className={`${styles.sectionButton} ${activeSection === 'techSpecs' ? styles.active : ''}`}
                        onClick={() => toggleSection('techSpecs')}
                    >
                        <div className={styles.buttonContent}>
                            <div className={styles.sectionIcon}>
                                <img className={styles.lightIcon} src="../../icons/techSpec.png" alt="Tech Specs" />
                                <img className={styles.darkIcon} src="../../icons/techSpec-darkMode.png" alt="Tech Specs" />
                            </div>
                            <h2>{t("techSpecs")}</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'techSpecs' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'techSpecs' && (
                        <div className={styles.sectionContent}>
                            <div className={styles.unitSpecs}>
                                {specs.length > 0 ? (
                                    <ul>
                                        {specs.map(s => (
                                            <li key={s.label}>
                                                <span className={styles.specTitle}>{s.label}:</span>
                                                <span className={styles.specValue}>{s.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ padding: "12px", color: "#888" }}>{t("noSpecs")}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {fullscreenArray !== null && fullscreenIndex !== null && (
                <div className={styles.fullscreenModal} onClick={() => {
                    setFullscreenArray(null);
                    handleZoomReset();
                }}>
                    <div className={styles.fullscreenClose} onClick={() => {
                        setFullscreenArray(null);
                        handleZoomReset();
                    }}>
                        <img src="../../icons/closeBtn.png" className={styles.lightIcon} alt="Close Button" />
                        <img src="../../icons/closeBtn-second.png" className={styles.darkIcon} alt="Close Button" />
                    </div>

                    <div
                        className={styles.imageWrapper}
                        onClick={(e) => e.stopPropagation()}
                        onMouseMove={(e) => handleZoomInteraction(e.clientX, e.clientY, e.currentTarget)}
                        onTouchMove={(e) => handleZoomInteraction(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget)}
                        onMouseLeave={handleZoomReset}
                        onTouchEnd={handleZoomReset}
                    >
                        <img
                            src={fullscreenArray[fullscreenIndex]}
                            alt="Fullscreen"
                            className={`${styles.fullscreenImage} ${zoomScale > 1 ? styles.zoomed : ''}`}
                            style={{
                                transform: `scale(${zoomScale})`,
                                transformOrigin: zoomOrigin,
                                cursor: zoomScale > 1 ? 'zoom-out' : 'zoom-in'
                            }}
                        />
                    </div>

                    <div className={styles.fullscreenControls}>
                        <div
                            className={styles.arrowLeft}
                            onClick={(e) => {
                                e.stopPropagation();
                                setFullscreenIndex((prev) => prev === 0 ? fullscreenArray.length - 1 : prev! - 1);
                                handleZoomReset();
                            }}
                        >
                            <img src="../../icons/back.png" className={styles.lightIcon} alt="Previous" />
                            <img src="../../icons/back-darkMode.png" className={styles.darkIcon} alt="Previous" />
                        </div>

                        <div
                            className={styles.arrowRight}
                            onClick={(e) => {
                                e.stopPropagation();
                                setFullscreenIndex((prev) => prev === fullscreenArray.length - 1 ? 0 : prev! + 1);
                                handleZoomReset();
                            }}
                        >
                            <img src="../../icons/back.png" className={styles.lightIcon} alt="Next" />
                            <img src="../../icons/back-darkMode.png" className={styles.darkIcon} alt="Next" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
