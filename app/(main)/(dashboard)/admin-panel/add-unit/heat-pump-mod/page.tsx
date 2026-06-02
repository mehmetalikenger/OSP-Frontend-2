"use client";

import { useState } from "react";
import styles from "../addUnit.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";

export default function AddHeatPumpModPage() {
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
    const [heatPump, setHeatPump] = useState('Select Heat Pump');

    return (
        <div className={styles.sectionsContainer}>
            <div className={styles.sectionContent} style={{ maxWidth: "800px", flex: "none" }}>
                
                <div className={styles.breadcrumbContainer}>
                    <span 
                        className={`${styles.breadcrumbItem} ${activeTab === 'model' ? styles.breadcrumbActive : ''}`}
                        onClick={() => setActiveTab('model')}
                    >
                        Model Details
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

                
                        <div className={styles.formSection}>
                            {activeTab === 'model' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>Heat Pump</label>
                                        <Combobox 
                                            options={["Select Heat Pump", "Option 1"]}
                                            value={heatPump}
                                            onChange={setHeatPump}
                                            className={`${styles.comboBox} ${heatPump.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Mod</label>
                                        <Combobox 
                                            options={["Cooling", "Heating"]}
                                            value={unitMod === "cooling" ? "Cooling" : "Heating"}
                                            onChange={(val) => setUnitMod(val === "Cooling" ? "cooling" : "heating")}
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

                        <div className={styles.stepNavContainer} style={{ marginTop: "25px" }}>
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
                                    <button className={styles.saveBtn}>Add Details</button>
                                </div>
                            )}
                        </div>

                    

            </div>
        </div>
    );
}
