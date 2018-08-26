import { ItemQuality, ItemType, SentenceCaseStyle } from "Enums";
import itemDescriptions from "item/Items";
import Translation from "language/Translation";
import Button, { ButtonEvent } from "newui/component/Button";
import Component from "newui/component/Component";
import Dropdown, { DropdownEvent } from "newui/component/Dropdown";
import { ComponentEvent } from "newui/component/IComponent";
import { LabelledRow } from "newui/component/LabelledRow";
import Text from "newui/component/Text";
import { UiApi } from "newui/INewUi";
import { tuple } from "utilities/Arrays";
import Collectors from "utilities/Collectors";
import Enums from "utilities/enum/Enums";
import { Bound } from "utilities/Objects";
import { translation } from "../../DebugTools";
import { DebugToolsTranslation } from "../../IDebugTools";

export enum AddItemToInventoryEvent {
	/**
	 * @param type The `ItemType` of the item to add
	 * @param quality The `ItemQuality` of the item to add
	 */
	Execute = "Execute",
}

export default class AddItemToInventory extends Component {

	private static INSTANCE: AddItemToInventory | undefined;

	public static get(api: UiApi) {
		return AddItemToInventory.INSTANCE = AddItemToInventory.INSTANCE || new AddItemToInventory(api);
	}

	private readonly dropdownItemType: Dropdown<ItemType>;
	private readonly dropdownItemQuality: Dropdown<ItemQuality>;
	private readonly wrapperAddItem: Component;

	private constructor(api: UiApi) {
		super(api);

		new LabelledRow(api)
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(translation(DebugToolsTranslation.LabelItem)))
			.append(this.dropdownItemType = new Dropdown<ItemType>(api)
				.setRefreshMethod(() => ({
					defaultOption: ItemType.None,
					options: Enums.values(ItemType)
						.map(item => tuple(item, Translation.ofDescription(itemDescriptions[item]!, SentenceCaseStyle.Title, false)))
						.collect(Collectors.toArray)
						.sort(([, t1], [, t2]) => Text.toString(t1).localeCompare(Text.toString(t2)))
						.values()
						.map(([id, t]) => tuple(id, (option: Button) => option.setText(t))),
				}))
				.on(DropdownEvent.Selection, this.changeItem))
			.appendTo(this);

		this.wrapperAddItem = new Component(api)
			.classes.add("debug-tools-inspect-human-wrapper-add-item")
			.hide()
			.append(new LabelledRow(api)
				.classes.add("dropdown-label")
				.setLabel(label => label.setText(translation(DebugToolsTranslation.LabelQuality)))
				.append(this.dropdownItemQuality = new Dropdown<ItemQuality>(api)
					.setRefreshMethod(() => ({
						defaultOption: ItemQuality.Random,
						options: Enums.values(ItemQuality)
							.map(quality => tuple(quality, Translation.generator(ItemQuality[quality])))
							.collect(Collectors.toArray)
							.values()
							.map(([id, t]) => tuple(id, (option: Button) => option.setText(t))),
					}))))
			.append(new Button(api)
				.setText(translation(DebugToolsTranslation.AddToInventory))
				.on(ButtonEvent.Activate, this.addItem))
			.appendTo(this);

		this.on(ComponentEvent.WillRemove, this.willRemove);
	}

	public releaseAndRemove() {
		this.cancel(ComponentEvent.WillRemove, this.willRemove);
		this.remove();
	}

	@Bound
	private willRemove() {
		this.store();
		return false;
	}

	@Bound
	private changeItem(_: any, item: ItemType) {
		this.wrapperAddItem.toggle(item !== ItemType.None);
	}

	@Bound
	private addItem() {
		this.triggerSync(AddItemToInventoryEvent.Execute, this.dropdownItemType.selection, this.dropdownItemQuality.selection);
	}
}
