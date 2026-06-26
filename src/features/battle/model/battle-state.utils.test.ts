import { describe, expect, it } from 'vitest';
import type { CardInstance } from '@/entities/card/types/card.types';
import {
	FIELD_SLOT_COUNT,
	confirmSelectiveDraw,
	drawFromDeck,
	startSelectiveDraw,
	toggleSelectiveCard,
} from '@/features/battle/model/battle-state.utils';
import type { BattleState } from '@/features/battle/model/battle-state.types';

const createCard = (instanceId: string): CardInstance => ({
	id: instanceId,
	instanceId,
	name: instanceId,
	race: 'human',
	job: 'warrior',
	attack: 10,
	hp: 20,
	attackType: 'melee',
});

const createState = (): BattleState => ({
	deck: ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(createCard),
	hand: [],
	field: Array.from({ length: FIELD_SLOT_COUNT }, () => null),
	discard: [],
	enemy: {
		id: 'enemy',
		name: 'enemy',
		hp: 100,
		attack: 10,
		recovery: 0,
		attackType: 'melee',
		traits: [],
	},
});

describe('battle-state selective draw rules', () => {
	it('draws cards from the top of the deck in order', () => {
		const result = drawFromDeck(createState().deck, 4);

		expect(result.drawnCards.map((card) => card.instanceId)).toEqual(['a', 'b', 'c', 'd']);
		expect(result.remainingDeck.map((card) => card.instanceId)).toEqual(['e', 'f', 'g']);
	});

	it('returns unselected selective draw cards to the bottom of the deck in reveal order', () => {
		const started = startSelectiveDraw(createState(), 5, 2);
		const selectedFirst = toggleSelectiveCard(started, 'b');
		const selectedSecond = toggleSelectiveCard(selectedFirst, 'd');
		const confirmed = confirmSelectiveDraw(selectedSecond);

		expect(confirmed.hand.map((card) => card.instanceId)).toEqual(['b', 'd']);
		expect(confirmed.deck.map((card) => card.instanceId)).toEqual(['f', 'g', 'a', 'c', 'e']);
	});
});
