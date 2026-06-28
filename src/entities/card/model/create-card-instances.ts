import cardCatalog from '@/entities/card/model/card-catalog';
import type { CardDefinition, CardInstance } from '@/entities/card/types/card.types';

const cardCatalogMap = new Map(cardCatalog.map((card) => [card.id, card]));

interface CardRecipeEntry {
	id: CardDefinition['id'];
	copies: number;
}

const createCardInstances = (
	recipe: CardRecipeEntry[],
	instanceKey = 'card',
): CardInstance[] => {
	return recipe.flatMap(({ id, copies }) => {
		const card = cardCatalogMap.get(id);

		if (!card) {
			throw new Error(`Unknown card id: ${id}`);
		}

		return Array.from({ length: copies }, (_, index) => ({
			...card,
			instanceId: `${instanceKey}-${card.id}-${index + 1}`,
		}));
	});
};

export default createCardInstances;
