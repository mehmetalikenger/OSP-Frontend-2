import ProductAccordion from "../components/ProductAccordion";

export default function WaterCooledChillerPage() {
    return (
        <ProductAccordion 
            title="Water Cooled Chiller"
            modelName="OffiTec Water-Cooled Industrial Chiller Unit"
            calculationForm={<div style={{ padding: '20px', color: '#555' }}>Water Cooled Chiller Calculation Form Placeholder</div>}
        />
    );
}
