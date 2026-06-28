import type { EnemyUnit, LegionSummary } from '@/entities/battle/types/battle.types';
import {
	getEnemyAttackForTurn,
	getEnemyDamageTakenForTurn,
	getLegionRecoveryForTurn,
} from '@/entities/battle/model/battle-balance';

export const getEffectiveEnemyAttack = (
	enemy: EnemyUnit,
	turn: number,
	legionSummary: LegionSummary,
) => getEnemyAttackForTurn(enemy, turn, legionSummary.dominantAttackType);

export const getEffectivePlayerDamage = (
	enemy: EnemyUnit,
	turn: number,
	legionSummary: LegionSummary,
) => getEnemyDamageTakenForTurn(enemy, turn, legionSummary.finalAttack);

export const getEffectiveLegionRecovery = (
	enemy: EnemyUnit,
	legionSummary: LegionSummary,
) => getLegionRecoveryForTurn(enemy, legionSummary);
