import { ICreature } from "creature/ICreature";
import { Stat } from "entity/IStats";
import { UiApi } from "newui/INewUi";
import { INPC } from "npc/INPC";
import IPlayer from "player/IPlayer";
import InspectEntityInformationSubsection from "../component/InspectEntityInformationSubsection";
export default class HumanInformation extends InspectEntityInformationSubsection {
    private readonly addItemContainer;
    private readonly reputationSliders;
    private human;
    constructor(api: UiApi);
    getImmutableStats(): Stat[];
    update(entity: ICreature | INPC | IPlayer): void;
    private addReputationSlider;
    private setReputation;
    private addItem;
    private onStatChange;
}