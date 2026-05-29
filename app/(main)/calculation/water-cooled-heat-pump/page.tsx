import ProductAccordion from "../components/ProductAccordion";

export default function WaterCooledHeatPumpPage() {
    return (
        <ProductAccordion 
            title="Water to Water Heat Pump"
            modelName="OffiTec Water-Cooled Heat Pump Unit"
            calculationForm={<div style={{ padding: '20px', color: '#555' }}>Water Cooled Heat Pump Calculation Form Placeholder</div>}
        />
    );
}
