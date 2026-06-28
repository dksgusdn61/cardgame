import createCardInstances from '@/entities/card/model/create-card-instances';
import starterDeckRecipe from '@/entities/card/model/starter-deck-recipe';
import type { CardInstance } from '@/entities/card/types/card.types';
import { shuffle } from '@/shared/lib/shuffle';

const createStarterDeck = () => {
	const deck: CardInstance[] = createCardInstances(starterDeckRecipe, 'starter');
	return shuffle(deck);
};

export default createStarterDeck;
