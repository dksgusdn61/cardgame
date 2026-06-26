import type { CardJob, CardRace } from '@/entities/card/types/card.types';

export const raceColorMap: Record<CardRace, string> = {
	human: '#f2a65a',
	elf: '#7dafab',
	orc: '#8dcf6f',
	demon: '#f07f7b',
	undead: '#8a98b9',
};

export const jobColorMap: Record<CardJob, string> = {
	warrior: '#dd7068',
	tank: '#5ca7dd',
	archer: '#53bf87',
	mage: '#8570ef',
	assassin: '#4d4d57',
};
