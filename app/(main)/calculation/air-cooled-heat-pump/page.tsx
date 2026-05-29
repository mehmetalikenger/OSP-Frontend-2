import ProductAccordion from "../components/ProductAccordion";

export default function AirCooledHeatPumpPage() {
    return (
        <ProductAccordion 
            title="Air to Water Heat Pump"
            modelName="OffiTec Air-Cooled Heat Pump Unit"
            calculationForm={<div style={{ padding: '20px', color: '#555' }}>Air Cooled Heat Pump Calculation Form Placeholder</div>}
        />
    );
}
