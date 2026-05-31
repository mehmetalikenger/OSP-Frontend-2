"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

        // Initial setup
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

    const productImages = [
        "../../images/Products/310171.png",
        "../../images/Products/569547.png",
        "../../images/Products/745729.png"
    ];

    const productDrawings = [
        "../../images/Products/824186.png",
        "../../images/Products/569547.png",
        "../../images/Products/745729.png"
    ];

    const toggleSection = (section: string) => {
        const isOpening = activeSection !== section;
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
            {modelName && (
                <div className={styles.modelContainer}>
                    <h2>Model</h2>
                    <p className={styles.modelName}>{modelName}</p>
                </div>
            )}
            <div className={styles.sectionContainer}>
                <div className={styles.section} id="section-calculation">
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

                <div className={styles.section} id="section-documents">
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
                    {activeSection === 'documents' && (
                        <div className={styles.sectionContent}>
                            <div className={styles.documentsContainer}>
                                <div className={styles.document}>
                                    <a href="#">Product Catalog</a>
                                </div>
                                <div className={styles.document}>
                                    <a href="#">Instruction Manual</a>
                                </div>
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
                            <div className={`${styles.sectionIcon}`}>
                                <img className={styles.lightIcon} src="../../icons/image.png" alt="Images" />
                                <img className={styles.darkIcon} src="../../icons/image-darkMode.png" alt="Images" />
                            </div>
                            <h2>Images</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'images' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'images' && (
                        <div className={styles.sectionContent}>
                            <div className={styles.imagesContainer}>
                                {productImages.map((src, index) => (
                                    <div className={styles.image} key={index} onClick={() => {
                                        setFullscreenArray(productImages);
                                        setFullscreenIndex(index);
                                        handleZoomReset();
                                    }}>
                                        <img src={src} alt="air-cooled-chiller" style={{ cursor: 'pointer' }} />
                                    </div>
                                ))}
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
                            <div className={`${styles.sectionIcon}`}>
                                <img className={styles.lightIcon} src="../../icons/drawing.png" alt="Drawings" />
                                <img className={styles.darkIcon} src="../../icons/drawing-darkMode.png" alt="Drawings" />
                            </div>
                            <h2>Drawings</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'drawings' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'drawings' && (
                        <div className={styles.sectionContent}>
                            <div className={styles.imagesContainer}>
                                {productDrawings.map((src, index) => (
                                    <div className={styles.image} key={index} onClick={() => {
                                        setFullscreenArray(productDrawings);
                                        setFullscreenIndex(index);
                                        handleZoomReset();
                                    }}>
                                        <img src={src} alt="drawing" style={{ cursor: 'pointer' }} />
                                    </div>
                                ))}
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
                            <div className={`${styles.sectionIcon}`}>
                                <img className={styles.lightIcon} src="../../icons/techSpec.png" alt="Tech Specs" />
                                <img className={styles.darkIcon} src="../../icons/techSpec-darkMode.png" alt="Tech Specs" />
                            </div>
                            <h2>Tech Specs</h2>
                        </div>
                        <img className={styles.sectionArrow} src={activeSection === 'techSpecs' ? "../../icons/back-darkMode-2.png" : "../../icons/back.png"} alt="Arrow Icon" />
                    </div>
                    {activeSection === 'techSpecs' && (
                        <div className={styles.sectionContent}>
                            <div className={styles.unitSpecs}>
                                <ul>
                                    <li>
                                        <span className={styles.specTitle}>Capacity Range:</span>
                                        <span className={styles.specValue}>80 to 1200 kW</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Design:</span>
                                        <span className={styles.specValue}>
                                            Long modular frame with multi-fan top sections
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Ambient Temperature Range:</span>
                                        <span className={styles.specValue}>
                                            -20°C to 43°C
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Options:</span>
                                        <span className={styles.specValue}>
                                            Defrost optimization, integrated water pump, buffer tank, etc
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Benefits:</span>
                                        <span className={styles.specValue}>
                                            High heating COP, dual mode (heating/cooling), flexible
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Advantages:</span>
                                        <span className={styles.specValue}>
                                            Low noise, zero combustion emissions, extremely reliable
                                        </span>
                                    </li>
                                </ul>
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
