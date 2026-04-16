import type { AttackType, Job, Race } from 'src/entities/card/model/types'

export type MonsterEntity = {
	id: string
	name: string
	race: Race
	job: Job
	attackType: AttackType
	maxHp: number
	hp: number
	attack: number
}
