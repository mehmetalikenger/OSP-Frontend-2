"use client";

import { useState } from "react";
import styles from "../../add-unit/addUnit.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";

export default function Edit4WayReversingValvePage() {
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select 4 Way Reversing Valve");
    const [brand, setBrand] = useState("Select Brand");
    const [model, setModel] = useState("");

    // Specs states
    const [reversingValve, setReversingValve] = useState("Select 4 Way Reversing Valve");
    const [capacity, setCapacity] = useState("");

    return (
        <div className={styles.sectionsContainer} style={{ minHeight: 'fit-content', flex: 'none' }}>
            <div className={styles.sectionContent} style={{ maxWidth: '1200px', flex: 'none' }}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                        4 Way Reversing Valve
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>

                                    <div className={styles.formField}>
                                        <label>4 Way Reversing Valve</label>
                                        <Combobox 
                                            options={["Select 4 Way Reversing Valve", "Option 1", "Option 2"]}
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

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>4 Way Reversing Valve</label>
                                        <Combobox 
                                            options={["Select 4 Way Reversing Valve", "Option 1"]}
                                            value={reversingValve}
                                            onChange={setReversingValve}
                                            className={`${styles.comboBox} ${reversingValve.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Capacity</label>
                                        <input 
                                            type="text" 
                                            className={styles.inputElement} 
                                            placeholder="Enter capacity"
                                            value={capacity}
                                            onChange={(e) => setCapacity(e.target.value)}
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
