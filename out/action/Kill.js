define(["require", "exports", "game/entity/action/Action", "game/entity/action/IAction", "game/entity/IEntity", "../Actions", "../IDebugTools"], function (require, exports, Action_1, IAction_1, IEntity_1, Actions_1, IDebugTools_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new Action_1.Action(IAction_1.ActionArgument.Entity)
        .setUsableBy(IEntity_1.EntityType.Player)
        .setUsableWhen(...Actions_1.defaultUsability)
        .setHandler((action, entity) => {
        var _a;
        entity.damage({
            type: IEntity_1.DamageType.True,
            amount: Infinity,
            damageMessage: IDebugTools_1.translation(IDebugTools_1.DebugToolsTranslation.KillEntityDeathMessage),
        });
        renderer === null || renderer === void 0 ? void 0 : renderer.computeSpritesInViewport();
        action.setUpdateRender();
        if (!multiplayer.isConnected() && ((_a = entity.asPlayer) === null || _a === void 0 ? void 0 : _a.isLocalPlayer())) {
            action.setPassTurn();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS2lsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY3Rpb24vS2lsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxrQkFBZSxJQUFJLGVBQU0sQ0FBQyx3QkFBYyxDQUFDLE1BQU0sQ0FBQztTQUM5QyxXQUFXLENBQUMsb0JBQVUsQ0FBQyxNQUFNLENBQUM7U0FDOUIsYUFBYSxDQUFDLEdBQUcsMEJBQWdCLENBQUM7U0FDbEMsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFOztRQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ2IsSUFBSSxFQUFFLG9CQUFVLENBQUMsSUFBSTtZQUNyQixNQUFNLEVBQUUsUUFBUTtZQUNoQixhQUFhLEVBQUUseUJBQVcsQ0FBQyxtQ0FBcUIsQ0FBQyxzQkFBc0IsQ0FBQztTQUN4RSxDQUFDLENBQUM7UUFFSCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsd0JBQXdCLEVBQUUsQ0FBQztRQUNyQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsS0FBSSxNQUFBLE1BQU0sQ0FBQyxRQUFRLDBDQUFFLGFBQWEsRUFBRSxDQUFBLEVBQUU7WUFDbkUsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3JCO0lBQ0YsQ0FBQyxDQUFDLENBQUMifQ==