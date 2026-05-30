import ProductAccordion from "../components/ProductAccordion";
import WaterToWaterHeatPumpForm from "../components/WaterToWaterHeatPumpForm";

export default function WaterToWaterHeatPumpPage() {
    return (
        <ProductAccordion 
            title="Water to Water Heat Pump"
            modelName="OffiTec Water-to-Water Heat Pump Unit"
            calculationForm={<WaterToWaterHeatPumpForm />}
        />
    );
}
