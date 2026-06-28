import { useState } from 'react';
import createCardInstances from '@/entities/card/model/create-card-instances';
import cardCatalog from '@/entities/card/model/card-catalog';
import starterDeckRecipe from '@/entities/card/model/starter-deck-recipe';
import type { CardInstance } from '@/entities/card/types/card.types';

interface DeckBuilderState {
	deck: CardInstance[];
	ownedCards: CardInstance[];
}

const createInitialDeckBuilderState = (): DeckBuilderState => {
	const deck = createCardInstances(starterDeckRecipe, 'deck');
	const ownedCards = createCardInstances(
		cardCatalog.map((card) => ({
			id: card.id,
			copies: 2,
		})),
		'owned',
	);

	return {
		deck,
		ownedCards,
	};
};

const moveCard = (cards: CardInstance[], cardId: string) => {
	const cardIndex = cards.findIndex((card) => card.instanceId === cardId);

	if (cardIndex < 0) {
		return null;
	}

	return {
		card: cards[cardIndex],
		remainingCards: cards.filter((card) => card.instanceId !== cardId),
	};
};

const useDeckBuilder = () => {
	const [deckBuilderState, setDeckBuilderState] = useState<DeckBuilderState>(
		createInitialDeckBuilderState,
	);

	const handleAddCardToDeck = (cardId: string) => {
		setDeckBuilderState((previousState) => {
			const result = moveCard(previousState.ownedCards, cardId);

			if (!result) {
				return previousState;
			}

			return {
				deck: [...previousState.deck, result.card],
				ownedCards: result.remainingCards,
			};
		});
	};

	const handleRemoveCardFromDeck = (cardId: string) => {
		setDeckBuilderState((previousState) => {
			const result = moveCard(previousState.deck, cardId);

			if (!result) {
				return previousState;
			}

			return {
				deck: result.remainingCards,
				ownedCards: [...previousState.ownedCards, result.card],
			};
		});
	};

	return {
		deck: deckBuilderState.deck,
		ownedCards: deckBuilderState.ownedCards,
		handleAddCardToDeck,
		handleRemoveCardFromDeck,
	};
};

export default useDeckBuilder;
