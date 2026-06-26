export type AttackType = 'melee' | 'range' | 'magic';

export type CardRace = 'human' | 'elf' | 'orc' | 'demon' | 'undead';

export type CardJob = 'warrior' | 'tank' | 'archer' | 'mage' | 'assassin';

export interface CardDefinition {
	id: string;
	name: string;
	race: CardRace;
	job: CardJob;
	attack: number;
	hp: number;
	attackType: AttackType;
}

export interface CardInstance extends CardDefinition {
	instanceId: string;
}
