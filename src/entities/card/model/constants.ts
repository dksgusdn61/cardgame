import type { AttackType, Job, Race } from 'src/entities/card/model/types'

export const RACE_LABEL: Record<Race, string> = {
	human: '인간',
	elf: '엘프',
	orc: '오크',
	beast: '야수',
	demon: '마족',
	undead: '언데드',
}

export const JOB_LABEL: Record<Job, string> = {
	warrior: '전사',
	tank: '탱커',
	archer: '궁수',
	mage: '마법사',
	assassin: '암살자',
}

export const ATTACK_TYPE_LABEL: Record<AttackType, string> = {
	melee: '근접',
	range: '원거리',
	magic: '마법',
}

export const ATTACK_TYPE_ORDER: AttackType[] = ['melee', 'range', 'magic']

export const RACE_TIER_THRESHOLD = [2, 4, 6]

export const JOB_TIER_THRESHOLD = [1, 3, 5]
