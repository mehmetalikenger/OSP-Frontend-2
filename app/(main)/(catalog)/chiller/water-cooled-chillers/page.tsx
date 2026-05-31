"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../category.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import BookmarkToggle from "@/components/BookmarkToggle";

export default function WaterCooledChillersPage() {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const router = useRouter();

    useScrollLock(isDetailsOpen);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.category}>
                    <h1>Water Cooled Chillers</h1>
                </div>
                {/* Mobile Products */}
                <div className={`${styles.products} ${styles.productsMobile}`}>
                    <div className={styles.product}>
                        <div className={styles.productDetails}>
                            <div className={styles.productInfo}>
                                <div className={styles.productTitle}>
                                    <h2>OffiTec Modular High-Capacity Water-Cooled Industrial Chiller Unit</h2>
                                </div>
                                <div className={styles.productImage}>
                                    <img src="../images/products/569547.png" alt="Water Cooled Chiller" />
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
                        <div className={styles.productBottom}>
                            <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                View
                            </button>
                            <BookmarkToggle />
                        </div>
                    </div>
                    <div className={styles.product}>
                        <div className={styles.productDetails}>
                            <div className={styles.productInfo}>
                                <div className={styles.productTitle}>
                                    <h2>OffiTec Modular High-Capacity Water-Cooled Industrial Chiller Unit</h2>
                                </div>
                                <div className={styles.productImage}>
                                    <img src="../images/products/569547.png" alt="Water Cooled Chiller" />
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
                        <div className={styles.productBottom}>
                            <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                View
                            </button>
                            <BookmarkToggle />
                        </div>
                    </div>
                    <div className={styles.product}>
                        <div className={styles.productDetails}>
                            <div className={styles.productInfo}>
                                <div className={styles.productTitle}>
                                    <h2>OffiTec Modular High-Capacity Water-Cooled Industrial Chiller Unit</h2>
                                </div>
                                <div className={styles.productImage}>
                                    <img src="../images/products/569547.png" alt="Water Cooled Chiller" />
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
                        <div className={styles.productBottom}>
                            <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                View
                            </button>
                            <BookmarkToggle />
                        </div>
                    </div>
                </div>
                {/* Desktop Products */}
                <div className={`${styles.products} ${styles.productsDesktop}`}>
                    <div className={styles.product}>
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
                                <img src="../images/products/569547.png" alt="Water Cooled Chiller" />
                            </div>
                        </div>
                        <div className={styles.productBottom}>
                            <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                View
                            </button>
                            <BookmarkToggle />
                        </div>
                    </div>
                    <div className={styles.product}>
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
                                <img src="../images/products/569547.png" alt="Water Cooled Chiller" />
                            </div>
                        </div>
                        <div className={styles.productBottom}>
                            <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                View
                            </button>
                            <BookmarkToggle />
                        </div>
                    </div>
                    <div className={styles.product}>
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
                                <img src="../images/products/569547.png" alt="Water Cooled Chiller" />
                            </div>
                        </div>
                        <div className={styles.productBottom}>
                            <button className={styles.viewBtn} onClick={() => setIsDetailsOpen(true)}>
                                View
                            </button>
                            <BookmarkToggle />
                        </div>
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
                            <h2>OffiTec Modular High-Capacity Water-Cooled Industrial Chiller Unit</h2>
                        </div>
                        <div className={styles.unitImage}>
                            <img src="../images/products/569547.png" alt="Water Cooled Chiller" />
                        </div>
                        <div className={styles.unitDesc}>
                            <p>The OffiTec modular high-capacity water-cooled chiller unit is engineered for large industrial facilities,
                                process cooling lines, data centers, and high-flow HVAC applications.
                                Its design works in tandem with cooling towers or external water sources,
                                delivering exceptional efficiency, stable operations, and low noise levels.</p>
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
                            <div className={styles.modalActions}>
                                <button className={styles.calcBtn} onClick={() => router.push('/calculation/water-cooled-chiller')}>Calculate</button>
                                <BookmarkToggle />
                            </div>
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
                                    <span className={styles.specValue}>Long modular frame water-cooled condenser system</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Ambient Temperature Range:</span>
                                    <span className={styles.specValue}>Indoor installation with outdoor cooling tower link</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Options:</span>
                                    <span className={styles.specValue}>Heat recovery, integrated water pump, buffer tank, etc</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Benefits:</span>
                                    <span className={styles.specValue}>Superb energy efficiency ratio (EER), stable, compact size</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Advantages:</span>
                                    <span className={styles.specValue}>Quiet indoor operation, extremely reliable, long-term durability</span>
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
                            <h2>OffiTec Modular High-Capacity Water-Cooled Industrial Chiller Unit</h2>
                        </div>
                        <div className={styles.unitInfo}>
                            <div className={styles.unitDesc}>
                                <p>The OffiTec modular high-capacity water-cooled chiller unit is engineered for large industrial facilities,
                                    process cooling lines, data centers, and high-flow HVAC applications.
                                    Its design works in tandem with cooling towers or external water sources,
                                    delivering exceptional efficiency, stable operations, and low noise levels.</p>
                            </div>
                            <div className={styles.unitImage}>
                                <img src="../images/products/569547.png" alt="Water Cooled Chiller" />
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
                            <div className={styles.modalActions}>
                                <button className={styles.calcBtn} onClick={() => router.push('/calculation/water-cooled-chiller')}>Calculate</button>
                                <BookmarkToggle />
                            </div>
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
                                    <span className={styles.specValue}>Long modular frame water-cooled condenser system</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Ambient Temperature Range:</span>
                                    <span className={styles.specValue}>Indoor installation with outdoor cooling tower link</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Options:</span>
                                    <span className={styles.specValue}>Heat recovery, integrated water pump, buffer tank, etc</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Benefits:</span>
                                    <span className={styles.specValue}>Superb energy efficiency ratio (EER), stable, compact size</span>
                                </li>
                                <li>
                                    <span className={styles.specTitle}>Advantages:</span>
                                    <span className={styles.specValue}>Quiet indoor operation, extremely reliable, long-term durability</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
