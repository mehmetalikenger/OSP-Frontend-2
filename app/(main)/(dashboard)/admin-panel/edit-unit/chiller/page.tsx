"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";

export default function Page() {
    const [activeTab, setActiveTab] = useState("model");
    const [unitType, setUnitType] = useState("air_to_water");
    const [unitMod, setUnitMod] = useState("cooling");
    const [compressor, setCompressor] = useState('Select Compressor');
    const [evaporator, setEvaporator] = useState('Select Evaporator');
    const [condenser, setCondenser] = useState('Select Condenser');
    const [expansionValve, setExpansionValve] = useState('Select Expansion Valve');
    const [reversingValve, setReversingValve] = useState('Select Reversing Valve');
    const [chasis, setChasis] = useState('Select Chasis');
    const [refrigerant, setRefrigerant] = useState('Select Refrigerant');

    return (
        <div className={styles.sectionsContainer}>
            <div className={styles.sectionContent}>
                <div className={styles.breadcrumbContainer}>
                    <span 
                        className={`${styles.breadcrumbItem} ${activeTab === 'model' ? styles.breadcrumbActive : ''}`}
                        onClick={() => setActiveTab('model')}
                    >
                        Model Information
                    </span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span 
                        className={`${styles.breadcrumbItem} ${activeTab === 'calc' ? styles.breadcrumbActive : ''}`}
                        onClick={() => setActiveTab('calc')}
                    >
                        Calculation Values
                    </span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span 
                        className={`${styles.breadcrumbItem} ${activeTab === 'tech' ? styles.breadcrumbActive : ''}`}
                        onClick={() => setActiveTab('tech')}
                    >
                        Tech Details
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            {activeTab === 'model' && (
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
                                    <div className={styles.formField}>
                                        <label>Mod</label>
                                        <Combobox 
                                            options={["Cooling"]}
                                            value="Cooling"
                                            onChange={() => setUnitMod("cooling")}
                                            className={styles.comboBox}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Compressor</label>
                                        <Combobox 
                                            options={["Select Compressor", "Option 1"]}
                                            value={compressor}
                                            onChange={setCompressor}
                                            className={`${styles.comboBox} ${compressor.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Evaporator</label>
                                        <Combobox 
                                            options={["Select Evaporator", "Option 1"]}
                                            value={evaporator}
                                            onChange={setEvaporator}
                                            className={`${styles.comboBox} ${evaporator.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Condenser</label>
                                        <Combobox 
                                            options={["Select Condenser", "Option 1"]}
                                            value={condenser}
                                            onChange={setCondenser}
                                            className={`${styles.comboBox} ${condenser.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Expansion Valve</label>
                                        <Combobox 
                                            options={["Select Expansion Valve", "Option 1"]}
                                            value={expansionValve}
                                            onChange={setExpansionValve}
                                            className={`${styles.comboBox} ${expansionValve.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>4-way Reversing Valve</label>
                                        <Combobox 
                                            options={["Select Reversing Valve", "Option 1"]}
                                            value={reversingValve}
                                            onChange={setReversingValve}
                                            className={`${styles.comboBox} ${reversingValve.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Chasis</label>
                                        <Combobox 
                                            options={["Select Chasis", "Option 1"]}
                                            value={chasis}
                                            onChange={setChasis}
                                            className={`${styles.comboBox} ${chasis.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Refrigerant</label>
                                        <Combobox 
                                            options={["Select Refrigerant", "Option 1"]}
                                            value={refrigerant}
                                            onChange={setRefrigerant}
                                            className={`${styles.comboBox} ${refrigerant.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'calc' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Ambient (°C)</label>
                                        <input type="number" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Evaporator Inlet (°C)</label>
                                        <input type="number" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Evaporator Outlet (°C)</label>
                                        <input type="number" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Condenser Inlet (°C)</label>
                                        <input type="number" className={styles.inputElement} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Condenser Outlet (°C)</label>
                                        <input type="number" className={styles.inputElement} disabled={unitType === 'air_to_water' && unitMod !== 'heating'} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tech' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Capacity (Kw)</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Compressor Qty</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Condenser Required Duty (kW)</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Quiet Condenser Required Duty (kW)</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Fan Power Input (kW)</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>EER</label>
                                        <input type="text" className={styles.inputElement} disabled={unitMod === 'heating'} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>COP</label>
                                        <input type="text" className={styles.inputElement} disabled={unitMod === 'cooling'} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Condenser Qty</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Number of Fans</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Fan Diameter</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Expansion Valve Qty</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Airflow Rate (m3/h)</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Discharge Line Diameter</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Liquid Line Diameter</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Suction Line Diameter</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Liquid Receiver (L)</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Width</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Height</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Length</label>
                                        <input type="text" className={styles.inputElement} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.seperator}></div>
                    
                    <div className={styles.rightContent}>
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
                <div className={styles.stepNavContainer}>
                    <div className={styles.stepNavLeft}>
                        {activeTab !== 'model' && (
                            <button 
                                className={styles.stepBtn} 
                                onClick={() => setActiveTab(activeTab === 'tech' ? 'calc' : 'model')}
                            >
                                Previous
                            </button>
                        )}
                        {activeTab !== 'tech' && (
                            <button 
                                className={styles.stepBtn} 
                                onClick={() => setActiveTab(activeTab === 'model' ? 'calc' : 'tech')}
                            >
                                Next
                            </button>
                        )}
                    </div>
                    {activeTab === 'tech' && (
                        <div className={styles.stepNavRight}>
                            <button className={styles.cancelBtn}>Cancel</button>
                            <button className={styles.saveBtn}>Save</button>
                        </div>
                    )}
                </div>
                </div>
            </div>

        </div>
        </div>
    );
}
