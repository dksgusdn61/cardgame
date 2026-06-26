import { describe, expect, it } from 'vitest';
import { calculateLegionSummary } from '@/entities/battle/model/calculate-legion-summary';
import enemyCatalog from '@/entities/battle/model/enemy-catalog';
import type { CardInstance } from '@/entities/card/types/card.types';

const createCard = (overrides: Partial<CardInstance>): CardInstance => ({
	id: 'test-card',
	instanceId: crypto.randomUUID(),
	name: '테스트 카드',
	race: 'human',
	job: 'warrior',
	attack: 20,
	hp: 40,
	attackType: 'melee',
	...overrides,
});

describe('calculateLegionSummary', () => {
	it('computes human and warrior streak bonuses from contiguous cards', () => {
		const field = [
			createCard({ instanceId: 'a', race: 'human', job: 'warrior', attack: 20, hp: 40 }),
			createCard({ instanceId: 'b', race: 'human', job: 'warrior', attack: 20, hp: 40 }),
			createCard({ instanceId: 'c', race: 'elf', job: 'archer', attack: 18, hp: 30, attackType: 'range' }),
			null,
		];
		const summary = calculateLegionSummary(field, enemyCatalog[0]);

		expect(summary.baseAttack).toBe(58);
		expect(summary.maxHp).toBe(170);
		expect(summary.activeSynergies.map((synergy) => synergy.key)).toEqual(['human', 'warrior', 'archer']);
	});

	it('applies undead recovery bonuses to legion recovery', () => {
		const field = [
			createCard({ instanceId: 'u1', race: 'undead', job: 'mage', hp: 50, attackType: 'magic' }),
			createCard({ instanceId: 'u2', race: 'undead', job: 'mage', hp: 50, attackType: 'magic' }),
			null,
		];
		const summary = calculateLegionSummary(field, enemyCatalog[0]);

		expect(summary.baseRecovery).toBe(10);
		expect(summary.recoveryPerTurn).toBe(14);
	});

	it('breaks attack type ties by total attack among tied card groups', () => {
		const field = [
			createCard({ instanceId: 'm1', attackType: 'melee', attack: 14 }),
			createCard({ instanceId: 'm2', attackType: 'melee', attack: 13 }),
			createCard({ instanceId: 'r1', attackType: 'range', attack: 20, race: 'elf', job: 'archer' }),
			createCard({ instanceId: 'r2', attackType: 'range', attack: 19, race: 'elf', job: 'archer' }),
		];
		const summary = calculateLegionSummary(field, enemyCatalog[0]);

		expect(summary.dominantAttackType).toBe('range');
	});
});
