import type { CardInstance, CardJob, CardRace } from '@/entities/card/types/card.types';
import type {
	SynergyBonuses,
	SynergyComputationContext,
	SynergyActivation,
} from '@/entities/synergy/types/synergy.type';

const raceThresholds: Record<CardRace, number[]> = {
	human: [2, 4, 6, 8],
	elf: [2, 4, 6, 8],
	orc: [2, 4, 6, 8],
	demon: [2, 4, 6, 8],
	undead: [2, 4, 6, 8],
};

const jobThresholds: Record<CardJob, number[]> = {
	warrior: [1, 3, 5],
	tank: [1, 3, 5],
	archer: [1, 3, 5],
	mage: [1, 3, 5],
	assassin: [1, 3, 5],
};

const getHighestThreshold = (count: number, thresholds: number[]) => {
	let matchedThreshold = 0;

	for (const threshold of thresholds) {
		if (count >= threshold) {
			matchedThreshold = threshold;
		}
	}

	return matchedThreshold;
};

const buildStreaks = <T extends string>(
	fieldCards: CardInstance[],
	keySelector: (card: CardInstance) => T,
) => {
	const streaks: Partial<Record<T, number>> = {};

	let currentKey: T | undefined;
	let currentCount = 0;

	for (const card of fieldCards) {
		const key = keySelector(card);

		if (currentKey === key) {
			currentCount += 1;
		} else {
			currentKey = key;
			currentCount = 1;
		}

		streaks[key] = Math.max(streaks[key] ?? 0, currentCount);
	}

	return streaks;
};

const createActivation = (
	key: CardRace | CardJob,
	category: 'race' | 'job',
	count: number,
	threshold: number,
	description: string,
): SynergyActivation => ({
	key,
	category,
	count,
	threshold,
	label: `${category === 'race' ? '종족' : '직업'} ${key} ${threshold}`,
	description,
});

const getRaceBonuses = (
	race: CardRace,
	threshold: number,
	context: SynergyComputationContext,
): Omit<SynergyBonuses, 'jobAttackRates' | 'activations'> & { description: string } => {
	switch (race) {
		case 'human':
			if (threshold === 2) {
				return { attackRate: 0, finalDamageRate: 0, maxHpFlat: 60, recoveryRate: 0, damageReductionRate: 0, antiHealRate: 0, description: '군단 최대 체력 +60' };
			}
			if (threshold === 4) {
				return { attackRate: 0, finalDamageRate: 0.06, maxHpFlat: 140, recoveryRate: 0, damageReductionRate: 0, antiHealRate: 0, description: '군단 최대 체력 +140, 최종 피해 +6%' };
			}
			if (threshold === 6) {
				return { attackRate: 0, finalDamageRate: 0.12, maxHpFlat: 240, recoveryRate: 0, damageReductionRate: 0, antiHealRate: 0, description: '군단 최대 체력 +240, 최종 피해 +12%' };
			}
			return { attackRate: 0, finalDamageRate: 0.2, maxHpFlat: 380, recoveryRate: 0, damageReductionRate: 0, antiHealRate: 0, description: '군단 최대 체력 +380, 최종 피해 +20%' };
		case 'elf': {
			const attackRate =
				context.attackType === 'range'
					? threshold === 2
						? 0.12
						: threshold === 4
							? 0.24
							: threshold === 6
								? 0.3
								: 0.45
					: 0;

			return {
				attackRate,
				finalDamageRate: threshold === 8 ? 0.1 : 0,
				maxHpFlat: 0,
				recoveryRate: 0,
				damageReductionRate: 0,
				antiHealRate: 0,
				forcedAttackType: threshold >= 6 ? 'range' : undefined,
				description:
					threshold >= 6
						? '군단 공격 타입을 원거리로 고정하고 공격력 보너스 적용'
						: '군단 공격 타입이 원거리일 때 공격력 증가',
			};
		}
		case 'orc':
			return {
				attackRate:
					context.attackType === 'melee'
						? threshold === 2
							? 0.15
							: threshold === 4
								? 0.3
								: threshold === 6
									? 0.45
									: 0.65
						: 0,
				finalDamageRate: threshold === 6 ? 0.08 : threshold === 8 ? 0.16 : 0,
				maxHpFlat: 0,
				recoveryRate: 0,
				damageReductionRate: 0,
				antiHealRate: 0,
				description: '군단 공격 타입이 근접일 때 공격력 증가',
			};
		case 'demon':
			return {
				attackRate:
					context.attackType === 'magic'
						? threshold === 2
							? 0.14
							: threshold === 4
								? 0.28
								: threshold === 6
									? 0.4
									: 0.55
						: 0,
				finalDamageRate: threshold === 8 ? 0.1 : 0,
				maxHpFlat: 0,
				recoveryRate: 0,
				damageReductionRate: 0,
				antiHealRate: threshold === 4 ? 0.25 : threshold === 6 ? 0.5 : threshold === 8 ? 0.75 : 0,
				description: '군단 공격 타입이 마법일 때 공격력 증가, 적 회복 차단',
			};
		case 'undead':
			return {
				attackRate: 0,
				finalDamageRate: threshold === 2 || threshold === 4 ? -0.05 : 0,
				maxHpFlat: threshold === 8 ? 120 : 0,
				recoveryRate: threshold === 2 ? 0.4 : threshold === 4 ? 0.8 : threshold === 6 ? 1.4 : 2.2,
				damageReductionRate: 0,
				antiHealRate: 0,
				description: '턴 종료 회복량 증가',
			};
	}
};

const getJobBonuses = (
	job: CardJob,
	threshold: number,
	context: SynergyComputationContext,
): Omit<SynergyBonuses, 'jobAttackRates' | 'activations'> & {
	description: string;
	jobAttackRate?: number;
} => {
	switch (job) {
		case 'warrior':
			return {
				attackRate: 0,
				finalDamageRate:
					(context.attackType === 'melee' ? threshold === 3 ? 0.06 : threshold === 5 ? 0.12 : 0 : 0) +
					(context.enemyJob === 'assassin' && threshold === 5 ? 0.12 : 0),
				maxHpFlat: 0,
				recoveryRate: 0,
				damageReductionRate: 0,
				antiHealRate: 0,
				jobAttackRate: threshold === 1 ? 0.1 : threshold === 3 ? 0.2 : 0.35,
				description: '전사 카드 공격력 증가, 근접 조합 추가 피해',
			};
		case 'tank':
			return {
				attackRate: 0,
				finalDamageRate: 0,
				maxHpFlat: threshold === 1 ? 40 : threshold === 3 ? 100 : 220,
				recoveryRate: threshold === 3 ? 0.15 : threshold === 5 ? 0.35 : 0,
				damageReductionRate: threshold === 5 ? 0.08 : 0,
				antiHealRate: 0,
				description: '군단 최대 체력과 회복량 증가',
			};
		case 'archer':
			return {
				attackRate: 0,
				finalDamageRate:
					(context.attackType === 'range' ? threshold === 3 ? 0.06 : threshold === 5 ? 0.12 : 0 : 0) +
					(threshold === 5 ? 0.1 : 0),
				maxHpFlat: 0,
				recoveryRate: 0,
				damageReductionRate: 0,
				antiHealRate: 0,
				jobAttackRate: threshold === 1 ? 0.1 : threshold === 3 ? 0.2 : 0.35,
				description: '궁수 카드 공격력 증가, 원거리 조합 추가 피해',
			};
		case 'mage':
			return {
				attackRate: 0,
				finalDamageRate:
					(context.enemyRace === 'undead' && threshold >= 3 ? threshold === 3 ? 0.1 : 0.2 : 0) +
					(context.attackType === 'magic' && threshold === 5 ? 0.08 : 0),
				maxHpFlat: 0,
				recoveryRate: 0,
				damageReductionRate: 0,
				antiHealRate: 0,
				jobAttackRate: threshold === 1 ? 0.1 : threshold === 3 ? 0.2 : 0.35,
				description: '마법사 카드 공격력 증가, 언데드 상대로 추가 피해',
			};
		case 'assassin':
			return {
				attackRate: 0,
				finalDamageRate:
					((context.enemyJob === 'mage' || context.enemyJob === 'archer') && threshold >= 3
						? threshold === 3
							? 0.1
							: 0.2
						: 0) + (threshold === 5 ? 0.06 : 0),
				maxHpFlat: 0,
				recoveryRate: 0,
				damageReductionRate: 0,
				antiHealRate: 0,
				jobAttackRate: threshold === 1 ? 0.1 : threshold === 3 ? 0.2 : 0.35,
				description: '암살자 카드 공격력 증가, 후방 직업 상대로 추가 피해',
			};
	}
};

export const calculateSynergyBonuses = (
	field: Array<CardInstance | null>,
	context: SynergyComputationContext,
) => {
	const fieldCards = field.filter((card): card is CardInstance => card !== null);
	const raceStreaks = buildStreaks(fieldCards, (card) => card.race);
	const jobStreaks = buildStreaks(fieldCards, (card) => card.job);

	const bonuses: SynergyBonuses = {
		attackRate: 0,
		finalDamageRate: 0,
		maxHpFlat: 0,
		recoveryRate: 0,
		damageReductionRate: 0,
		antiHealRate: 0,
		jobAttackRates: {},
		activations: [],
	};

	for (const [race, count] of Object.entries(raceStreaks) as Array<[CardRace, number]>) {
		const threshold = getHighestThreshold(count, raceThresholds[race]);

		if (threshold === 0) {
			continue;
		}

		const raceBonus = getRaceBonuses(race, threshold, context);

		bonuses.attackRate += raceBonus.attackRate;
		bonuses.finalDamageRate += raceBonus.finalDamageRate;
		bonuses.maxHpFlat += raceBonus.maxHpFlat;
		bonuses.recoveryRate += raceBonus.recoveryRate;
		bonuses.damageReductionRate += raceBonus.damageReductionRate;
		bonuses.antiHealRate = Math.max(bonuses.antiHealRate, raceBonus.antiHealRate);
		bonuses.forcedAttackType ??= raceBonus.forcedAttackType;
		bonuses.activations.push(createActivation(race, 'race', count, threshold, raceBonus.description));
	}

	for (const [job, count] of Object.entries(jobStreaks) as Array<[CardJob, number]>) {
		const threshold = getHighestThreshold(count, jobThresholds[job]);

		if (threshold === 0) {
			continue;
		}

		const jobBonus = getJobBonuses(job, threshold, context);

		bonuses.attackRate += jobBonus.attackRate;
		bonuses.finalDamageRate += jobBonus.finalDamageRate;
		bonuses.maxHpFlat += jobBonus.maxHpFlat;
		bonuses.recoveryRate += jobBonus.recoveryRate;
		bonuses.damageReductionRate += jobBonus.damageReductionRate;
		bonuses.antiHealRate = Math.max(bonuses.antiHealRate, jobBonus.antiHealRate);

		if (jobBonus.jobAttackRate) {
			bonuses.jobAttackRates[job] = jobBonus.jobAttackRate;
		}

		bonuses.activations.push(createActivation(job, 'job', count, threshold, jobBonus.description));
	}

	return {
		raceStreaks,
		jobStreaks,
		bonuses,
	};
};
