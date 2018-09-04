import { IHookHost } from "mod/IHookHost";
import Component from "newui/component/Component";
import { ComponentEvent } from "newui/component/IComponent";
import { DialogId, Edge, IDialogDescription } from "newui/screen/screens/game/Dialogs";
import IGameScreenApi from "newui/screen/screens/game/IGameScreenApi";
import { tuple } from "utilities/Arrays";
import { translation } from "../DebugTools";
import { DebugToolsTranslation } from "../IDebugTools";
import DebugToolsPanel, { DebugToolsPanelEvent } from "./component/DebugToolsPanel";
import DisplayPanel from "./panel/DisplayPanel";
import GeneralPanel from "./panel/GeneralPanel";
import PaintPanel from "./panel/PaintPanel";
import SelectionPanel from "./panel/SelectionPanel";
import TemplatePanel from "./panel/TemplatePanel";
import TabDialog, { SubpanelInformation } from "./TabDialog";

/**
 * A list of panel classes that will appear in the dialog.
 */
const subpanelClasses: (new (gsapi: IGameScreenApi) => DebugToolsPanel)[] = [
	GeneralPanel,
	DisplayPanel,
	PaintPanel,
	SelectionPanel,
	TemplatePanel,
];

export default class DebugToolsDialog extends TabDialog implements IHookHost {
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
			[Edge.Left, 25],
			[Edge.Bottom, 0],
		],
	};

	private subpanels: DebugToolsPanel[];
	private activePanel: DebugToolsPanel;

	private storePanels = true;

	public constructor(gsapi: IGameScreenApi, id: DialogId) {
		super(gsapi, id);
		this.classes.add("debug-tools-dialog");

		// we register this component as a "hook host" — this means that, like the `Mod` class, it can implement hook methods
		hookManager.register(this, "DebugToolsDialog")
			// we deregister this component as a "hook host" when it's removed from the DOM
			.until(ComponentEvent.Remove);

		// when the dialog is removed from the DOM, we force remove all of the panels (they're cached otherwise)
		this.on(ComponentEvent.WillRemove, () => {
			this.storePanels = false;
			for (const subpanel of this.subpanels) subpanel.remove();
		});
	}

	public getName() {
		return translation(DebugToolsTranslation.DialogTitleMain);
	}

	/**
	 * Implements the abstract method in "TabDialog". Returns an array of tuples containing information used to set-up the
	 * subpanels of this dialog.
	 * 
	 * If the subpanel classes haven't been instantiated yet, it first instantiates them. This includes binding a `WillRemove` event
	 * handler to the panel, which will `store` (cache) the panel instead of removing it, and trigger a `SwitchAway` event on the 
	 * panel when this occurs.
	 */
	public getSubpanels(): SubpanelInformation[] {
		if (!this.subpanels) {
			this.subpanels = subpanelClasses.map(cls => new cls(this.gsapi)
				.on(ComponentEvent.WillRemove, panel => {
					if (panel.isVisible()) {
						panel.trigger(DebugToolsPanelEvent.SwitchAway);
					}

					if (this.storePanels) {
						panel.store();
						return false;
					}

					return undefined;
				}));
		}

		return this.subpanels
			.map(subpanel => tuple(subpanel.getTranslation(), translation(subpanel.getTranslation()), this.onShowSubpanel(subpanel)));
	}

	/**
	 * Returns a function that will be executed when the passed subpanel is shown.
	 * 
	 * When executed, the return function will append the panel to show to the passed component (which is the panel wrapper 
	 * of the `TabDialog`), and trigger a `SwitchTo` event on the panel.
	 */
	private onShowSubpanel(showPanel: DebugToolsPanel) {
		return (component: Component) => {
			this.activePanel = showPanel.appendTo(component);
			this.activePanel.trigger(DebugToolsPanelEvent.SwitchTo);
		};
	}

}