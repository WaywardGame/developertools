define(["require", "exports", "newui/component/IComponent", "newui/screen/screens/game/Dialogs", "../DebugTools", "../IDebugTools", "./component/DebugToolsPanel", "./panel/DisplayPanel", "./panel/GeneralPanel", "./panel/PaintPanel", "./TabDialog"], function (require, exports, IComponent_1, Dialogs_1, DebugTools_1, IDebugTools_1, DebugToolsPanel_1, DisplayPanel_1, GeneralPanel_1, PaintPanel_1, TabDialog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const subpanelClasses = [
        GeneralPanel_1.default,
        DisplayPanel_1.default,
        PaintPanel_1.default,
    ];
    class DebugToolsDialog extends TabDialog_1.default {
        constructor(gsapi, id) {
            super(gsapi, id);
            this.storePanels = true;
            this.classes.add("debug-tools-dialog");
            hookManager.register(this, "DebugToolsDialog")
                .until(IComponent_1.ComponentEvent.Remove);
            this.on(IComponent_1.ComponentEvent.WillRemove, () => {
                this.storePanels = false;
                for (const subpanel of this.subpanels)
                    subpanel.remove();
            });
        }
        getName() {
            return DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.DialogTitleMain);
        }
        getSubpanels() {
            if (!this.subpanels) {
                this.subpanels = subpanelClasses.map(cls => new cls(this.gsapi));
            }
            return this.subpanels
                .map(subpanel => [subpanel.getTranslation(), DebugTools_1.translation(subpanel.getTranslation()), this.onShowSubpanel(subpanel)]);
        }
        onShowSubpanel(showPanel) {
            return (component) => {
                if (showPanel === this.activePanel)
                    return;
                this.activePanel = showPanel.appendTo(component)
                    .on(IComponent_1.ComponentEvent.WillRemove, panel => {
                    panel.triggerSync(DebugToolsPanel_1.DebugToolsPanelEvent.SwitchAway);
                    if (this.storePanels) {
                        panel.store();
                        return false;
                    }
                    return undefined;
                });
                this.activePanel.triggerSync(DebugToolsPanel_1.DebugToolsPanelEvent.SwitchTo);
            };
        }
    }
    DebugToolsDialog.description = {
        minSize: {
            x: 25,
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
            [Dialogs_1.Edge.Left, 25],
            [Dialogs_1.Edge.Bottom, 0],
        ],
    };
    exports.default = DebugToolsDialog;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVidWdUb29sc0RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aS9EZWJ1Z1Rvb2xzRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWFBLE1BQU0sZUFBZSxHQUF1RDtRQUMzRSxzQkFBWTtRQUNaLHNCQUFZO1FBQ1osb0JBQVU7S0FDVixDQUFDO0lBRUYsTUFBcUIsZ0JBQWlCLFNBQVEsbUJBQVM7UUF5QnRELFlBQW1CLEtBQXFCLEVBQUUsRUFBWTtZQUNyRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBSFYsZ0JBQVcsR0FBRyxJQUFJLENBQUM7WUFJMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUV2QyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQztpQkFDNUMsS0FBSyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFL0IsSUFBSSxDQUFDLEVBQUUsQ0FBQywyQkFBYyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO2dCQUN6QixLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTO29CQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMxRCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxPQUFPO1lBQ2IsT0FBTyx3QkFBVyxDQUFDLG1DQUFxQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFTSxZQUFZO1lBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNqRTtZQUVELE9BQU8sSUFBSSxDQUFDLFNBQVM7aUJBQ25CLEdBQUcsQ0FBc0IsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsRUFBRSx3QkFBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVJLENBQUM7UUFFTyxjQUFjLENBQUMsU0FBMEI7WUFDaEQsT0FBTyxDQUFDLFNBQW9CLEVBQUUsRUFBRTtnQkFDL0IsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLFdBQVc7b0JBQUUsT0FBTztnQkFFM0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztxQkFDOUMsRUFBRSxDQUFDLDJCQUFjLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUN0QyxLQUFLLENBQUMsV0FBVyxDQUFDLHNDQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNuRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ3JCLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDZCxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxPQUFPLFNBQVMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7Z0JBRUosSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsc0NBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0QsQ0FBQyxDQUFDO1FBQ0gsQ0FBQzs7SUFuRWEsNEJBQVcsR0FBdUI7UUFDL0MsT0FBTyxFQUFFO1lBQ1IsQ0FBQyxFQUFFLEVBQUU7WUFDTCxDQUFDLEVBQUUsRUFBRTtTQUNMO1FBQ0QsSUFBSSxFQUFFO1lBQ0wsQ0FBQyxFQUFFLEVBQUU7WUFDTCxDQUFDLEVBQUUsRUFBRTtTQUNMO1FBQ0QsT0FBTyxFQUFFO1lBQ1IsQ0FBQyxFQUFFLEVBQUU7WUFDTCxDQUFDLEVBQUUsRUFBRTtTQUNMO1FBQ0QsS0FBSyxFQUFFO1lBQ04sQ0FBQyxjQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNmLENBQUMsY0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDaEI7S0FDRCxDQUFDO0lBbEJILG1DQXNFQyJ9