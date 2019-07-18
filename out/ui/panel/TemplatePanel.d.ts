import { Bindable, BindCatcherApi } from "newui/IBindingManager";
import DebugTools from "../../DebugTools";
import { DebugToolsTranslation } from "../../IDebugTools";
import DebugToolsPanel from "../component/DebugToolsPanel";
export default class TemplatePanel extends DebugToolsPanel {
    readonly DEBUG_TOOLS: DebugTools;
    private readonly dropdownType;
    private readonly dropdownTemplate;
    private readonly mirrorVertically;
    private readonly mirrorHorizontally;
    private readonly rotate;
    private readonly degrade;
    private readonly place;
    private readonly previewTiles;
    private selectHeld;
    constructor();
    getTranslation(): DebugToolsTranslation;
    canClientMove(api: BindCatcherApi): false | undefined;
    onBindLoop(bindPressed: Bindable, api: BindCatcherApi): Bindable;
    private getTemplate;
    private templateHasTile;
    private getTemplateOptions;
    protected onSwitchTo(): void;
    protected onSwitchAway(): void;
    private changeTemplateType;
    private placeTemplate;
    private clearPreview;
}
