import ProductAccordion from "../components/ProductAccordion";
import AirCooledChillerForm from "../components/AirCooledChillerForm";

export default function AirCooledChillerPage() {
    return (
        <ProductAccordion 
            title="Air Cooled Chiller"
            modelName="OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit"
            calculationForm={<AirCooledChillerForm />}
        />
    );
}
