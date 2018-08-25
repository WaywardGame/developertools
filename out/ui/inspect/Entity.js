var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "entity/IBaseEntity", "entity/IEntity", "entity/IStats", "Enums", "language/Translation", "newui/BindingManager", "newui/component/BlockRow", "newui/component/Button", "newui/component/Component", "newui/component/ContextMenu", "newui/component/IComponent", "newui/component/Input", "newui/component/LabelledRow", "newui/component/RangeInput", "newui/component/RangeRow", "newui/component/Text", "utilities/Collectors", "utilities/enum/Enums", "utilities/math/Vector3", "utilities/Objects", "../../Actions", "../../DebugTools", "../../IDebugTools", "../../util/Array", "../component/InspectInformationSection", "./Creature", "./Human", "./Npc", "./Player"], function (require, exports, IBaseEntity_1, IEntity_1, IStats_1, Enums_1, Translation_1, BindingManager_1, BlockRow_1, Button_1, Component_1, ContextMenu_1, IComponent_1, Input_1, LabelledRow_1, RangeInput_1, RangeRow_1, Text_1, Collectors_1, Enums_2, Vector3_1, Objects_1, Actions_1, DebugTools_1, IDebugTools_1, Array_1, InspectInformationSection_1, Creature_1, Human_1, Npc_1, Player_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const entitySubsectionClasses = [
        Player_1.default,
        Human_1.default,
        Npc_1.default,
        Creature_1.default,
    ];
    class EntityInformation extends InspectInformationSection_1.default {
        constructor(api) {
            super(api);
            this.statComponents = new Map();
            this.entities = [];
            new BlockRow_1.BlockRow(api)
                .append(new Button_1.default(this.api)
                .setText(DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.ButtonHealEntity))
                .on(Button_1.ButtonEvent.Activate, this.heal)
                .appendTo(this))
                .append(new Button_1.default(this.api)
                .setText(DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.ButtonKillEntity))
                .on(Button_1.ButtonEvent.Activate, this.kill))
                .appendTo(this);
            new BlockRow_1.BlockRow(api)
                .append(new Button_1.default(this.api)
                .setText(DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.ButtonTeleportEntity))
                .on(Button_1.ButtonEvent.Activate, this.openTeleportMenu))
                .append(new Button_1.default(this.api)
                .setText(DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.ButtonCloneEntity))
                .on(Button_1.ButtonEvent.Activate, this.cloneEntity))
                .appendTo(this);
            this.subsections = entitySubsectionClasses.map(cls => new cls(api)
                .appendTo(this));
            this.statWrapper = new Component_1.default(this.api)
                .classes.add("debug-tools-inspect-entity-sub-section")
                .appendTo(this);
        }
        getTabs() {
            return this.entities.entries()
                .map(([i, entity]) => [i, () => DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.EntityName)
                    .get(IEntity_1.EntityType[entity.entityType], game.getName(entity, Enums_1.SentenceCaseStyle.Title))])
                .collect(Collectors_1.default.toArray);
        }
        setTab(entity) {
            this.entity = this.entities[entity];
            for (const subsection of this.subsections) {
                subsection.update(this.entity);
            }
            this.initializeStats();
            return this;
        }
        update(position, tile) {
            const entities = game.getPlayersAtTile(tile, true);
            if (tile.creature)
                entities.push(tile.creature);
            if (tile.npc)
                entities.push(tile.npc);
            if (Array_1.areArraysIdentical(entities, this.entities))
                return;
            this.entities = entities;
            this.trigger("change");
            if (!this.entities.length)
                return;
            this.setShouldLog();
            for (const entity of this.entities) {
                this.until([IComponent_1.ComponentEvent.Remove, "change"])
                    .bind(entity, IBaseEntity_1.EntityEvent.StatChanged, this.onStatChange);
            }
        }
        getIndex(entity) {
            return this.entities.indexOf(entity);
        }
        getEntity(index) {
            return this.entities[index];
        }
        logUpdate() {
            for (const entity of this.entities) {
                DebugTools_1.default.LOG.info("Entity:", entity);
            }
        }
        initializeStats() {
            this.statWrapper.dump();
            this.statComponents.clear();
            const stats = Enums_2.default.values(IStats_1.Stat)
                .filter(stat => this.entity.hasStat(stat) && (!this.subsections.some(subsection => subsection.getImmutableStats().includes(stat))))
                .map(stat => this.entity.getStat(stat))
                .filter((stat) => stat !== undefined);
            for (const stat of stats) {
                if ("max" in stat && !stat.canExceedMax) {
                    this.statComponents.set(stat.type, new RangeRow_1.RangeRow(this.api)
                        .setLabel(label => label.setText(Translation_1.default.generator(IStats_1.Stat[stat.type])))
                        .editRange(range => range
                        .setMin(0)
                        .setMax(stat.max)
                        .setRefreshMethod(() => this.entity ? this.entity.getStatValue(stat.type) : 0))
                        .on(RangeInput_1.RangeInputEvent.Finish, this.setStat(stat.type))
                        .setDisplayValue(true)
                        .appendTo(this.statWrapper));
                }
                else {
                    this.statComponents.set(stat.type, new Input_1.default(this.api)
                        .on(Input_1.InputEvent.Done, (input, value) => {
                        if (isNaN(+value)) {
                            input.clear();
                        }
                        else {
                            this.setStat(stat.type)(input, +value);
                        }
                    })
                        .setCanBeEmpty(false)
                        .setDefault(() => this.entity ? `${this.entity.getStatValue(stat.type)}` : "")
                        .clear()
                        .appendTo(new LabelledRow_1.LabelledRow(this.api)
                        .setLabel(label => label.setText(Translation_1.default.generator(IStats_1.Stat[stat.type])))
                        .appendTo(this.statWrapper)));
                }
            }
        }
        onStatChange(_, stat, oldValue, info) {
            const statComponent = this.statComponents.get(stat.type);
            if (statComponent) {
                statComponent.refresh();
            }
        }
        openTeleportMenu() {
            const screen = this.api.getVisibleScreen();
            if (!screen) {
                return;
            }
            if (this.entity === localPlayer && !multiplayer.isConnected()) {
                this.selectTeleportLocation();
                return;
            }
            const mouse = BindingManager_1.bindingManager.getMouse();
            new ContextMenu_1.default(this.api, ["select location", {
                    translation: DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.OptionTeleportSelectLocation),
                    onActivate: this.selectTeleportLocation,
                }], this.entity === localPlayer ? undefined : ["to local player", {
                    translation: DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.OptionTeleportToLocalPlayer),
                    onActivate: () => this.teleport(localPlayer),
                }], !multiplayer.isConnected() || this.entity === players[0] ? undefined : ["to host", {
                    translation: DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.OptionTeleportToHost),
                    onActivate: () => this.teleport(players[0]),
                }], !multiplayer.isConnected() ? undefined : ["to player", {
                    translation: DebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.OptionTeleportToPlayer),
                    submenu: this.createTeleportToPlayerMenu,
                }])
                .addAllDescribedOptions()
                .setPosition(...mouse.xy)
                .schedule(screen.setContextMenu);
        }
        createTeleportToPlayerMenu() {
            return players.values()
                .filter(player => player !== this.entity)
                .map(player => [player.name, {
                    translation: Translation_1.default.generator(player.name),
                    onActivate: () => this.teleport(player),
                }])
                .collect(Collectors_1.default.toArray)
                .sort(([, t1], [, t2]) => Text_1.default.toString(t1.translation).localeCompare(Text_1.default.toString(t2.translation)))
                .values()
                .collect(Collectors_1.default.passTo(ContextMenu_1.default.bind(null, this.api), Collectors_1.PassStrategy.Splat))
                .addAllDescribedOptions();
        }
        async selectTeleportLocation() {
            const teleportLocation = await DebugTools_1.default.INSTANCE.selector.select();
            if (!teleportLocation)
                return;
            this.teleport(teleportLocation);
        }
        teleport(location) {
            Actions_1.default.get("teleport")
                .execute({ entity: this.entity, position: new Vector3_1.default(location.x, location.y, "z" in location ? location.z : this.entity.z) });
            this.triggerSync("update");
        }
        kill() {
            Actions_1.default.get("kill").execute({ entity: this.entity });
            this.triggerSync("update");
        }
        async cloneEntity() {
            const teleportLocation = await DebugTools_1.default.INSTANCE.selector.select();
            if (!teleportLocation)
                return;
            Actions_1.default.get("clone")
                .execute({ entity: this.entity, position: new Vector3_1.default(teleportLocation.x, teleportLocation.y, localPlayer.z) });
        }
        heal() {
            Actions_1.default.get("heal").execute({ entity: this.entity });
            this.triggerSync("update");
        }
        setStat(stat) {
            return (_, value) => {
                if (this.entity.getStatValue(stat) === value)
                    return;
                Actions_1.default.get("setStat").execute({ entity: this.entity, object: [stat, value] });
            };
        }
    }
    __decorate([
        Objects_1.Bound
    ], EntityInformation.prototype, "onStatChange", null);
    __decorate([
        Objects_1.Bound
    ], EntityInformation.prototype, "openTeleportMenu", null);
    __decorate([
        Objects_1.Bound
    ], EntityInformation.prototype, "createTeleportToPlayerMenu", null);
    __decorate([
        Objects_1.Bound
    ], EntityInformation.prototype, "selectTeleportLocation", null);
    __decorate([
        Objects_1.Bound
    ], EntityInformation.prototype, "teleport", null);
    __decorate([
        Objects_1.Bound
    ], EntityInformation.prototype, "kill", null);
    __decorate([
        Objects_1.Bound
    ], EntityInformation.prototype, "cloneEntity", null);
    __decorate([
        Objects_1.Bound
    ], EntityInformation.prototype, "heal", null);
    __decorate([
        Objects_1.Bound
    ], EntityInformation.prototype, "setStat", null);
    exports.default = EntityInformation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL2luc3BlY3QvRW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQXNDQSxNQUFNLHVCQUF1QixHQUErRDtRQUMzRixnQkFBaUI7UUFDakIsZUFBZ0I7UUFDaEIsYUFBYztRQUNkLGtCQUFtQjtLQUNuQixDQUFDO0lBRUYsTUFBcUIsaUJBQWtCLFNBQVEsbUNBQXlCO1FBUXZFLFlBQW1CLEdBQVU7WUFDNUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBTkssbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBc0IsQ0FBQztZQUV4RCxhQUFRLEdBQW1DLEVBQUUsQ0FBQztZQU1yRCxJQUFJLG1CQUFRLENBQUMsR0FBRyxDQUFDO2lCQUNmLE1BQU0sQ0FBQyxJQUFJLGdCQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztpQkFDMUIsT0FBTyxDQUFDLHdCQUFXLENBQUMsbUNBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDNUQsRUFBRSxDQUFDLG9CQUFXLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7aUJBQ25DLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDaEIsTUFBTSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2lCQUMxQixPQUFPLENBQUMsd0JBQVcsQ0FBQyxtQ0FBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUM1RCxFQUFFLENBQUMsb0JBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFakIsSUFBSSxtQkFBUSxDQUFDLEdBQUcsQ0FBQztpQkFDZixNQUFNLENBQUMsSUFBSSxnQkFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7aUJBQzFCLE9BQU8sQ0FBQyx3QkFBVyxDQUFD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