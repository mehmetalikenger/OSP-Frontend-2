"use client";

import { useState, useEffect, useContext } from "react";
import { SavedUnitsContext } from "../layout";
import styles from "../savedUnits.module.css";

export default function ChillersPage() {
    const { selectedType } = useContext(SavedUnitsContext);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [airCooledList, setAirCooledList] = useState([1, 2, 3, 4, 5]);
    const [waterCooledList, setWaterCooledList] = useState([1, 2, 3]);

    useEffect(() => {
        if (isDetailsOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isDetailsOpen]);

    const handleRemoveAir = (id: number) => {
        setAirCooledList(prev => prev.filter(item => item !== id));
    };

    const handleRemoveWater = (id: number) => {
        setWaterCooledList(prev => prev.filter(item => item !== id));
    };

    const isAirCooled = selectedType === "Air Cooled";

    return (
        <>
            <div className={styles.container} style={{ minHeight: "auto", paddingBottom: "50px" }}>
                {/* Mobile Products */}
                <div className={`${styles.products} ${styles.productsMobile}`}>
                    {isAirCooled ? (
                        // Air Cooled Chillers
                        airCooledList.map((id) => (
                            <div className={styles.product} key={`chiller-air-mobile-${id}`}>
                                <div className={styles.removeBtnContainer}>
                                    <div className={styles.closeBtn} onClick={() => handleRemoveAir(id)}>
                                        <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Remove Button" />
                                        <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Remove Button" />
                                    </div>
                                </div>
                                <div className={styles.productContent}>
                                    <div className={styles.productDetails}>
                                        <div className={styles.productInfo}>
                                            <div className={styles.productTitle}>
                                                <h2>OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit</h2>
                                            </div>
                                            <div className={styles.productImage}>
                                                <img src="/images/products/824186.png" alt="Air Cooled Chiller" />
                                            </div>
                                            <div className={styles.productSpecs}>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Capacity Range: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>126 to 1585 kW</p>
                                                    </div>
                                                </div>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Benefits: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>Highly efficient</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Water Cooled Chillers
                        waterCooledList.map((id) => (
                            <div className={styles.product} key={`chiller-water-mobile-${id}`}>
                                <div className={styles.removeBtnContainer}>
                                    <div className={styles.closeBtn} onClick={() => handleRemoveWater(id)}>
                                        <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Remove Button" />
                                        <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Remove Button" />
                                    </div>
                                </div>
                                <div className={styles.productContent}>
                                    <div className={styles.productDetails}>
                                        <div className={styles.productInfo}>
                                            <div className={styles.productTitle}>
                                                <h2>OffiTec Modular High-Capacity Water-Cooled Industrial Chiller Unit</h2>
                                            </div>
                                            <div className={styles.productImage}>
                                                <img src="/images/products/824186.png" alt="Water Cooled Chiller" />
                                            </div>
                                            <div className={styles.productSpecs}>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Capacity Range: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>126 to 1585 kW</p>
                                                    </div>
                                                </div>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Benefits: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>Highly efficient</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Products */}
                <div className={`${styles.products} ${styles.productsDesktop}`}>
                    {isAirCooled ? (
                        // Air Cooled Chillers
                        airCooledList.map((id) => (
                            <div className={styles.product} key={`chiller-air-desktop-${id}`}>
                                <div className={styles.removeBtnContainer}>
                                    <div className={styles.closeBtn} onClick={() => handleRemoveAir(id)}>
                                        <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Remove Button" />
                                        <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Remove Button" />
                                    </div>
                                </div>
                                <div className={styles.productContent}>
                                    <div className={styles.productDetails}>
                                        <div className={styles.productInfo}>
                                            <div className={styles.productTitle}>
                                                <h2>OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit</h2>
                                            </div>
                                            <div className={styles.productSpecs}>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Capacity Range: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>126 to 1585 kW</p>
                                                    </div>
                                                </div>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Benefits: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>Highly efficient</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.productImage}>
                                            <img src="/images/products/824186.png" alt="Air Cooled Chiller" />
                                        </div>
                                    </div>
                                    <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Water Cooled Chillers
                        waterCooledList.map((id) => (
                            <div className={styles.product} key={`chiller-water-desktop-${id}`}>
                                <div className={styles.removeBtnContainer}>
                                    <div className={styles.closeBtn} onClick={() => handleRemoveWater(id)}>
                                        <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Remove Button" />
                                        <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Remove Button" />
                                    </div>
                                </div>
                                <div className={styles.productContent}>
                                    <div className={styles.productDetails}>
                                        <div className={styles.productInfo}>
                                            <div className={styles.productTitle}>
                                                <h2>OffiTec Modular High-Capacity Water-Cooled Industrial Chiller Unit</h2>
                                            </div>
                                            <div className={styles.productSpecs}>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Capacity Range: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>126 to 1585 kW</p>
                                                    </div>
                                                </div>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Benefits: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>Highly efficient</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.productImage}>
                                            <img src="/images/products/569547.png" alt="Water Cooled Chiller" />
                                        </div>
                                    </div>
                                    <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Details Modal overlay & layout */}
            {isDetailsOpen && <div className={styles.modalOverlay} onClick={() => setIsDetailsOpen(false)}></div>}
            {isDetailsOpen && (
                <>
                    {/* Mobile Details Modal */}
                    <div className={`${styles.unitDetails} ${styles.unitDetailsMobile}`}>
                        <div className={styles.closeBtn} onClick={() => setIsDetailsOpen(false)}>
                            <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Close Button" />
                            <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close Button" />
                        </div>
                        <div className={styles.unitDetailContainer}>
                            <div className={styles.unitName}>
                                <h2>
                                    {isAirCooled
                                        ? "OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit"
                                        : "OffiTec Modular High-Capacity Water-Cooled Industrial Chiller Unit"}
                                </h2>
                            </div>
                            <div className={styles.unitImage}>
                                <img
                                    src={isAirCooled ? "/images/products/745729.png" : "/images/products/569547.png"}
                                    alt={isAirCooled ? "Air Cooled Chiller" : "Water Cooled Chiller"}
                                />
                            </div>
                            <div className={styles.unitDesc}>
                                <p>
                                    {isAirCooled
                                        ? "The OffiTec modular high-capacity air-cooled chiller unit is engineered for large industrial facilities, process cooling lines, data centers, and high-flow HVAC applications. Its extended modular body accommodates multiple compressors and large-surface heat exchangers, delivering exceptional efficiency."
                                        : "The OffiTec modular high-capacity water-cooled chiller unit is engineered for large industrial facilities, process cooling lines, data centers, and high-flow HVAC applications. Its design works in tandem with cooling towers or external water sources, delivering exceptional efficiency, stable operations, and low noise levels."}
                                </p>
                            </div>
                            <div className={styles.btnIcons}>
                                <div className={styles.icons}>
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                </div>
                                <button className={styles.calcBtn}>Calculate</button>
                            </div>
                            <div className={styles.unitSpecs}>
                                <h3>Technical Specifications</h3>
                                <ul>
                                    <li>
                                        <span className={styles.specTitle}>Capacity Range:</span>
                                        <span className={styles.specValue}>126 to 1585 kW</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Design:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Long modular frame with multi-fan top section"
                                                : "Long modular frame water-cooled condenser system"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Ambient Temperature Range:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "-18°C to 46°C"
                                                : "Indoor installation with outdoor cooling tower link"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Options:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Free cooling, heat recovery, water pump, buffer tank, etc"
                                                : "Heat recovery, integrated water pump, buffer tank, etc"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Benefits:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "High efficiency, modular, flexible, easy to install"
                                                : "Superb energy efficiency ratio (EER), stable, compact size"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Advantages:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Low noise, easy to maintain, reliable, long-term durability"
                                                : "Quiet indoor operation, extremely reliable, long-term durability"}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Details Modal */}
                    <div className={`${styles.unitDetails} ${styles.unitDetailsDesktop}`}>
                        <div className={styles.closeBtn} onClick={() => setIsDetailsOpen(false)}>
                            <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Close Button" />
                            <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close Button" />
                        </div>
                        <div className={styles.unitDetailContainer}>
                            <div className={styles.unitName}>
                                <h2>
                                    {isAirCooled
                                        ? "OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit"
                                        : "OffiTec Modular High-Capacity Water-Cooled Industrial Chiller Unit"}
                                </h2>
                            </div>
                            <div className={styles.unitInfo}>
                                <div className={styles.unitDesc}>
                                    <p>
                                        {isAirCooled
                                            ? "The OffiTec modular high-capacity air-cooled chiller unit is engineered for large industrial facilities, process cooling lines, data centers, and high-flow HVAC applications. Its extended modular body accommodates multiple compressors and large-surface heat exchangers, delivering exceptional efficiency."
                                            : "The OffiTec modular high-capacity water-cooled chiller unit is engineered for large industrial facilities, process cooling lines, data centers, and high-flow HVAC applications. Its design works in tandem with cooling towers or external water sources, delivering exceptional efficiency, stable operations, and low noise levels."}
                                    </p>
                                </div>
                                <div className={styles.unitImage}>
                                    <img
                                        src={isAirCooled ? "/images/products/745729.png" : "/images/products/569547.png"}
                                        alt={isAirCooled ? "Air Cooled Chiller" : "Water Cooled Chiller"}
                                    />
                                </div>
                            </div>
                            <div className={styles.btnIcons}>
                                <div className={styles.icons}>
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                    <img src="/icons/tune.png" alt="Unit icon" />
                                </div>
                                <button className={styles.calcBtn}>Calculate</button>
                            </div>
                            <div className={styles.unitSpecs}>
                                <h3>Technical Specifications</h3>
                                <ul>
                                    <li>
                                        <span className={styles.specTitle}>Capacity Range:</span>
                                        <span className={styles.specValue}>126 to 1585 kW</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Design:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Long modular frame with multi-fan top section"
                                                : "Long modular frame water-cooled condenser system"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Ambient Temperature Range:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "-18°C to 46°C"
                                                : "Indoor installation with outdoor cooling tower link"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Options:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Free cooling, heat recovery, water pump, buffer tank, etc"
                                                : "Heat recovery, integrated water pump, buffer tank, etc"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Benefits:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "High efficiency, modular, flexible, easy to install"
                                                : "Superb energy efficiency ratio (EER), stable, compact size"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Advantages:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Low noise, easy to maintain, reliable, long-term durability"
                                                : "Quiet indoor operation, extremely reliable, long-term durability"}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
