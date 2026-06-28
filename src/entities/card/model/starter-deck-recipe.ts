import type { CardDefinition } from '@/entities/card/types/card.types';

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

export default starterDeckRecipe;
