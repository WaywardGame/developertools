import Entity from "game/entity/Entity";
import { StatusEffectChangeReason } from "game/entity/IEntity";
import { Stat } from "game/entity/IStats";

/**
 * Copies stats and status effects from one entity to another.
 */
export default function (from: Entity, to: Entity) {
	for (const statName of Object.keys(from.stats)) {
		const stat = Stat[statName as keyof typeof Stat];
		const statObject = from.stat.get(stat)!;
		to.stat.set(stat, statObject.value);
		const cloneStatObject = to.stat.get(stat)!;
		if ("max" in statObject) to.stat.setMax(stat, statObject.max!);
		if ("canExceedMax" in statObject) cloneStatObject.canExceedMax = statObject.canExceedMax;
		if ("bonus" in statObject) to.stat.setBonus(stat, statObject.bonus!);
		if ("changeTimer" in statObject) {
			to.stat.setChangeTimer(stat, statObject.changeTimer!, t => t.setAmount(statObject.changeAmount));
			(cloneStatObject as any).nextChangeTimer = statObject.nextChangeTimer!;
		}
	}

	for (const statusEffect of from.getStatuses()) {
		to.setStatus(statusEffect.type, true, StatusEffectChangeReason.Gained);
	}
}
