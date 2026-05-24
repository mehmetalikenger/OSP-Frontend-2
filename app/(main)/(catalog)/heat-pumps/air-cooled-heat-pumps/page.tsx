"use client";
import { useState, useEffect } from "react";
import styles from "../../category.module.css";

export default function AirCooledHeatPumpsPage() {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

    return (
        <>
            <div className={styles.container}>
                <div className={styles.category}>
                    <h1>Air Cooled Heat Pumps</h1>
                </div>
                {/* Mobile Products */}
                <div className={`${styles.products} ${styles.productsMobile}`}>
                    <div className={styles.product}>
                        <div className={styles.productDetails}>
                            <div className={styles.productInfo}>
                                <div className={styles.productTitle}>
                                    <h2>OffiTec Modular High-Capacity Air-Cooled Heat Pump Unit</h2>
                                </div>
                                <div className={styles.productImage}>
                                    <img src="../images/products/745729.png" alt="Air Cooled Heat Pump" />
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
                    <div className={styles.product}>
                        <div className={styles.productDetails}>
                            <div className={styles.productInfo}>
                                <div className={styles.productTitle}>
                                    <h2>OffiTec Modular High-Capacity Air-Cooled Heat Pump Unit</h2>
                                </div>
                                <div className={styles.productImage}>
                                    <img src="../images/products/745729.png" alt="Air Cooled Heat Pump" />
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
                    <div className={styles.product}>
                        <div className={styles.productDetails}>
                            <div className={styles.productInfo}>
                                <div className={styles.productTitle}>
                                    <h2>OffiTec Modular High-Capacity Air-Cooled Heat Pump Unit</h2>
                                </div>
                                <div className={styles.productImage}>
                                    <img src="../images/products/745729.png" alt="Air Cooled Heat Pump" />
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
                {/* Desktop Products */}
                <div className={`${styles.products} ${styles.productsDesktop}`}>
                    <div className={styles.product}>
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
                                <img src="../images/products/745729.png" alt="Air Cooled Heat Pump" />
                            </div>
                        </div>
                        <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                            View
                        </button>
                    </div>
                    <div className={styles.product}>
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
                                <img src="../images/products/745729.png" alt="Air Cooled Heat Pump" />
                            </div>
                        </div>
                        <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                            View
                        </button>
                    </div>
                    <div className={styles.product}>
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
                                <img src="../images/products/745729.png" alt="Air Cooled Heat Pump" />
                            </div>
                        </div>
                        <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                            View
                        </button>
                    </div>
                </div>
                <div className={styles.bottomLogo}>
                    <img src="../logo/logo.png" alt="OffiTec Logo" />
                </div>
            </div>
            {isDetailsOpen && <div className={styles.modalOverlay} onClick={() => setIsDetailsOpen(false)}></div>}
            {isDetailsOpen && (
                <div className={`${styles.unitDetails} ${styles.unitDetailsMobile}`}>
                    <div className={styles.closeBtn} onClick={() => setIsDetailsOpen(false)}>
                        <img src="../icons/closeBtn.png" className={styles.closeBtnLight} alt="Close Button" />
                        <img src="../icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close Button" />
                    </div>
                    <div className={styles.unitDetailContainer}>
                        <div className={styles.unitName}>
                            <h2>OffiTec Modular High-Capacity Air-Cooled Heat Pump Unit</h2>
                        </div>
                        <div className={styles.unitImage}>
                            <img src="../images/products/745729.png" alt="Air Cooled Heat Pump" />
                        </div>
                        <div className={styles.unitDesc}>
                            <p>The OffiTec modular high-capacity air-cooled heat pump unit is engineered for large industrial facilities,
                                process heating and cooling lines, and high-flow HVAC applications.
                                It utilizes advanced thermodynamic cycles to provide clean, high-efficiency heating and cooling,
                                ensuring rapid payback times and low operating costs.</p>
                        </div>
                        <div className={styles.btnIcons}>
                            <div className={styles.icons}>
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                            </div>
                            <button className={styles.calcBtn}>Calculate</button>
                        </div>
                        <div className={styles.unitSpecs}>
                            <h3>Technical Specifications</h3>
                            <ul>
                                <li>
                                    <span className={styles.specTitle}>Capacity Range:</span>
                                    <span className={styles.specValue}>80 to 1200 kW</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Design:</span>
                                    <span className={styles.specValue}>Long modular frame with multi-fan top sections</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Ambient Temperature Range:</span>
                                    <span className={styles.specValue}>-20°C to 43°C</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Options:</span>
                                    <span className={styles.specValue}>Defrost optimization, integrated water pump, buffer tank, etc</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Benefits:</span>
                                    <span className={styles.specValue}>High heating COP, dual mode (heating/cooling), flexible</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Advantages:</span>
                                    <span className={styles.specValue}>Low noise, zero combustion emissions, extremely reliable</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            {isDetailsOpen && (
                <div className={`${styles.unitDetails} ${styles.unitDetailsDesktop}`}>
                    <div className={styles.closeBtn} onClick={() => setIsDetailsOpen(false)}>
                        <img src="../icons/closeBtn.png" className={styles.closeBtnLight} alt="Close Button" />
                        <img src="../icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close Button" />
                    </div>
                    <div className={styles.unitDetailContainer}>
                        <div className={styles.unitName}>
                            <h2>OffiTec Modular High-Capacity Air-Cooled Heat Pump Unit</h2>
                        </div>
                        <div className={styles.unitInfo}>
                            <div className={styles.unitDesc}>
                                <p>The OffiTec modular high-capacity air-cooled heat pump unit is engineered for large industrial facilities,
                                    process heating and cooling lines, and high-flow HVAC applications.
                                    It utilizes advanced thermodynamic cycles to provide clean, high-efficiency heating and cooling,
                                    ensuring rapid payback times and low operating costs.</p>
                            </div>
                            <div className={styles.unitImage}>
                                <img src="../images/products/745729.png" alt="Air Cooled Heat Pump" />
                            </div>
                        </div>
                        <div className={styles.btnIcons}>
                            <div className={styles.icons}>
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                                <img src="../icons/tune.png" alt="Unit icon" />
                            </div>
                            <button className={styles.calcBtn}>Calculate</button>
                        </div>
                        <div className={styles.unitSpecs}>
                            <h3>Technical Specifications</h3>
                            <ul>
                                <li>
                                    <span className={styles.specTitle}>Capacity Range:</span>
                                    <span className={styles.specValue}>80 to 1200 kW</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Design:</span>
                                    <span className={styles.specValue}>Long modular frame with multi-fan top sections</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Ambient Temperature Range:</span>
                                    <span className={styles.specValue}>-20°C to 43°C</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Options:</span>
                                    <span className={styles.specValue}>Defrost optimization, integrated water pump, buffer tank, etc</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Benefits:</span>
                                    <span className={styles.specValue}>High heating COP, dual mode (heating/cooling), flexible</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Advantages:</span>
                                    <span className={styles.specValue}>Low noise, zero combustion emissions, extremely reliable</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
