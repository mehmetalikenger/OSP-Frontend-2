"use client";

import { useState } from "react";
import styles from "../addUnit.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";

export default function AddHeatPumpModelPage() {
        const [unitType, setUnitType] = useState("air_to_water");

    return (
        <div className={styles.sectionsContainer}>
            <div className={styles.sectionContent} style={{ maxWidth: "800px", flex: "none" }}>
                
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                        Heat Pump Model
                    </span>
                </div>
                <div className={styles.horizontalSeperator}></div>

                
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>Model</label>
                                    <input type="text" className={styles.inputElement} placeholder="Enter model name" />
                                </div>
                                <div className={styles.formField}>
                                    <label>Type</label>
                                    <Combobox 
                                        options={["Air to water", "Water to water"]}
                                        value={unitType === "air_to_water" ? "Air to water" : "Water to water"}
                                        onChange={(val) => setUnitType(val === "Air to water" ? "air_to_water" : "water_to_water")}
                                        className={styles.comboBox}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                            </div>
                            
                            <div className={styles.horizontalSeperator} style={{ margin: "40px 0" }}></div>

                        <div className={styles.uploadSection}>
                            <div className={`${styles.uploadContainer} ${styles.imgContainer}`}>
                                Upload Image
                                <div className={styles.inputContainer}>
                                    <input type="file" accept="image/*" multiple className={styles.fileInput} id="image" />
                                    <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Images" />
                                    <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Images" />
                                </div>
                            </div>
                            <div className={`${styles.drawingContainer} ${styles.uploadContainer}`}>
                                Upload Drawing
                                <div className={styles.inputContainer}>
                                    <input type="file" accept=".pdf,.dwg,.dxf" multiple className={styles.fileInput} id="drawing" />
                                    <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Drawings" />
                                    <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Drawings" />
                                </div>
                            </div>
                            <div className={`${styles.docContainer} ${styles.uploadContainer}`}>
                                Upload File
                                <div className={styles.inputContainer}>
                                    <input type="file" accept=".pdf,.doc,.docx" multiple className={styles.fileInput} />
                                    <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Documents" id="doc" />
                                    <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Documents" />
                                </div>
                            </div>
                            <div className={`${styles.iconContainer} ${styles.uploadContainer}`}>
                                Upload Icon
                                <div className={styles.inputContainer}>
                                    <input type="file" accept="image/png, image/svg+xml, .ico" multiple className={styles.fileInput} />
                                    <img className={styles.lightIcon} src="../../../icons/upload-light.png" alt="Icons" id="icon" />
                                    <img className={styles.darkIcon} src="../../../icons/upload-dark.png" alt="Icons" />
                                </div>
                            </div>
                        </div>

                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: "25px", padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn}>Add</button>
                            </div>
                        </div>
                    

            </div>
        </div>
    );
}
