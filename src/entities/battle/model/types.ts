import type { AttackType, Job, Race } from 'src/entities/card/model/types'

export type SynergyKind = 'race' | 'job'

export type SynergySummary = {
	key: Race | Job
	label: string
	kind: SynergyKind
	streak: number
	threshold: number | null
}

export type CombatPreview = {
	attackByType: Record<AttackType, number>
	dominantAttackType: AttackType
	raceSynergies: SynergySummary[]
	jobSynergies: SynergySummary[]
	legionMaxHp: number
	legionRegen: number
	outgoingDamage: number
	incomingDamage: number
	multipliers: string[]
}
