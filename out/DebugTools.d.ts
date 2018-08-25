import { ICreature, IDamageInfo } from "creature/ICreature";
import { Bindable, Direction, OverlayType, SpriteBatchLayer } from "Enums";
import { Dictionary, InterruptChoice } from "language/ILanguage";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import { BindCatcherApi } from "newui/BindingManager";
import { DialogId } from "newui/screen/screens/game/Dialogs";
import { MenuBarButtonType } from "newui/screen/screens/game/static/menubar/MenuBarButtonDescriptions";
import { INPC } from "npc/INPC";
import { Source } from "player/IMessageManager";
import IPlayer from "player/IPlayer";
import { ITile } from "tile/ITerrain";
import Log from "utilities/Log";
import { IVector2 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import Actions from "./Actions";
import { DebugToolsTranslation, IPlayerData, ISaveData, ISaveDataGlobal } from "./IDebugTools";
import LocationSelector from "./LocationSelector";
import UnlockedCameraMovementHandler from "./UnlockedCameraMovementHandler";
export declare function translation(id: DebugToolsTranslation): Translation;
export declare enum DebugToolsEvent {
    PlayerDataChange = 0
}
export default class DebugTools extends Mod {
    static INSTANCE: DebugTools;
    static LOG: Log;
    actions: Actions;
    selector: LocationSelector;
    unlockedCameraMovementHandler: UnlockedCameraMovementHandler;
    bindableToggleDialog: Bindable;
    bindableInspectTile: Bindable;
    bindableToggleCameraLock: Bindable;
    bindablePaint: Bindable;
    bindableErasePaint: Bindable;
    bindableClearPaint: Bindable;
    bindableCancelPaint: Bindable;
    bindableCompletePaint: Bindable;
    dictionary: Dictionary;
    source: Source;
    choiceSailToCivilization: InterruptChoice;
    choiceTravelAway: InterruptChoice;
    dialogMain: DialogId;
    dialogInspect: DialogId;
    menuBarButton: MenuBarButtonType;
    overlayTarget: OverlayType;
    overlayPaint: OverlayType;
    data: ISaveData;
    globalData: ISaveDataGlobal;
    private upgrade;
    private cameraState;
    readonly isCameraUnlocked: boolean;
    getPlayerData<K extends keyof IPlayerData>(player: IPlayer, key: K): IPlayerData[K];
    setPlayerData<K extends keyof IPlayerData>(player: IPlayer, key: K, value: IPlayerData[K]): void;
    onInitialize(saveDataGlobal: ISaveDataGlobal): any;
    onUninitialize(): any;
    onLoad(saveData: ISaveData): void;
    onUnload(): void;
    onSave(): any;
    updateFog(): void;
    setCameraUnlocked(unlocked: boolean): void;
    inspect(what: Vector2 | ICreature | IPlayer | INPC): void;
    toggleDialog(): void;
    postFieldOfView(): void;
    getZoomLevel(): number | undefined;
    getCameraPosition(position: IVector2): IVector2 | undefined;
    onPlayerDamage(player: IPlayer, info: IDamageInfo): number | undefined;
    canCreatureAttack(creature: ICreature, enemy: IPlayer | ICreature): boolean | undefined;
    onMove(player: IPlayer, nextX: number, nextY: number, tile: ITile, direction: Direction): boolean | undefined;
    onNoInputReceived(player: IPlayer): void;
    getPlayerSpriteBatchLayer(player: IPlayer, batchLayer: SpriteBatchLayer): SpriteBatchLayer | undefined;
    isPlayerSwimming(player: IPlayer, isSwimming: boolean): boolean | undefined;
    getPlayerStrength(strength: number, player: IPlayer): number;
    onBindLoop(bindPressed: Bindable, api: BindCatcherApi): Bindable;
    getAmbientColor(colors: [number, number, number]): [number, number, number] | undefined;
    getAmbientLightLevel(ambientLight: number, z: number): number | undefined;
    getTileLightLevel(tile: ITile, x: number, y: number, z: number): number | undefined;
    protected heal(player: IPlayer, args: string): void;
}
