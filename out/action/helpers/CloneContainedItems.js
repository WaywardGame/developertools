define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function default_1(from, to) {
        var _a, _b;
        if (!("containedItems" in from) || !("containedItems" in to))
            return;
        for (const item of from.containedItems || []) {
            const clone = itemManager.create(item.type, to, item.quality);
            clone.ownerIdentifier = item.ownerIdentifier;
            (_a = game.notifier) === null || _a === void 0 ? void 0 : _a.suspend(true);
            clone.minDur = item.minDur;
            (_b = game.notifier) === null || _b === void 0 ? void 0 : _b.suspend(false);
            clone.maxDur = item.maxDur;
            clone.renamed = item.renamed;
            clone.weight = item.weight;
            clone.weightCapacity = item.weightCapacity;
            clone.magic.inherit(item.magic);
        }
    }
    exports.default = default_1;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xvbmVDb250YWluZWRJdGVtcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hY3Rpb24vaGVscGVycy9DbG9uZUNvbnRhaW5lZEl0ZW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUtBLG1CQUF5QixJQUF5QixFQUFFLEVBQXVCOztRQUMxRSxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFDO1lBQUUsT0FBTztRQUVyRSxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksRUFBRSxFQUFFO1lBQzdDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFnQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1RSxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDN0MsTUFBQSxJQUFJLENBQUMsUUFBUSwwQ0FBRSxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQzdCLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMzQixNQUFBLElBQUksQ0FBQyxRQUFRLDBDQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDOUIsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzNCLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUM3QixLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDM0IsS0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQzNDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNoQztJQUNGLENBQUM7SUFmRCw0QkFlQyJ9