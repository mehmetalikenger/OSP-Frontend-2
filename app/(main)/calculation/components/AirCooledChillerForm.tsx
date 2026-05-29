import styles from "../calculation.module.css";

export default function AirCooledChillerForm() {
    return (
        <div className={styles.sectionContent}>
            <div className={styles.input}>
                <label htmlFor="glycolMixture">Glycol Mixture</label>
                <input type="number" id="glycolMixture" />
            </div>
            <div className={styles.input}>
                <label htmlFor="mixtureRatio">Mixture Ratio (%)</label>
                <input type="number" id="mixtureRatio" />
            </div>
            <div className={styles.input}>
                <label htmlFor="distanceForSound">Distance For Sound Pressure Level Calculation (m)</label>
                <input type="number" id="distanceForSound" />
            </div>
            <div className={styles.coolingSectionHeader}>
                <h3>Cooling</h3>
            </div>
            <div className={styles.input}>
                <label htmlFor="dryBulbAmbientTemperature">Dry Bulb Ambient Temperature (°C)</label>
                <input type="number" id="dryBulbAmbientTemperature" />
            </div>
            <div className={styles.input}>
                <label htmlFor="waterInletTemperature">Water Inlet Temperature (°C)</label>
                <input type="number" id="waterInletTemperature" />
            </div>
            <div className={styles.input}>
                <label htmlFor="waterOutletTemperature">Water Outlet Temperature (°C)</label>
                <input type="number" id="waterOutletTemperature" />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.input}>
                <label htmlFor="dryBulbAmbientTemperature2">Dry Bulb Ambient Temperature (°C)</label>
                <input type="number" id="dryBulbAmbientTemperature2" />
            </div>
            <div className={styles.input}>
                <label htmlFor="waterInletTemperature2">Water Inlet Temperature (°C)</label>
                <input type="number" id="waterInletTemperature2" />
            </div>
            <div className={styles.input}>
                <label htmlFor="waterOutletTemperature2">Water Outlet Temperature (°C)</label>
                <input type="number" id="waterOutletTemperature2" />
            </div>
            <button className={styles.calcBtn}>
                Calculate
            </button>
        </div>
    );
}
