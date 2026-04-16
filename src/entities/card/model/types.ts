export type AttackType = 'melee' | 'range' | 'magic'

export type Race = 'human' | 'elf' | 'orc' | 'beast' | 'demon' | 'undead'

export type Job = 'warrior' | 'tank' | 'archer' | 'mage' | 'assassin'

export type CardEntity = {
	id: string
	name: string
	race: Race
	job: Job
	attack: number
	hp: number
	attackType: AttackType
}
