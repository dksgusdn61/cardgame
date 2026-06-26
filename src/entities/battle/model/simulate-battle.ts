import type { EnemyUnit, BattleSimulationResult, LegionSummary } from '@/entities/battle/types/battle.types';

const MAX_TURNS = 8;

export const simulateBattle = (
	legion: LegionSummary,
	enemy: EnemyUnit,
): BattleSimulationResult => {
	let currentEnemyHp = enemy.hp;
	let currentLegionHp = legion.maxHp;
	const logs: BattleSimulationResult['logs'] = [];

	for (let turn = 1; turn <= MAX_TURNS; turn += 1) {
		const enemyRecovery = Math.round(enemy.recovery * (1 - legion.antiHealRate));
		currentEnemyHp = Math.min(enemy.hp, currentEnemyHp + enemyRecovery);
		const enemyHpAfterHeal = currentEnemyHp;

		currentEnemyHp = Math.max(0, currentEnemyHp - legion.finalAttack);
		const enemyHpAfterAttack = currentEnemyHp;

		if (currentEnemyHp === 0) {
			logs.push({
				turn,
				enemyHpAfterHeal,
				enemyHpAfterAttack,
				legionHpAfterAttack: currentLegionHp,
				legionHpAfterRecovery: currentLegionHp,
			});

			return {
				winner: 'player',
				turns: turn,
				remainingEnemyHp: currentEnemyHp,
				remainingLegionHp: currentLegionHp,
				logs,
			};
		}

		const incomingDamage = Math.round(enemy.attack * (1 - legion.damageReductionRate));
		currentLegionHp = Math.max(0, currentLegionHp - incomingDamage);
		const legionHpAfterAttack = currentLegionHp;

		if (currentLegionHp === 0) {
			logs.push({
				turn,
				enemyHpAfterHeal,
				enemyHpAfterAttack,
				legionHpAfterAttack,
				legionHpAfterRecovery: legionHpAfterAttack,
			});

			return {
				winner: 'enemy',
				turns: turn,
				remainingEnemyHp: currentEnemyHp,
				remainingLegionHp: currentLegionHp,
				logs,
			};
		}

		currentLegionHp = Math.min(legion.maxHp, currentLegionHp + legion.recoveryPerTurn);
		logs.push({
			turn,
			enemyHpAfterHeal,
			enemyHpAfterAttack,
			legionHpAfterAttack,
			legionHpAfterRecovery: currentLegionHp,
		});
	}

	return {
		winner: currentEnemyHp <= 0 ? 'player' : 'enemy',
		turns: MAX_TURNS,
		remainingEnemyHp: currentEnemyHp,
		remainingLegionHp: currentLegionHp,
		logs,
	};
};
