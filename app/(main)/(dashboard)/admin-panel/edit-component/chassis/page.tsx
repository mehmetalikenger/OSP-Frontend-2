"use client";

import { useState } from "react";
import styles from "../../add-unit/addUnit.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";

export default function EditChassisPage() {
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Chassis");
    const [brand, setBrand] = useState("Select Brand");
    const [model, setModel] = useState("");

    return (
        <div className={styles.sectionsContainer} style={{ minHeight: 'fit-content', flex: 'none' }}>
            <div className={styles.sectionContent} style={{ maxWidth: '1200px', flex: 'none' }}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                        Chassis
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>

                                    <div className={styles.formField}>
                                        <label>Chassis</label>
                                        <Combobox 
                                            options={["Select Chassis", "Option 1", "Option 2"]}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            className={`${styles.comboBox} ${selectedItemToEdit.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Brand</label>
                                        <Combobox 
                                            options={["Select Brand", "Frescold", "Copelant"]}
                                            value={brand}
                                            onChange={setBrand}
                                            className={`${styles.comboBox} ${brand.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Model</label>
                                        <input 
                                            type="text" 
                                            className={styles.inputElement} 
                                            placeholder="Enter model" 
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn}>Save</button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
