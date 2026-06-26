import cardCatalog from '@/entities/card/model/card-catalog';
import type { CardDefinition, CardInstance } from '@/entities/card/types/card.types';
import { shuffle } from '@/shared/lib/shuffle';

const starterDeckRecipe: Array<{ id: CardDefinition['id']; copies: number }> = [
	{ id: 'vanguard-captain', copies: 3 },
	{ id: 'sanctum-guard', copies: 2 },
	{ id: 'longbow-scout', copies: 3 },
	{ id: 'windrunner', copies: 2 },
	{ id: 'pit-bruiser', copies: 3 },
	{ id: 'ironhide', copies: 2 },
	{ id: 'ember-adept', copies: 3 },
	{ id: 'night-hexer', copies: 2 },
	{ id: 'grave-binder', copies: 3 },
	{ id: 'bone-ranger', copies: 2 },
];

const cardCatalogMap = new Map(cardCatalog.map((card) => [card.id, card]));

const createCardInstance = (card: CardDefinition, index: number): CardInstance => ({
	...card,
	instanceId: `${card.id}-${index}`,
});

const createStarterDeck = () => {
	const deck = starterDeckRecipe.flatMap(({ id, copies }) => {
		const card = cardCatalogMap.get(id);

		if (!card) {
			throw new Error(`Unknown starter card id: ${id}`);
		}

		return Array.from({ length: copies }, (_, index) => createCardInstance(card, index + 1));
	});

	return shuffle(deck);
};

export default createStarterDeck;
