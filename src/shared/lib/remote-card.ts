import type { CardInstance } from '@/entities/card/types/card.types';
import type { RemoteBattleCardView, RemoteDeckCard, RemoteUserCard } from '@/shared/types/remote.types';

const mapRace = (race: RemoteUserCard['race']): CardInstance['race'] => {
	switch (race) {
		case 'HUMAN':
			return 'human';
		case 'ELF':
			return 'elf';
		case 'ORC':
			return 'orc';
		case 'DEMON':
			return 'demon';
		case 'UNDEAD':
			return 'undead';
	}
};

const mapJob = (job: RemoteUserCard['job']): CardInstance['job'] => {
	switch (job) {
		case 'WARRIOR':
			return 'warrior';
		case 'TANK':
			return 'tank';
		case 'ARCHER':
			return 'archer';
		case 'ASSASSIN':
			return 'assassin';
		case 'MAGICIAN':
			return 'mage';
	}
};

const mapAttackType = (attackType: RemoteUserCard['attackType']): CardInstance['attackType'] => {
	switch (attackType) {
		case 'MELEE':
			return 'melee';
		case 'RANGED':
			return 'range';
		case 'MAGIC':
			return 'magic';
	}
};

export const toCardInstance = (
	card: RemoteUserCard | RemoteDeckCard | RemoteBattleCardView,
): CardInstance => ({
	id: card.cardMasterId,
	instanceId: card.userCardId,
	name: card.cardName,
	race: mapRace(card.race),
	job: mapJob(card.job),
	attack: card.attack,
	hp: card.hp,
	attackType: mapAttackType(card.attackType),
});
