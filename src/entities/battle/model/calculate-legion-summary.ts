import type { CardInstance } from '@/entities/card/types/card.types';
import type { EnemyUnit, LegionSummary } from '@/entities/battle/types/battle.types';
import { calculateSynergyBonuses } from '@/entities/synergy/model/calculate-synergy';

const getDominantAttackType = (cards: CardInstance[]) => {
	if (cards.length === 0) {
		return undefined;
	}

	const statsByAttackType = cards.reduce<
		Record<string, { count: number; totalAttack: number }>
	>((result, card) => {
		const current = result[card.attackType] ?? { count: 0, totalAttack: 0 };
		result[card.attackType] = {
			count: current.count + 1,
			totalAttack: current.totalAttack + card.attack,
		};
		return result;
	}, {});

	return Object.entries(statsByAttackType).sort((left, right) => {
		if (right[1].count !== left[1].count) {
			return right[1].count - left[1].count;
		}

		return right[1].totalAttack - left[1].totalAttack;
	})[0]?.[0] as
		| CardInstance['attackType']
		| undefined;
};

const calculateAdjustedAttack = (cards: CardInstance[], jobAttackRates: Record<string, number>) =>
	cards.reduce((total, card) => {
		const jobRate = jobAttackRates[card.job] ?? 0;
		return total + Math.round(card.attack * (1 + jobRate));
	}, 0);

export const calculateLegionSummary = (
	field: Array<CardInstance | null>,
	enemy: EnemyUnit,
): LegionSummary => {
	const deployedCards = field.filter((card): card is CardInstance => card !== null);
	const baseAttack = deployedCards.reduce((total, card) => total + card.attack, 0);
	const baseHp = deployedCards.reduce((total, card) => total + card.hp, 0);
	const baseRecovery = Math.floor(baseHp / 10);
	const dominantAttackType = getDominantAttackType(deployedCards);

	const baseSynergies = calculateSynergyBonuses(field, {
		attackType: dominantAttackType ?? 'melee',
		enemyJob: enemy.job,
		enemyRace: enemy.race,
	});

	const effectiveAttackType = baseSynergies.bonuses.forcedAttackType ?? dominantAttackType;
	const finalSynergies =
		effectiveAttackType && effectiveAttackType !== dominantAttackType
			? calculateSynergyBonuses(field, {
					attackType: effectiveAttackType,
					enemyJob: enemy.job,
					enemyRace: enemy.race,
				})
			: baseSynergies;

	const adjustedAttack = calculateAdjustedAttack(deployedCards, finalSynergies.bonuses.jobAttackRates);
	const finalAttack = Math.round(
		adjustedAttack * (1 + finalSynergies.bonuses.attackRate) * (1 + finalSynergies.bonuses.finalDamageRate),
	);
	const maxHp = baseHp + finalSynergies.bonuses.maxHpFlat;
	const recoveryPerTurn = Math.round(baseRecovery * (1 + finalSynergies.bonuses.recoveryRate));

	return {
		deployedCards,
		baseAttack,
		baseHp,
		baseRecovery,
		finalAttack,
		maxHp,
		recoveryPerTurn,
		dominantAttackType: effectiveAttackType ?? dominantAttackType,
		damageReductionRate: finalSynergies.bonuses.damageReductionRate,
		antiHealRate: finalSynergies.bonuses.antiHealRate,
		activeSynergies: finalSynergies.bonuses.activations,
		raceStreaks: finalSynergies.raceStreaks,
		jobStreaks: finalSynergies.jobStreaks,
	};
};
