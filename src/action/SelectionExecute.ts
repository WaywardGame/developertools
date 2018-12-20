import { Action } from "action/Action";
import { ActionArgument } from "action/IAction";
import { ICreature } from "creature/ICreature";
import { EntityType } from "entity/IEntity";
import { INPC } from "npc/INPC";
import { ITileEvent } from "tile/ITileEvent";
import { defaultUsability } from "../Actions";
import { DebugToolsTranslation } from "../IDebugTools";
import { SelectionType } from "../ui/panel/SelectionPanel";
import Remove from "./helpers/Remove";

/**
 * Runs a miscellaneous command on a selection of things.
 * @param executionType A `DebugToolsTranslation` naming what command to perform.
 * @param selection An array of `[SelectionType, number]` tuples. Each represents a selected thing, such as a creature and its ID. 
 */
export default new Action(ActionArgument.Number, ActionArgument.Array)
	.setUsableBy(EntityType.Player)
	.setUsableWhen(...defaultUsability)
	.setHandler((action, executionType: DebugToolsTranslation, selection: [SelectionType, number][]) => {
		for (const [type, id] of selection) {
			let target: ICreature | INPC | ITileEvent | undefined;

			switch (type) {
				case SelectionType.Creature:
					target = game.creatures[id];
					break;
				case SelectionType.NPC:
					target = game.npcs[id];
					break;
				case SelectionType.TileEvent:
					target = game.tileEvents[id];
					break;
			}

			if (!target) {
				continue;
			}

			switch (executionType) {
				case DebugToolsTranslation.ActionRemove:
					Remove(action, target);
					break;
			}
		}

		renderer.computeSpritesInViewport();
		action.setUpdateRender();
	});
