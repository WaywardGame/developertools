import { Events } from "event/EventBuses";
import { IEventEmitter } from "event/EventEmitter";
import { EventHandler } from "event/EventManager";
import Button from "newui/component/Button";
import Component from "newui/component/Component";
import { TranslationGenerator } from "newui/component/IComponent";
import Dialog from "newui/screen/screens/game/component/Dialog";
import { DialogId, Edge } from "newui/screen/screens/game/Dialogs";
import newui from "newui/NewUi";

export type SubpanelInformation = [string | number, TranslationGenerator, (component: Component) => any, ((button: Button) => any)?, Button?];

interface ITabDialogEvents extends Events<Dialog> {
	changeSubpanel(): any;
}

export default abstract class TabDialog extends Dialog {
	@Override public event: IEventEmitter<this, ITabDialogEvents>;

	private readonly subpanelLinkWrapper: Component;
	private readonly panelWrapper: Component;

	private subpanelInformations: SubpanelInformation[];
	private activeSubpanel: SubpanelInformation | undefined;

	public constructor(id: DialogId) {
		super(id);
		this.classes.add("debug-tools-tab-dialog");

		new Component()
			.classes.add("debug-tools-tab-dialog-subpanel-link-wrapper")
			.append(this.subpanelLinkWrapper = this.addScrollableWrapper())
			.appendTo(this.body);

		this.panelWrapper = this.addScrollableWrapper()
			.appendTo(new Component()
				.classes.add("debug-tools-tab-dialog-subpanel-wrapper")
				.appendTo(this.body));

		this.updateSubpanelList();
		this.showFirstSubpanel();

		this.onResize();
	}

	protected abstract getSubpanels(): SubpanelInformation[];

	protected updateSubpanelList() {
		this.subpanelInformations = this.getSubpanels();

		this.subpanelLinkWrapper.dump()
			.append(this.subpanelInformations.map(subpanel => new Button()
				.classes.add("debug-tools-tab-dialog-subpanel-link")
				.setText(subpanel[1])
				.event.subscribe("activate", this.showSubPanel(subpanel[0]))
				.schedule(subpanelButton => subpanel[4] = subpanelButton)
				.schedule(subpanel[3])));

		if (!this.activeSubpanel) return;

		let found = false;
		for (const [id, , , , button] of this.subpanelInformations) {
			if (id === this.activeSubpanel[0]) {
				this.setActiveButton(button!);
				found = true;
				break;
			}
		}

		if (!found) this.showFirstSubpanel();
	}

	protected showSubPanel(button: Button): void;
	protected showSubPanel(id: string | number): (link: Button) => void;
	protected showSubPanel(idOrButton: string | number | Button) {
		if (idOrButton instanceof Button) {
			const subpanel = this.subpanelInformations.find(([, , , , button]) => button === idOrButton);
			if (!subpanel) return;

			this.switchSubpanel(subpanel);
		}

		return (link: Button) => {
			const subpanel = this.subpanelInformations.find(([id2]) => idOrButton === id2);
			if (!subpanel) return;

			this.switchSubpanel(subpanel);
		};
	}

	private showFirstSubpanel() {
		const [subpanelId, , , , button] = this.subpanelInformations[0];
		this.showSubPanel(subpanelId)(button!);
	}

	private switchSubpanel(subpanel: SubpanelInformation) {
		this.activeSubpanel = subpanel;

		this.setActiveButton(subpanel[4]!);

		subpanel[2](this.panelWrapper.dump());

		this.event.emit("changeSubpanel");
	}

	private setActiveButton(button: Button) {
		for (const element of this.subpanelLinkWrapper.findDescendants(".debug-tools-tab-dialog-subpanel-link.active")) {
			element.classList.remove("active");
		}

		button.classes.add("active");
	}

	@EventHandler<TabDialog>("self")("resize")
	private onResize() {
		const dialogWidth = newui.windowWidth * (this.edges[Edge.Right] - this.edges[Edge.Left]) / 100;
		this.classes.toggle(dialogWidth < 440, "tabs-drawer");
	}
}
