import { describe, expect, it } from 'vitest';
import enemyCatalog from '@/entities/battle/model/enemy-catalog';
import { simulateBattle } from '@/entities/battle/model/simulate-battle';
import type { LegionSummary } from '@/entities/battle/types/battle.types';

describe('simulateBattle', () => {
	it('returns player victory when the legion out-damages the enemy', () => {
		const legion: LegionSummary = {
			deployedCards: [],
			baseAttack: 80,
			baseHp: 120,
			baseRecovery: 12,
			finalAttack: 90,
			maxHp: 140,
			recoveryPerTurn: 14,
			dominantAttackType: 'melee',
			damageReductionRate: 0,
			antiHealRate: 0,
			activeSynergies: [],
			raceStreaks: {},
			jobStreaks: {},
		};

		const result = simulateBattle(legion, enemyCatalog[0]);

		expect(result.winner).toBe('player');
		expect(result.turns).toBe(2);
		expect(result.remainingLegionHp).toBeGreaterThan(0);
	});
});
