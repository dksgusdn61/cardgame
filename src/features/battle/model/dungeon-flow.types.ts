import type { BattleState } from '@/features/battle/model/battle-state.types';

export type DungeonPhase =
	| 'idle'
	| 'wave_setup'
	| 'turn_ready'
	| 'wave_cleared'
	| 'victory'
	| 'defeat';

export interface TurnLogEntry {
	turn: number;
	playerDamage: number;
	enemyDamage: number;
	enemyRecovery: number;
	legionRecovery: number;
	enemyHpAfterTurn: number;
	legionHpAfterTurn: number;
}

export interface DungeonRunState {
	phase: DungeonPhase;
	waveIndex: number;
	turn: number;
	currentEnemyHp: number;
	currentLegionHp: number | null;
	logs: TurnLogEntry[];
	statusMessage: string;
}

export interface ActiveBattleSession {
	battleState: BattleState;
	runState: DungeonRunState;
}
