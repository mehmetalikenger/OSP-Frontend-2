"use client";

import { useState, useEffect, useContext } from "react";
import { SavedUnitsContext } from "../layout";
import styles from "../savedUnits.module.css";

export default function HeatPumpsPage() {
    const { selectedType } = useContext(SavedUnitsContext);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [airCooledList, setAirCooledList] = useState([1, 2, 3]);
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

    const isAirCooled = selectedType === "Air to Water";

    return (
        <>
            <div className={styles.container} style={{ minHeight: "auto", paddingBottom: "50px" }}>
                {/* Mobile Products */}
                <div className={`${styles.products} ${styles.productsMobile}`}>
                    {isAirCooled ? (
                        // Air Cooled Heat Pumps
                        airCooledList.map((id) => (
                            <div className={styles.product} key={`hp-air-mobile-${id}`}>
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
                                                <h2>OffiTec Modular High-Capacity Air-Cooled Heat Pump Unit</h2>
                                            </div>
                                            <div className={styles.productImage}>
                                                <img src="/images/products/745729.png" alt="Air Cooled Heat Pump" />
                                            </div>
                                            <div className={styles.productSpecs}>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Capacity Range: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>80 to 1200 kW</p>
                                                    </div>
                                                </div>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Benefits: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>Highly efficient heating</p>
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
                        // Water Cooled Heat Pumps
                        waterCooledList.map((id) => (
                            <div className={styles.product} key={`hp-water-mobile-${id}`}>
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
                                                <h2>OffiTec Modular High-Capacity Water-Cooled Heat Pump Unit</h2>
                                            </div>
                                            <div className={styles.productImage}>
                                                <img src="/images/products/569547.png" alt="Water Cooled Heat Pump" />
                                            </div>
                                            <div className={styles.productSpecs}>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Capacity Range: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>90 to 1450 kW</p>
                                                    </div>
                                                </div>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Benefits: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>Extremely high COP</p>
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
                        // Air Cooled Heat Pumps
                        airCooledList.map((id) => (
                            <div className={styles.product} key={`hp-air-desktop-${id}`}>
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
                                                <h2>OffiTec Modular High-Capacity Air-Cooled Heat Pump Unit</h2>
                                            </div>
                                            <div className={styles.productSpecs}>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Capacity Range: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>80 to 1200 kW</p>
                                                    </div>
                                                </div>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Benefits: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>Highly efficient heating</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.productImage}>
                                            <img src="/images/products/745729.png" alt="Air Cooled Heat Pump" />
                                        </div>
                                    </div>
                                    <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Water Cooled Heat Pumps
                        waterCooledList.map((id) => (
                            <div className={styles.product} key={`hp-water-desktop-${id}`}>
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
                                                <h2>OffiTec Modular High-Capacity Water-Cooled Heat Pump Unit</h2>
                                            </div>
                                            <div className={styles.productSpecs}>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Capacity Range: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>90 to 1450 kW</p>
                                                    </div>
                                                </div>
                                                <div className={styles.spec}>
                                                    <div className={styles.specTitle}>
                                                        <h4>Benefits: </h4>
                                                    </div>
                                                    <div className={styles.specValue}>
                                                        <p>Extremely high COP</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.productImage}>
                                            <img src="/images/products/569547.png" alt="Water Cooled Heat Pump" />
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
                                        ? "OffiTec Modular High-Capacity Air-Cooled Heat Pump Unit"
                                        : "OffiTec Modular High-Capacity Water-Cooled Heat Pump Unit"}
                                </h2>
                            </div>
                            <div className={styles.unitImage}>
                                <img
                                    src={isAirCooled ? "/images/products/745729.png" : "/images/products/569547.png"}
                                    alt={isAirCooled ? "Air Cooled Heat Pump" : "Water Cooled Heat Pump"}
                                />
                            </div>
                            <div className={styles.unitDesc}>
                                <p>
                                    {isAirCooled
                                        ? "The OffiTec modular high-capacity air-cooled heat pump unit is engineered for large industrial facilities, process heating and cooling lines, and high-flow HVAC applications. It utilizes advanced thermodynamic cycles to provide clean, high-efficiency heating and cooling, ensuring rapid payback times and low operating costs."
                                        : "The OffiTec modular high-capacity water-cooled heat pump unit is engineered for large industrial facilities, process heating and cooling lines, data centers, and high-flow HVAC applications. Working in tandem with geothermal wells, waste heat channels, or industrial cooling loops, it delivers the industry's highest COP and extremely stable operations year-round."}
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
                                        <span className={styles.specValue}>{isAirCooled ? "80 to 1200 kW" : "90 to 1450 kW"}</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Design:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Long modular frame with multi-fan top sections"
                                                : "High-rigidity water-to-water modular frame"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Ambient Temperature Range:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "-20°C to 43°C"
                                                : "Indoor plant installation, stable heat source link"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Options:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Defrost optimization, integrated water pump, buffer tank, etc"
                                                : "Geothermal optimization, multi-stage recovery, soft starter"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Benefits:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "High heating COP, dual mode (heating/cooling), flexible"
                                                : "Incredible energy savings, zero weather dependency, long life"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Advantages:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Low noise, zero combustion emissions, extremely reliable"
                                                : "Ultra-quiet indoor operation, minimal maintenance, premium durability"}
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
                                        ? "OffiTec Modular High-Capacity Air-Cooled Heat Pump Unit"
                                        : "OffiTec Modular High-Capacity Water-Cooled Heat Pump Unit"}
                                </h2>
                            </div>
                            <div className={styles.unitInfo}>
                                <div className={styles.unitDesc}>
                                    <p>
                                        {isAirCooled
                                            ? "The OffiTec modular high-capacity air-cooled heat pump unit is engineered for large industrial facilities, process heating and cooling lines, and high-flow HVAC applications. It utilizes advanced thermodynamic cycles to provide clean, high-efficiency heating and cooling, ensuring rapid payback times and low operating costs."
                                            : "The OffiTec modular high-capacity water-cooled heat pump unit is engineered for large industrial facilities, process heating and cooling lines, data centers, and high-flow HVAC applications. Working in tandem with geothermal wells, waste heat channels, or industrial cooling loops, it delivers the industry's highest COP and extremely stable operations year-round."}
                                    </p>
                                </div>
                                <div className={styles.unitImage}>
                                    <img
                                        src={isAirCooled ? "/images/products/745729.png" : "/images/products/569547.png"}
                                        alt={isAirCooled ? "Air Cooled Heat Pump" : "Water Cooled Heat Pump"}
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
                                        <span className={styles.specValue}>{isAirCooled ? "80 to 1200 kW" : "90 to 1450 kW"}</span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Design:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Long modular frame with multi-fan top sections"
                                                : "High-rigidity water-to-water modular frame"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Ambient Temperature Range:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "-20°C to 43°C"
                                                : "Indoor plant installation, stable heat source link"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Options:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Defrost optimization, integrated water pump, buffer tank, etc"
                                                : "Geothermal optimization, multi-stage recovery, soft starter"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Benefits:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "High heating COP, dual mode (heating/cooling), flexible"
                                                : "Incredible energy savings, zero weather dependency, long life"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className={styles.specTitle}>Advantages:</span>
                                        <span className={styles.specValue}>
                                            {isAirCooled
                                                ? "Low noise, zero combustion emissions, extremely reliable"
                                                : "Ultra-quiet indoor operation, minimal maintenance, premium durability"}
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
