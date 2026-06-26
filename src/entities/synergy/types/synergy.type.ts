import type { AttackType, CardJob, CardRace } from '@/entities/card/types/card.types';

export type SynergyCategory = 'race' | 'job';

export interface SynergyActivation {
	key: CardRace | CardJob;
	category: SynergyCategory;
	count: number;
	threshold: number;
	label: string;
	description: string;
}

export interface SynergyComputationContext {
	attackType: AttackType;
	enemyJob?: CardJob;
	enemyRace?: CardRace;
}

export interface SynergyBonuses {
	attackRate: number;
	finalDamageRate: number;
	maxHpFlat: number;
	recoveryRate: number;
	damageReductionRate: number;
	antiHealRate: number;
	forcedAttackType?: AttackType;
	jobAttackRates: Partial<Record<CardJob, number>>;
	activations: SynergyActivation[];
}
