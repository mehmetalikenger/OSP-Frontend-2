"use client";

import { useState, useEffect } from "react";
import styles from "../addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type Refrigerant = { id: number; name: string; code: string };
const REFRIG_SELECT = "Select Refrigerant";
const refrigerantLabel = (r: Refrigerant) => `${r.name} / ${r.code}`;

// The heat-pump model holds the tech details that are COMMON to every mode.
export default function AddHeatPumpModelPage() {
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

    useEffect(() => {
        (async () => {
            try {
                const res = await fetchWithAuth(`${API}/admin/component/refrigerants`, { credentials: "include", cache: "no-store" });
                if (res.ok) setRefrigerantList(await res.json());
            } catch (e) {
                console.error("Failed to load refrigerants", e);
            }
        })();
    }, []);

    const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const int = (v: string) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };

    const refrigerantValue = refrigerantList.find((r) => r.id === refrigerantId);
    const refrigerantOptions = [REFRIG_SELECT, ...refrigerantList.map(refrigerantLabel)];

    const resetForm = () => {
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

    const handleAdd = async () => {
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
            const res = await fetchWithAuth(`${API}/admin/unit/heat-pump`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                showToast("Heat pump model created! Add its modes from the Mod page.", "success");
                resetForm();
            } else {
                let msg = "Failed to create heat pump model.";
                try {
                    const data = await res.json();
                    msg = data.message || data.error || msg;
                } catch { /* keep default */ }
                showToast(msg, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.sectionsContainer}>
            {toastInfo && (
                <div className={toastInfo.type === "error" ? toastStyles.errorToast : toastStyles.toast}>
                    {toastInfo.message}
                </div>
            )}
            <div className={styles.sectionContent} style={{ maxWidth: "1000px", flex: "none" }}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                        Model Information
                    </span>
                </div>
                <div className={styles.horizontalSeperator}></div>

                <div className={styles.formSection}>
                    <div className={styles.formGrid}>
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
                                options={refrigerantOptions}
                                value={refrigerantValue ? refrigerantLabel(refrigerantValue) : REFRIG_SELECT}
                                onChange={(label) => setRefrigerantId(refrigerantList.find((r) => refrigerantLabel(r) === label)?.id ?? null)}
                                className={`${styles.comboBox} ${refrigerantId === null ? styles.placeholderText : ''}`}
                                containerClassName={styles.comboboxContainerOverride}
                            />
                        </div>
                        <div className={styles.formField}>
                            <label>Compressor Qty</label>
                            <input type="text" className={styles.inputElement} value={f.compressorQty} onChange={upd("compressorQty")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Condenser Qty</label>
                            <input type="text" className={styles.inputElement} value={f.condenserQty} onChange={upd("condenserQty")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Expansion Valve Qty</label>
                            <input type="text" className={styles.inputElement} value={f.expansionValveQty} onChange={upd("expansionValveQty")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Fan Power Input (kW)</label>
                            <input type="text" className={styles.inputElement} value={f.fanPI} onChange={upd("fanPI")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Number of Fans</label>
                            <input type="text" className={styles.inputElement} value={f.numberOfFans} onChange={upd("numberOfFans")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Fan Diameter</label>
                            <input type="text" className={styles.inputElement} value={f.fanDiameter} onChange={upd("fanDiameter")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Airflow Rate (m3/h)</label>
                            <input type="text" className={styles.inputElement} value={f.airflowRate} onChange={upd("airflowRate")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Discharge Line Diameter</label>
                            <input type="text" className={styles.inputElement} value={f.dischargeLineDiameter} onChange={upd("dischargeLineDiameter")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Liquid Line Diameter</label>
                            <input type="text" className={styles.inputElement} value={f.liquidLineDiameter} onChange={upd("liquidLineDiameter")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Suction Line Diameter</label>
                            <input type="text" className={styles.inputElement} value={f.suctionLineDiameter} onChange={upd("suctionLineDiameter")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Gas Tank (L)</label>
                            <input type="text" className={styles.inputElement} value={f.gasTank} onChange={upd("gasTank")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Width</label>
                            <input type="text" className={styles.inputElement} value={f.width} onChange={upd("width")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Height</label>
                            <input type="text" className={styles.inputElement} value={f.height} onChange={upd("height")} />
                        </div>
                        <div className={styles.formField}>
                            <label>Length</label>
                            <input type="text" className={styles.inputElement} value={f.length} onChange={upd("length")} />
                        </div>
                    </div>

                    <div className={styles.stepNavContainer} style={{ marginTop: "25px", justifyContent: "flex-end" }}>
                        <button className={styles.saveBtn} onClick={handleAdd} disabled={submitting}>
                            {submitting ? "Adding..." : "Add"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
