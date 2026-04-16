import type { MonsterEntity } from 'src/entities/monster/model/types'

const initialMonster: MonsterEntity = {
	id: 'monster-shadow-lich',
	name: '흑염의 리치',
	race: 'undead',
	job: 'mage',
	attackType: 'magic',
	maxHp: 420,
	hp: 420,
	attack: 38,
}

export default initialMonster
