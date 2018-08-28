import { IDoodad } from "doodad/IDoodad";
import { ItemQuality, ItemType, SentenceCaseStyle } from "Enums";
import Button, { ButtonEvent } from "newui/component/Button";
import { UiApi } from "newui/INewUi";
import { ITile } from "tile/ITerrain";
import { IVector2 } from "utilities/math/IVector";
import Vector3 from "utilities/math/Vector3";
import { Bound } from "utilities/Objects";
import Actions from "../../Actions";
import DebugTools, { translation } from "../../DebugTools";
import { DebugToolsTranslation } from "../../IDebugTools";
import AddItemToInventory, { AddItemToInventoryEvent } from "../component/AddItemToInventory";
import { DebugToolsPanelEvent } from "../component/DebugToolsPanel";
import InspectInformationSection, { TabInformation } from "../component/InspectInformationSection";

export default class DoodadInformation extends InspectInformationSection {
	private doodad: IDoodad | undefined;

	public constructor(api: UiApi) {
		super(api);

		new Button(api)
			.setText(translation(DebugToolsTranslation.ActionRemove))
			.on(ButtonEvent.Activate, this.removeDoodad)
			.appendTo(this);

		new Button(this.api)
			.setText(translation(DebugToolsTranslation.ButtonCloneEntity))
			.on(ButtonEvent.Activate, this.cloneDoodad)
			.appendTo(this);

		this.on(DebugToolsPanelEvent.SwitchTo, () => {
			if (!this.doodad!.containedItems) return;

			const addItemToInventory = AddItemToInventory.get(this.api).appendTo(this);
			this.until(DebugToolsPanelEvent.SwitchAway)
				.bind(addItemToInventory, AddItemToInventoryEvent.Execute, this.addItem);
		});
	}

	public getTabs(): TabInformation[] {
		return this.doodad ? [
			[0, () => translation(DebugToolsTranslation.DoodadName)
				.get(game.getName(this.doodad, SentenceCaseStyle.Title, false))],
		] : [];
	}

	public update(position: IVector2, tile: ITile) {
		if (tile.doodad === this.doodad) return;
		this.doodad = tile.doodad;

		if (!this.doodad) return;

		this.setShouldLog();
	}

	public logUpdate() {
		DebugTools.LOG.info("Doodad:", this.doodad);
	}

	@Bound
	private addItem(_: any, type: ItemType, quality: ItemQuality) {
		Actions.get("addItemToInventory")
			.execute({ doodad: this.doodad, object: [type, quality] });
	}

	@Bound
	private removeDoodad() {
		Actions.get("remove").execute({ doodad: this.doodad });
	}

	@Bound
	private async cloneDoodad() {
		const teleportLocation = await DebugTools.INSTANCE.selector.select();
		if (!teleportLocation) return;

		Actions.get("clone")
			.execute({ doodad: this.doodad, position: new Vector3(teleportLocation.x, teleportLocation.y, localPlayer.z) });
	}
}
