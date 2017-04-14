import { ICreature } from "creature/ICreature";
import { FacingDirection, KeyBind } from "Enums";
import Mod from "mod/Mod";
import IPlayer from "Player/IPlayer";
import { ITile } from "tile/ITerrain";
import { IInspectionMessageDelegate, IInspectionMessages } from "./Inspection.js";
export default class DeveloperTools extends Mod implements IInspectionMessageDelegate {
    inspectionMessages: IInspectionMessages;
    private elementDialog;
    private elementModRefreshSection;
    private keyBind;
    private noclipEnabled;
    private noclipDelay;
    private inMove;
    private elementContainer;
    private elementInner;
    private elementDayNightTime;
    private inspection;
    private isPlayingAudio;
    private audioToPlay;
    private data;
    private globalData;
    onInitialize(saveDataGlobal: any): any;
    onUninitialize(): any;
    onLoad(saveData: any): void;
    onSave(): any;
    onUnload(): void;
    onGameStart(isLoadingSave: boolean): void;
    isPlayerSwimming(localPlayer: IPlayer, isSwimming: boolean): boolean;
    onShowInGameScreen(): void;
    onTurnComplete(): void;
    onMouseDown(event: JQueryEventObject): boolean;
    onKeyBindPress(keyBind: KeyBind): boolean;
    canCreatureAttack(creatureId: number, creature: ICreature): boolean;
    onMove(nextX: number, nextY: number, tile: ITile, direction: FacingDirection): boolean | undefined;
    onNoInputReceived(): void;
    testFunction(): number;
    private generateSelect(enums, objects, className, labelName);
}
