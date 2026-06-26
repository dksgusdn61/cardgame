import type { AttackType, CardInstance, CardJob, CardRace } from '@/entities/card/types/card.types';
import type { SynergyActivation } from '@/entities/synergy/types/synergy.type';

export interface EnemyTrait {
	name: string;
	description: string;
}

export interface EnemyUnit {
	id: string;
	name: string;
	hp: number;
	attack: number;
	recovery: number;
	attackType: AttackType;
	race?: CardRace;
	job?: CardJob;
	traits: EnemyTrait[];
}

export interface LegionSummary {
	deployedCards: CardInstance[];
	baseAttack: number;
	baseHp: number;
	baseRecovery: number;
	finalAttack: number;
	maxHp: number;
	recoveryPerTurn: number;
	dominantAttackType?: AttackType;
	damageReductionRate: number;
	antiHealRate: number;
	activeSynergies: SynergyActivation[];
	raceStreaks: Partial<Record<CardRace, number>>;
	jobStreaks: Partial<Record<CardJob, number>>;
}

export interface SimulatedTurnLog {
	turn: number;
	enemyHpAfterHeal: number;
	enemyHpAfterAttack: number;
	legionHpAfterAttack: number;
	legionHpAfterRecovery: number;
}

export interface BattleSimulationResult {
	winner: 'player' | 'enemy';
	turns: number;
	remainingEnemyHp: number;
	remainingLegionHp: number;
	logs: SimulatedTurnLog[];
}
