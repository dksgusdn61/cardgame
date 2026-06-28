import type { AttackType } from '@/entities/card/types/card.types';
import type { EnemyTrait, EnemyUnit, LegionSummary } from '@/entities/battle/types/battle.types';

export const BASE_LEGION_HP = 200;

const ENEMY_RAGE_RULES = [
	{ turn: 7, multiplier: 1.8 },
	{ turn: 5, multiplier: 1.45 },
	{ turn: 3, multiplier: 1.2 },
] as const;

const WAVE_HP_SCALE_PER_STEP = 0.2;
const WAVE_ATTACK_SCALE_PER_STEP = 0.16;
const WAVE_RECOVERY_SCALE_PER_STEP = 0.12;

const hasTrait = (traits: EnemyTrait[], traitId: EnemyTrait['id']) =>
	traits.some((trait) => trait.id === traitId);

export const getEnemyRageMultiplier = (turn: number) =>
	ENEMY_RAGE_RULES.find((rule) => turn >= rule.turn)?.multiplier ?? 1;

export const getWaveScaledEnemy = (enemy: EnemyUnit, waveNumber: number): EnemyUnit => {
	const waveStep = Math.max(0, waveNumber - 1);

	return {
		...enemy,
		hp: Math.round(enemy.hp * (1 + waveStep * WAVE_HP_SCALE_PER_STEP)),
		attack: Math.round(enemy.attack * (1 + waveStep * WAVE_ATTACK_SCALE_PER_STEP)),
		recovery: Math.round(enemy.recovery * (1 + waveStep * WAVE_RECOVERY_SCALE_PER_STEP)),
	};
};

export const getEnemyAttackForTurn = (
	enemy: EnemyUnit,
	turn: number,
	legionAttackType?: AttackType,
) => {
	let attack = Math.round(enemy.attack * getEnemyRageMultiplier(turn));

	if (hasTrait(enemy.traits, 'piercing-throw') && legionAttackType !== 'range') {
		attack += 12;
	}

	return attack;
};

export const getEnemyDamageTakenForTurn = (
	enemy: EnemyUnit,
	turn: number,
	playerDamage: number,
) => {
	if (hasTrait(enemy.traits, 'stone-flesh') && turn <= 2) {
		return Math.round(playerDamage * 0.9);
	}

	return playerDamage;
};

export const getLegionRecoveryForTurn = (
	enemy: EnemyUnit,
	legionSummary: LegionSummary,
) => {
	if (hasTrait(enemy.traits, 'plague-ritual')) {
		return Math.round(legionSummary.recoveryPerTurn * 0.75);
	}

	return legionSummary.recoveryPerTurn;
};
