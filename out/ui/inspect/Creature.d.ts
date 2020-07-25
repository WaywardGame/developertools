import Entity from "entity/Entity";
import InspectEntityInformationSubsection from "../component/InspectEntityInformationSubsection";
export default class CreatureInformation extends InspectEntityInformationSubsection {
    private creature;
    constructor();
    update(entity: Entity): void;
    private setTamed;
    private removeCreature;
}
