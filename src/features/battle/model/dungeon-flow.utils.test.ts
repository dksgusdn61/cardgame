import { describe, expect, it } from 'vitest';
import type { CardInstance } from '@/entities/card/types/card.types';
import {
	createIdleRunState,
	createInitialDungeonSession,
	finalizeSelectiveWaveSetup,
	resolveDungeonTurn,
	startNextWaveWithDraw,
} from '@/features/battle/model/dungeon-flow.utils';

const createCard = (instanceId: string, attack = 30, hp = 40): CardInstance => ({
	id: instanceId,
	instanceId,
	name: instanceId,
	race: 'human',
	job: 'warrior',
	attack,
	hp,
	attackType: 'melee',
});

describe('dungeon flow utils', () => {
	it('starts a dungeon by drawing 7 cards from the deck', () => {
		const session = createInitialDungeonSession();

		expect(session.runState.phase).toBe('turn_ready');
		expect(session.runState.waveIndex).toBe(0);
		expect(session.battleState.hand).toHaveLength(7);
	});

	it('does not resolve a turn when no card is deployed', () => {
		const session = createInitialDungeonSession();
		const resolved = resolveDungeonTurn(session);

		expect(resolved.runState.turn).toBe(1);
		expect(resolved.runState.statusMessage).toContain('필드에 최소 1장');
	});

	it('moves to next wave with a three-card draw after wave clear', () => {
		const session = createInitialDungeonSession();
		const waveClearedSession = {
			battleState: session.battleState,
			runState: {
				...createIdleRunState(),
				phase: 'wave_cleared' as const,
				waveIndex: 0,
				turn: 2,
				currentEnemyHp: 0,
				currentLegionHp: 70,
				logs: [],
				statusMessage: '',
			},
		};
		const nextWaveSession = startNextWaveWithDraw(waveClearedSession, 'draw_three');

		expect(nextWaveSession.runState.waveIndex).toBe(1);
		expect(nextWaveSession.runState.phase).toBe('turn_ready');
		expect(nextWaveSession.battleState.hand.length).toBe(session.battleState.hand.length + 3);
	});

	it('requires selective wave setup to be finalized before turns continue', () => {
		const session = createInitialDungeonSession();
		const waveClearedSession = {
			battleState: session.battleState,
			runState: {
				...createIdleRunState(),
				phase: 'wave_cleared' as const,
				waveIndex: 0,
				turn: 2,
				currentEnemyHp: 0,
				currentLegionHp: 70,
				logs: [],
				statusMessage: '',
			},
		};
		const nextWaveSession = startNextWaveWithDraw(waveClearedSession, 'pick_two');
		const readySession = finalizeSelectiveWaveSetup(nextWaveSession);

		expect(nextWaveSession.runState.phase).toBe('wave_setup');
		expect(readySession.runState.phase).toBe('turn_ready');
	});

	it('resolves one turn and draws one card when the enemy survives', () => {
		const session = createInitialDungeonSession();
		const nextSession = {
			battleState: {
				...session.battleState,
				hand: [createCard('hand-card')],
				field: [createCard('field-card', 10, 30), ...Array.from({ length: 11 }, () => null)],
			},
			runState: session.runState,
		};
		const resolved = resolveDungeonTurn(nextSession);

		expect(resolved.runState.turn).toBe(2);
		expect(resolved.runState.currentEnemyHp).toBeGreaterThan(0);
		expect(resolved.battleState.hand.length).toBe(2);
		expect(resolved.runState.logs).toHaveLength(1);
	});
});
