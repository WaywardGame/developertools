import { ICreature } from "creature/ICreature";
import { Bindable, PlayerState } from "Enums";
import { IHookHost } from "mod/IHookHost";
import { BindCatcherApi } from "newui/BindingManager";
import Button from "newui/component/Button";
import Component from "newui/component/Component";
import { DialogId, IDialogDescription } from "newui/screen/screens/game/Dialogs";
import IGameScreenApi from "newui/screen/screens/game/IGameScreenApi";
import { INPC } from "npc/INPC";
import IPlayer from "player/IPlayer";
import { ITile } from "tile/ITerrain";
import Vector2 from "utilities/math/Vector2";
import TabDialog from "./TabDialog";
export default class InspectDialog extends TabDialog implements IHookHost {
    static description: IDialogDescription;
    static INSTANCE: InspectDialog | undefined;
    private entityButtons;
    private infoSections;
    private entityInfoSection;
    private tilePosition?;
    private tile?;
    private inspectionLock?;
    private inspectingTile?;
    private storePanels;
    private log;
    private willShowSubpanel;
    constructor(gsapi: IGameScreenApi, id: DialogId);
    getSubpanels(): [string | number, import("newui/component/IComponent").TranslationGenerator, (component: Component) => any, (((button: Button) => any) | undefined)?, (Button | undefined)?][];
    getName(): import("language/Translation").default;
    setInspection(what: Vector2 | IPlayer | ICreature | INPC): this;
    update(): void;
    onBindLoop(bindPressed: Bindable, api: BindCatcherApi): Bindable;
    onGameTickEnd(): void;
    onMoveComplete(player: IPlayer): void;
    onTileUpdate(tile: ITile, x: number, y: number, z: number): void;
    onGameEnd(state: PlayerState): void;
    private updateSubpanels;
    private setInspectionTile;
    private logUpdate;
    private showInspectionLockMenu;
    private unlockInspection;
    private lockInspection;
    private onClose;
}
