import createStarterDeck from '@/entities/card/model/create-starter-deck';
import { getWaveScaledEnemy } from '@/entities/battle/model/battle-balance';
import enemyCatalog from '@/entities/battle/model/enemy-catalog';
import type { CardInstance } from '@/entities/card/types/card.types';
import type { BattleState, SelectiveDrawState } from '@/features/battle/model/battle-state.types';

export const FIELD_SLOT_COUNT = 12;
export const getUnlockedFieldSlotCount = (waveNumber: number) =>
	Math.min(FIELD_SLOT_COUNT, Math.max(6, 5 + waveNumber));
export const isLockedFieldSlot = (index: number, unlockedSlotCount: number) => index >= unlockedSlotCount;

export const createEmptyField = () => Array.from({ length: FIELD_SLOT_COUNT }, () => null as CardInstance | null);

export const drawFromDeck = (deck: CardInstance[], count: number) => ({
	drawnCards: deck.slice(0, count),
	remainingDeck: deck.slice(count),
});

export const createInitialBattleState = (): BattleState => ({
	deck: createStarterDeck(),
	hand: [],
	field: createEmptyField(),
	discard: [],
	enemy: getWaveScaledEnemy(enemyCatalog[0], 1),
});

export const createInitialBattleStateFromDeck = (deck: CardInstance[]): BattleState => ({
	deck,
	hand: [],
	field: createEmptyField(),
	discard: [],
	enemy: getWaveScaledEnemy(enemyCatalog[0], 1),
});

export const drawCardsToHand = (state: BattleState, count: number): BattleState => {
	if (state.selectiveDraw) {
		return state;
	}

	const { drawnCards, remainingDeck } = drawFromDeck(state.deck, count);

	return {
		...state,
		deck: remainingDeck,
		hand: [...state.hand, ...drawnCards],
	};
};

export const startSelectiveDraw = (state: BattleState, offerCount: number, pickLimit: number): BattleState => {
	if (state.selectiveDraw) {
		return state;
	}

	const { drawnCards, remainingDeck } = drawFromDeck(state.deck, offerCount);

	const selectiveDraw: SelectiveDrawState = {
		cards: drawnCards,
		selectedIds: [],
		pickLimit,
	};

	return {
		...state,
		deck: remainingDeck,
		selectiveDraw,
	};
};

export const toggleSelectiveCard = (state: BattleState, cardId: string): BattleState => {
	if (!state.selectiveDraw) {
		return state;
	}

	const isSelected = state.selectiveDraw.selectedIds.includes(cardId);
	const selectedIds = isSelected
		? state.selectiveDraw.selectedIds.filter((selectedId) => selectedId !== cardId)
		: state.selectiveDraw.selectedIds.length < state.selectiveDraw.pickLimit
			? [...state.selectiveDraw.selectedIds, cardId]
			: state.selectiveDraw.selectedIds;

	return {
		...state,
		selectiveDraw: {
			...state.selectiveDraw,
			selectedIds,
		},
	};
};

export const confirmSelectiveDraw = (state: BattleState): BattleState => {
	if (!state.selectiveDraw || state.selectiveDraw.selectedIds.length !== state.selectiveDraw.pickLimit) {
		return state;
	}

	const selectedCards = state.selectiveDraw.cards.filter((card) =>
		state.selectiveDraw?.selectedIds.includes(card.instanceId),
	);
	const unselectedCards = state.selectiveDraw.cards.filter(
		(card) => !state.selectiveDraw?.selectedIds.includes(card.instanceId),
	);

	return {
		...state,
		deck: [...state.deck, ...unselectedCards],
		hand: [...state.hand, ...selectedCards],
		selectiveDraw: undefined,
	};
};

export const cancelSelectiveDraw = (state: BattleState): BattleState => {
	if (!state.selectiveDraw) {
		return state;
	}

	return {
		...state,
		deck: [...state.deck, ...state.selectiveDraw.cards],
		selectiveDraw: undefined,
	};
};

export const moveCardBetweenZones = (
	state: BattleState,
	cardId: string,
	sourceZone: 'hand' | 'field',
	targetZone: 'hand' | 'field',
	targetIndex?: number,
	unlockedSlotCount = FIELD_SLOT_COUNT,
): BattleState => {
	if (sourceZone === targetZone && sourceZone === 'field' && typeof targetIndex === 'number') {
		const sourceIndex = state.field.findIndex((card) => card?.instanceId === cardId);

		if (
			sourceIndex === -1 ||
			sourceIndex === targetIndex ||
			isLockedFieldSlot(targetIndex, unlockedSlotCount)
		) {
			return state;
		}

		const nextField = [...state.field];
		const sourceCard = nextField[sourceIndex];
		const targetCard = nextField[targetIndex];

		nextField[sourceIndex] = targetCard;
		nextField[targetIndex] = sourceCard;

		return {
			...state,
			field: nextField,
		};
	}

	if (sourceZone === 'hand' && targetZone === 'field' && typeof targetIndex === 'number') {
		const handIndex = state.hand.findIndex((card) => card.instanceId === cardId);

		if (
			handIndex === -1 ||
			state.field[targetIndex] ||
			isLockedFieldSlot(targetIndex, unlockedSlotCount)
		) {
			return state;
		}

		const nextHand = [...state.hand];
		const [movedCard] = nextHand.splice(handIndex, 1);
		const nextField = [...state.field];
		nextField[targetIndex] = movedCard;

		return {
			...state,
			hand: nextHand,
			field: nextField,
		};
	}

	if (sourceZone === 'field' && targetZone === 'hand') {
		const fieldIndex = state.field.findIndex((card) => card?.instanceId === cardId);

		if (fieldIndex === -1) {
			return state;
		}

		const nextField = [...state.field];
		const movedCard = nextField[fieldIndex];
		nextField[fieldIndex] = null;

		return movedCard
			? {
					...state,
					hand: [...state.hand, movedCard],
					field: nextField,
				}
			: state;
	}

	return state;
};
