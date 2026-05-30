import ProductAccordion from "../components/ProductAccordion";
import WaterCooledChillerForm from "../components/WaterCooledChillerForm";

export default function WaterCooledChillerPage() {
    return (
        <ProductAccordion 
            title="Water Cooled Chiller"
            modelName="OffiTec Water-Cooled Industrial Chiller Unit"
            calculationForm={<WaterCooledChillerForm />}
        />
    );
}
