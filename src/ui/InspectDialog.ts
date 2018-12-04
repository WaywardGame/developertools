import { ICreature } from "creature/ICreature";
import IEntity from "entity/IEntity";
import { Bindable, PlayerState } from "Enums";
import Translation from "language/Translation";
import { HookMethod, IHookHost } from "mod/IHookHost";
import Mod from "mod/Mod";
import { BindCatcherApi, bindingManager } from "newui/BindingManager";
import Button from "newui/component/Button";
import Component from "newui/component/Component";
import ContextMenu from "newui/component/ContextMenu";
import { ComponentEvent } from "newui/component/IComponent";
import Text from "newui/component/Text";
import { ScreenId } from "newui/screen/IScreen";
import { DialogEvent } from "newui/screen/screens/game/component/Dialog";
import { DialogId, Edge, IDialogDescription } from "newui/screen/screens/game/Dialogs";
import IGameScreenApi from "newui/screen/screens/game/IGameScreenApi";
import { INPC } from "npc/INPC";
import IPlayer from "player/IPlayer";
import { ITile } from "tile/ITerrain";
import Collectors from "utilities/iterable/Collectors";
import { tuple } from "utilities/iterable/Generators";
import Log from "utilities/Log";
import Vector2 from "utilities/math/Vector2";
import Vector3 from "utilities/math/Vector3";
import { Bound } from "utilities/Objects";
import TileHelpers from "utilities/TileHelpers";
import DebugTools from "../DebugTools";
import { DEBUG_TOOLS_ID, DebugToolsTranslation, translation } from "../IDebugTools";
import Overlays from "../overlay/Overlays";
import { DebugToolsPanelEvent } from "./component/DebugToolsPanel";
import InspectInformationSection from "./component/InspectInformationSection";
import CorpseInformation from "./inspect/Corpse";
import DoodadInformation from "./inspect/Doodad";
import EntityInformation from "./inspect/Entity";
import ItemInformation from "./inspect/Item";
import TerrainInformation from "./inspect/Terrain";
import TileEventInformation from "./inspect/TileEvent";
import TabDialog, { SubpanelInformation } from "./TabDialog";

export type InspectDialogInformationSectionClass = new (gsapi: IGameScreenApi) => InspectInformationSection;

/**
 * A list of panel classes that will appear in the dialog.
 */
const informationSectionClasses: InspectDialogInformationSectionClass[] = [
	TerrainInformation,
	EntityInformation,
	CorpseInformation,
	DoodadInformation,
	TileEventInformation,
	ItemInformation,
];

export default class InspectDialog extends TabDialog implements IHookHost {
	/**
	 * The positioning settings for the dialog.
	 */
	public static description: IDialogDescription = {
		minSize: {
			x: 20,
			y: 25,
		},
		size: {
			x: 25,
			y: 30,
		},
		maxSize: {
			x: 40,
			y: 70,
		},
		edges: [
			[Edge.Left, 50],
			[Edge.Bottom, 0],
		],
		saveOpen: false,
	};

	public static INSTANCE: InspectDialog | undefined;

	@Mod.instance<DebugTools>(DEBUG_TOOLS_ID)
	public readonly DEBUG_TOOLS: DebugTools;
	@Mod.log(DEBUG_TOOLS_ID)
	public readonly LOG: Log;

	private entityButtons: Button[];
	private infoSections: InspectInformationSection[];
	private entityInfoSection: EntityInformation;

	private tilePosition?: Vector3;
	private tile?: ITile;
	private inspectionLock?: ICreature | IPlayer | INPC;
	private inspectingTile?: ITile;
	private storePanels = true;
	private shouldLog = false;
	private willShowSubpanel = false;

	public constructor(gsapi: IGameScreenApi, id: DialogId) {
		super(gsapi, id);

		this.classes.add("debug-tools-inspect-dialog");

		// we register this component as a "hook host" — this means that, like the `Mod` class, it can implement hook methods
		hookManager.register(this, "DebugToolsInspectDialog")
			// we deregister this component as a "hook host" when it's removed from the DOM
			.until(ComponentEvent.Remove);

		this.on(DialogEvent.Close, this.onClose);

		InspectDialog.INSTANCE = this;
	}

	/**
	 * Implements the abstract method in "TabDialog". Returns an array of tuples containing information used to set-up the
	 * subpanels of this dialog.
	 */
	public getSubpanels(): SubpanelInformation[] {
		if (!this.infoSections) {
			this.infoSections = informationSectionClasses.values()
				.include(this.DEBUG_TOOLS.modRegistryInspectDialogPanels.getRegistrations()
					.map(registration => registration.data(InspectInformationSection)))
				.map(cls => new cls(this.gsapi)
					.on("update", this.update)
					.on(ComponentEvent.WillRemove, infoSection => {
						if (this.storePanels) {
							infoSection.emit(DebugToolsPanelEvent.SwitchAway);
							infoSection.store();
							return false;
						}

						return undefined;
					}))
				.collect(Collectors.toArray);

			// we're going to need the entity information section for some other stuff
			this.entityInfoSection = this.infoSections
				.find<EntityInformation>((infoSection): infoSection is EntityInformation => infoSection instanceof EntityInformation)!;
		}

		this.entityButtons = [];

		return this.infoSections.values()
			// add the tabs of the section to the tuple
			.map(section => tuple(section, section.getTabs()))
			// if there are no tabs from the section, remove it
			.filter(([, tabs]) => !!tabs.length)
			// map each of the section/tab tuples with an array of tuples representing all the subpanels (tabs) provided by that section
			.map(([section, tabs]) => tabs
				// map each tab to the subpanel information for it
				.map(([index, getTabTranslation]) => tuple(
					Text.toString(getTabTranslation),
					getTabTranslation,
					// to show the panel, we append the section to the passed component & call a couple methods on the panel
					(component: Component) => section.setTab(index)
						.appendTo(component)
						.emit(DebugToolsPanelEvent.SwitchTo),
					// we cache all of the entity buttons
					(button: Button) => !(section instanceof EntityInformation) ? undefined : this.entityButtons[index] = button,
				)))
			// currently we have an array of `SubpanelInformation` arrays, because each tab provided an array of them, fix with `flat`
			.flatMap<SubpanelInformation>()
			// and now return an array
			.collect(Collectors.toArray);
	}

	public getName(): Translation {
		return translation(DebugToolsTranslation.DialogTitleInspect);
	}

	/**
	 * - Sets the tile or entity to inspect. 
	 * 	-If an entity is inspected, this means it's the new "inspection lock" (whenever the entity
	 * moves, the inspection will move to its tile).
	 * - Updates the dialog. (`update`)
	 * - If the inspection is locked to an entity, it makes a note of needing to show the entity's subpanel (`willShowSubpanel`).
	 */
	public setInspection(what: Vector2 | IPlayer | ICreature | INPC) {
		this.setInspectionTile(what);

		this.inspectionLock = "entityType" in what ? what : undefined;

		this.update();

		if (this.inspectionLock) this.willShowSubpanel = true;

		return this;
	}

	/**
	 * - If the inspection is locked to an entity, set the inspection tile to that entity.
	 * - For each info section, reset whether it should log, then update it with the current inspection tile.
	 * - Trigger a log update.
	 * - After `300ms` (debounced), update the subpanel list.
	 */
	@Bound
	public update() {
		if (this.inspectionLock) this.setInspectionTile(this.inspectionLock);

		for (const section of this.infoSections) {
			section.resetWillLog();
			section.update(this.tilePosition!, this.tile!);
		}

		this.logUpdate();
		this.schedule(300, 300, this.updateSubpanels);
	}

	@HookMethod
	public onBindLoop(bindPressed: Bindable, api: BindCatcherApi) {
		if (api.wasPressed(this.DEBUG_TOOLS.bindableCloseInspectDialog) && !bindPressed) {
			this.close();
			bindPressed = this.DEBUG_TOOLS.bindableCloseInspectDialog;
		}

		if (api.wasPressed(Bindable.MenuContextMenu) && !bindPressed) {
			for (let i = 0; i < this.entityButtons.length; i++) {
				// the entity tabs can't use the `setContextMenu` functionality because they change so often. As a result, we have to
				// catch the `MenuContextMenu` bind manually, and check whether it happened on one of them. If it did, we show the
				// inspection lock menu.
				if (api.isMouseWithin(this.entityButtons[i])) {
					this.showInspectionLockMenu(i);
					bindPressed = Bindable.MenuContextMenu;
				}
			}
		}

		return bindPressed;
	}

	@HookMethod
	public onGameEnd(state: PlayerState) {
		this.close();
	}

	////////////////////////////////////
	// Hooks that trigger a dialog update
	//

	@HookMethod
	public onGameTickEnd() {
		this.update();
	}

	@HookMethod
	public onMoveComplete(player: IPlayer) {
		this.update();
	}

	@HookMethod
	public onTileUpdate(tile: ITile, x: number, y: number, z: number) {
		this.update();
	}

	/**
	 * - Updates the subpanel list through the `TabDialog`. This will call our `getSubpanels` implementation.
	 * - If a subpanel needs to be shown (`willShowSubpanel`), and the inspection lock exists, the inspection lock's subpanel is shown.
	 * - Sets the `inspection-lock` class on the tab of the panel which inspection is locked to.
	 */
	@Bound
	private updateSubpanels() {
		this.updateSubpanelList();

		if (this.willShowSubpanel && this.inspectionLock) {
			this.showSubPanel(this.entityButtons[this.entityInfoSection.getIndex(this.inspectionLock)]);
			this.willShowSubpanel = false;
		}

		if (this.inspectionLock) {
			for (const entityButton of this.entityButtons) entityButton.classes.remove("inspection-lock");

			this.entityButtons[this.entityInfoSection.getIndex(this.inspectionLock)]
				.classes.add("inspection-lock");
		}
	}

	/**
	 * - If the tile position hasn't changed, returns.
	 * - Logs an update.
	 * - If there was an existing inspection overlay, removes it.
	 * - Adds a new inspection overlay to the currently inspecting tile.
	 */
	private setInspectionTile(what: Vector2 | IEntity) {
		const position = new Vector3(what.x, what.y, "z" in what ? what.z : localPlayer.z);

		if (this.tilePosition && position.equals(this.tilePosition)) return;
		this.tilePosition = position;

		this.tile = game.getTile(...this.tilePosition.xyz);

		this.shouldLog = true;
		this.logUpdate();

		// remove old inspection overlay
		if (this.inspectingTile && this.inspectingTile !== this.tile) {
			TileHelpers.Overlay.remove(this.inspectingTile, Overlays.isSelectedTarget);
		}

		// set new inspection overlay
		this.inspectingTile = this.tile;
		TileHelpers.Overlay.add(this.tile, {
			type: this.DEBUG_TOOLS.overlayTarget,
			red: 0,
			blue: 0,
		}, Overlays.isSelectedTarget);
		game.updateView(false);
	}

	/**
	 * Logs information from any section that changed.
	 */
	@Bound
	private logUpdate() {
		if (this.shouldLog) {
			this.LOG.info("Tile:", this.tile, this.tilePosition !== undefined ? this.tilePosition.toString() : undefined);
			this.shouldLog = false;
		}

		for (const infoSection of this.infoSections) {
			if (infoSection.willLog) {
				infoSection.logUpdate();
			}
		}
	}

	/**
	 * Creates and shows an "inspection lock" context menu, with the options "Unlock Inspection" and "Lock Inspection", depending on
	 * whether the section is currently the inspection lock.
	 */
	@Bound
	private showInspectionLockMenu(index: number) {
		new ContextMenu(this.api,
			this.entityButtons[index].classes.has("inspection-lock") ?
				["Unlock Inspection", {
					translation: translation(DebugToolsTranslation.UnlockInspection),
					onActivate: this.unlockInspection,
				}] :
				["Lock Inspection", {
					translation: translation(DebugToolsTranslation.LockInspection),
					onActivate: this.lockInspection(index),
				}],
		)
			.addAllDescribedOptions()
			.setPosition(...bindingManager.getMouse().xy)
			.schedule(this.api.getScreen(ScreenId.Game)!.setContextMenu);
	}

	/**
	 * Removes the inspection lock.
	 */
	@Bound
	private unlockInspection() {
		delete this.inspectionLock;
		for (const entityButton of this.entityButtons) entityButton.classes.remove("inspection-lock");
	}

	/**
	 * Sets the inspection lock. (As a side effect, the panel is shown)
	 */
	private lockInspection(index: number) {
		return () => this.setInspection(this.entityInfoSection.getEntity(index));
	}

	/**
	 * - Removes the inspection overlay.
	 * - Forcibly removes any info sections.
	 */
	@Bound
	private onClose() {
		if (this.inspectingTile) {
			TileHelpers.Overlay.remove(this.inspectingTile, Overlays.isSelectedTarget);
			delete this.inspectingTile;
		}

		game.updateView(false);

		this.storePanels = false;
		for (const infoSection of this.infoSections) {
			if (infoSection.isVisible()) {
				infoSection.emit(DebugToolsPanelEvent.SwitchAway);
			}

			infoSection.remove();
		}

		delete InspectDialog.INSTANCE;
	}

}
