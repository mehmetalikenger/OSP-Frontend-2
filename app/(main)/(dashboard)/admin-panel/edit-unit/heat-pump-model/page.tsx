"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type Refrigerant = { id: number; name: string; code: string };
type HeatPumpSummary = { id: number; model: string; type: string; mods: string[] };

const HP_SELECT = "Select Heat Pump";
const REFRIG_SELECT = "Select Refrigerant";
const refrigerantLabel = (r: Refrigerant) => `${r.name} / ${r.code}`;
const heatPumpLabel = (h: HeatPumpSummary) => `${h.model} (${h.type})`;
const str = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

// Edits the heat-pump shell + the tech details COMMON to all modes.
export default function EditHeatPumpModelPage() {
    const [heatPumps, setHeatPumps] = useState<HeatPumpSummary[]>([]);
    const [selectedHeatPumpId, setSelectedHeatPumpId] = useState<number | null>(null);

    const [unitType, setUnitType] = useState("air_to_water");
    const [model, setModel] = useState("");

    const [refrigerantList, setRefrigerantList] = useState<Refrigerant[]>([]);
    const [refrigerantId, setRefrigerantId] = useState<number | null>(null);

    const [f, setF] = useState({
        compressorQty: "", condenserQty: "", expansionValveQty: "",
        fanPI: "", width: "", length: "", height: "",
        numberOfFans: "", fanDiameter: "", airflowRate: "",
        dischargeLineDiameter: "", liquidLineDiameter: "", suctionLineDiameter: "", gasTank: "",
    });
    const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setF((prev) => ({ ...prev, [k]: e.target.value }));

    const [submitting, setSubmitting] = useState(false);
    const [toastInfo, setToastInfo] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToastInfo({ message, type });
        setTimeout(() => setToastInfo(null), 3500);
    };

    const loadHeatPumps = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pumps`, { credentials: "include", cache: "no-store" });
            if (res.ok) setHeatPumps(await res.json());
        } catch (e) {
            console.error("Failed to load heat pumps", e);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await fetchWithAuth(`${API}/admin/component/refrigerants`, { credentials: "include", cache: "no-store" });
                if (res.ok) setRefrigerantList(await res.json());
            } catch (e) {
                console.error("Failed to load refrigerants", e);
            }
        })();
        loadHeatPumps();
    }, []);

    const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const int = (v: string) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };

    const clearForm = () => {
        setModel("");
        setUnitType("air_to_water");
        setRefrigerantId(null);
        setF({
            compressorQty: "", condenserQty: "", expansionValveQty: "",
            fanPI: "", width: "", length: "", height: "",
            numberOfFans: "", fanDiameter: "", airflowRate: "",
            dischargeLineDiameter: "", liquidLineDiameter: "", suctionLineDiameter: "", gasTank: "",
        });
    };

    const loadHeatPump = async (id: number) => {
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pump/${id}`, { credentials: "include", cache: "no-store" });
            if (!res.ok) { showToast("Failed to load heat pump.", "error"); return; }
            const d = await res.json();
            setModel(d.model ?? "");
            setUnitType(d.type === "WW" ? "water_to_water" : "air_to_water");
            setRefrigerantId(d.refrigerantId ?? null);
            setF({
                compressorQty: str(d.compressorQty),
                condenserQty: str(d.condenserQty),
                expansionValveQty: str(d.expansionValveQty),
                fanPI: str(d.fanPI),
                width: str(d.width),
                length: str(d.length),
                height: str(d.height),
                numberOfFans: str(d.numberOfFans),
                fanDiameter: str(d.fanDiameter),
                airflowRate: str(d.airflowRate),
                dischargeLineDiameter: d.dischargeLineDiameter ?? "",
                liquidLineDiameter: d.liquidLineDiameter ?? "",
                suctionLineDiameter: d.suctionLineDiameter ?? "",
                gasTank: str(d.gasTank),
            });
        } catch (e) {
            console.error(e);
            showToast("Network error.", "error");
        }
    };

    const handleHeatPumpSelect = (label: string) => {
        if (label === HP_SELECT) {
            setSelectedHeatPumpId(null);
            clearForm();
            return;
        }
        const h = heatPumps.find((x) => heatPumpLabel(x) === label);
        if (h) {
            setSelectedHeatPumpId(h.id);
            loadHeatPump(h.id);
        }
    };

    const handleSave = async () => {
        if (selectedHeatPumpId === null) {
            showToast("Please select a heat pump to edit.", "error");
            return;
        }
        if (!model.trim()) {
            showToast("Please enter a model name.", "error");
            return;
        }
        if (refrigerantId === null) {
            showToast("Please select a refrigerant.", "error");
            return;
        }

        const payload = {
            heatPumpDto: {
                model: model.trim(),
                type: unitType === "air_to_water" ? "AW" : "WW",
            },
            commonSpecsDto: {
                compressorQty: int(f.compressorQty),
                condenserQty: int(f.condenserQty),
                expansionValveQty: int(f.expansionValveQty),
                refrigerantId,
                fanPI: num(f.fanPI),
                width: num(f.width),
                length: num(f.length),
                height: num(f.height),
                numberOfFans: int(f.numberOfFans),
                fanDiameter: num(f.fanDiameter),
                airflowRate: num(f.airflowRate),
                dischargeLineDiameter: f.dischargeLineDiameter,
                liquidLineDiameter: f.liquidLineDiameter,
                suctionLineDiameter: f.suctionLineDiameter,
                gasTank: num(f.gasTank),
            },
        };

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pump/${selectedHeatPumpId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                showToast("Heat pump model updated.", "success");
                await loadHeatPumps();
            } else {
                let msg = "Failed to update heat pump model.";
                try { const data = await res.json(); msg = data.message || data.error || msg; } catch { /* default */ }
                showToast(msg, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedHeatPumpId(null);
        clearForm();
    };

    const refrigerantValue = refrigerantList.find((r) => r.id === refrigerantId);
    const selectedHeatPump = heatPumps.find((h) => h.id === selectedHeatPumpId);

    return (
        <div className={styles.sectionsContainer}>
            {toastInfo && (
                <div className={toastInfo.type === "error" ? toastStyles.errorToast : toastStyles.toast}>
                    {toastInfo.message}
                </div>
            )}
            <div className={styles.sectionContent}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                        Model Information
                    </span>
                </div>
                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label>Heat Pump to Edit</label>
                                    <Combobox
                                        options={[HP_SELECT, ...heatPumps.map(heatPumpLabel)]}
                                        value={selectedHeatPump ? heatPumpLabel(selectedHeatPump) : HP_SELECT}
                                        onChange={handleHeatPumpSelect}
                                        className={`${styles.comboBox} ${selectedHeatPumpId === null ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>Model</label>
                                    <input type="text" className={styles.inputElement} placeholder="Enter model name" value={model} onChange={(e) => setModel(e.target.value)} />
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
                                    <label>Refrigerant</label>
                                    <Combobox
                                        options={[REFRIG_SELECT, ...refrigerantList.map(refrigerantLabel)]}
                                        value={refrigerantValue ? refrigerantLabel(refrigerantValue) : REFRIG_SELECT}
                                        onChange={(label) => setRefrigerantId(refrigerantList.find((r) => refrigerantLabel(r) === label)?.id ?? null)}
                                        className={`${styles.comboBox} ${refrigerantId === null ? styles.placeholderText : ''}`}
                                        containerClassName={styles.comboboxContainerOverride}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>Compressor Qty</label>
                                    <input type="number" className={styles.inputElement} value={f.compressorQty} onChange={upd("compressorQty")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Condenser Qty</label>
                                    <input type="number" className={styles.inputElement} value={f.condenserQty} onChange={upd("condenserQty")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Expansion Valve Qty</label>
                                    <input type="number" className={styles.inputElement} value={f.expansionValveQty} onChange={upd("expansionValveQty")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Fan Power Input (kW)</label>
                                    <input type="number" className={styles.inputElement} value={f.fanPI} onChange={upd("fanPI")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Number of Fans</label>
                                    <input type="number" className={styles.inputElement} value={f.numberOfFans} onChange={upd("numberOfFans")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Fan Diameter</label>
                                    <input type="number" className={styles.inputElement} value={f.fanDiameter} onChange={upd("fanDiameter")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Airflow Rate (m3/h)</label>
                                    <input type="number" className={styles.inputElement} value={f.airflowRate} onChange={upd("airflowRate")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Discharge Line Diameter</label>
                                    <input type="number" className={styles.inputElement} value={f.dischargeLineDiameter} onChange={upd("dischargeLineDiameter")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Liquid Line Diameter</label>
                                    <input type="number" className={styles.inputElement} value={f.liquidLineDiameter} onChange={upd("liquidLineDiameter")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Suction Line Diameter</label>
                                    <input type="number" className={styles.inputElement} value={f.suctionLineDiameter} onChange={upd("suctionLineDiameter")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Gas Tank (L)</label>
                                    <input type="number" className={styles.inputElement} value={f.gasTank} onChange={upd("gasTank")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Width</label>
                                    <input type="number" className={styles.inputElement} value={f.width} onChange={upd("width")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Height</label>
                                    <input type="number" className={styles.inputElement} value={f.height} onChange={upd("height")} />
                                </div>
                                <div className={styles.formField}>
                                    <label>Length</label>
                                    <input type="number" className={styles.inputElement} value={f.length} onChange={upd("length")} />
                                </div>
                            </div>
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
                        <div className={styles.stepNavContainer} style={{ justifyContent: "flex-end", gap: "10px" }}>
                            <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={submitting}>
                                {submitting ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
