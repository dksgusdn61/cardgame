import { describe, expect, it } from 'vitest';
import { BASE_LEGION_HP } from '@/entities/battle/model/battle-balance';
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
	it('computes human and warrior streak bonuses only when job streak reaches two', () => {
		const field = [
			createCard({ instanceId: 'a', race: 'human', job: 'warrior', attack: 20, hp: 40 }),
			createCard({ instanceId: 'b', race: 'human', job: 'warrior', attack: 20, hp: 40 }),
			createCard({ instanceId: 'c', race: 'elf', job: 'archer', attack: 18, hp: 30, attackType: 'range' }),
			null,
		];
		const summary = calculateLegionSummary(field, enemyCatalog[0]);

		expect(summary.baseAttack).toBe(58);
		expect(summary.maxHp).toBe(BASE_LEGION_HP + 30);
		expect(summary.activeSynergies.map((synergy) => synergy.key)).toEqual(['human', 'warrior']);
	});

	it('applies undead recovery bonuses to legion recovery', () => {
		const field = [
			createCard({ instanceId: 'u1', race: 'undead', job: 'mage', hp: 50, attackType: 'magic' }),
			createCard({ instanceId: 'u2', race: 'undead', job: 'mage', hp: 50, attackType: 'magic' }),
			null,
		];
		const summary = calculateLegionSummary(field, enemyCatalog[0]);

		expect(summary.baseRecovery).toBe(10);
		expect(summary.recoveryPerTurn).toBe(12);
	});

	it('scales base recovery from the total hp of deployed cards', () => {
		const field = [
			createCard({ instanceId: 'h1', hp: 30 }),
			createCard({ instanceId: 'h2', hp: 40 }),
			createCard({ instanceId: 'h3', hp: 50 }),
			null,
		];
		const summary = calculateLegionSummary(field, enemyCatalog[0]);

		expect(summary.baseHp).toBe(120);
		expect(summary.baseRecovery).toBe(12);
	});

	it('uses fixed legion base hp instead of deployed card hp total', () => {
		const field = [
			createCard({ instanceId: 'fixed-1', hp: 30 }),
			createCard({ instanceId: 'fixed-2', hp: 40 }),
			null,
		];
		const summary = calculateLegionSummary(field, enemyCatalog[0]);

		expect(summary.baseHp).toBe(70);
		expect(summary.maxHp).toBe(BASE_LEGION_HP + 30);
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
