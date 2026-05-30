import ProductAccordion from "../components/ProductAccordion";
import AirToWaterHeatPumpForm from "../components/AirToWaterHeatPumpForm";

export default function AirToWaterHeatPumpPage() {
    return (
        <ProductAccordion
            title="Air to Water Heat Pump"
            modelName="OffiTec Air-to-Water Heat Pump Unit"
            calculationForm={<AirToWaterHeatPumpForm />}
        />
    );
}
