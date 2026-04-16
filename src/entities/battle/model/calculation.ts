import {
	ATTACK_TYPE_LABEL,
	ATTACK_TYPE_ORDER,
	JOB_LABEL,
	JOB_TIER_THRESHOLD,
	RACE_LABEL,
	RACE_TIER_THRESHOLD,
} from 'src/entities/card/model/constants'
import type { AttackType, CardEntity, Job, Race } from 'src/entities/card/model/types'
import { INITIAL_LEGION_HP } from 'src/entities/battle/model/constants'
import type { CombatPreview, SynergyKind, SynergySummary } from 'src/entities/battle/model/types'
import type { MonsterEntity } from 'src/entities/monster/model/types'

const ATTACK_COUNTER: Record<AttackType, AttackType> = {
	melee: 'range',
	range: 'magic',
	magic: 'melee',
}

const RACE_BONUS = {
	human: [40, 90, 170],
	elf: [0.12, 0.26, 0.42],
	orc: [0.12, 0.26, 0.42],
	beast: [5, 10, 18],
	demon: [0.12, 0.28, 0.42],
	undead: [8, 18, 34],
} satisfies Record<Race, number[]>

const JOB_BONUS = {
	warrior: [0.12, 0.22, 0.32],
	tank: [30, 65, 110],
	archer: [0.12, 0.22, 0.32],
	mage: [0.12, 0.22, 0.32],
	assassin: [0.1, 0.2, 0.35],
} satisfies Record<Job, number[]>

const getThresholds = (kind: SynergyKind) =>
	kind === 'race' ? RACE_TIER_THRESHOLD : JOB_TIER_THRESHOLD

const getLabel = (kind: SynergyKind, key: Race | Job) =>
	kind === 'race' ? RACE_LABEL[key as Race] : JOB_LABEL[key as Job]

const getLongestStreak = <T extends string>(items: T[], target: T) => {
	let current = 0
	let best = 0

	for (const item of items) {
		if (item === target) {
			current += 1
			best = Math.max(best, current)
			continue
		}

		current = 0
	}

	return best
}

const getThreshold = (streak: number, thresholds: number[]) =>
	thresholds.reduce<number | null>((active, threshold) => {
		if (streak >= threshold) {
			return threshold
		}

		return active
	}, null)

const getTierIndex = (streak: number, thresholds: number[]) =>
	thresholds.findLastIndex((threshold) => streak >= threshold)

const summarizeSynergy = (cards: CardEntity[], kind: SynergyKind) => {
	const keys = kind === 'race' ? Object.keys(RACE_LABEL) : Object.keys(JOB_LABEL)
	const values = cards.map((card) => card[kind])

	return keys
		.map((key) => {
			const typedKey = key as Race | Job
			const streak = getLongestStreak(values, typedKey)

			return {
				key: typedKey,
				label: getLabel(kind, typedKey),
				kind,
				streak,
				threshold: getThreshold(streak, getThresholds(kind)),
			} satisfies SynergySummary
		})
		.filter((synergy) => synergy.streak > 0)
		.sort((left, right) => right.streak - left.streak)
}

const getRaceBonus = (race: Race, streak: number) => {
	const index = getTierIndex(streak, RACE_TIER_THRESHOLD)
	return index === -1 ? 0 : RACE_BONUS[race][index]
}

const getJobBonus = (job: Job, streak: number) => {
	const index = getTierIndex(streak, JOB_TIER_THRESHOLD)
	return index === -1 ? 0 : JOB_BONUS[job][index]
}

export const getPlacementLimit = (turn: number) => Math.min(12, 3 + (turn - 1) * 2)

export const getBattlePreview = (
	boardCards: CardEntity[],
	monster: MonsterEntity,
	currentLegionHp: number,
) => {
	const raceSynergies = summarizeSynergy(boardCards, 'race')
	const jobSynergies = summarizeSynergy(boardCards, 'job')
	const attackByType: Record<AttackType, number> = { melee: 0, range: 0, magic: 0 }

	boardCards.forEach((card) => {
		attackByType[card.attackType] += card.attack
	})

	let legionMaxHp = INITIAL_LEGION_HP
	let legionRegen = Math.floor(boardCards.reduce((total, card) => total + card.hp, 0) / 10)

	const humanStreak = raceSynergies.find((synergy) => synergy.key === 'human')?.streak ?? 0
	const undeadStreak = raceSynergies.find((synergy) => synergy.key === 'undead')?.streak ?? 0
	const beastStreak = raceSynergies.find((synergy) => synergy.key === 'beast')?.streak ?? 0
	const warriorStreak = jobSynergies.find((synergy) => synergy.key === 'warrior')?.streak ?? 0
	const tankStreak = jobSynergies.find((synergy) => synergy.key === 'tank')?.streak ?? 0
	const archerStreak = jobSynergies.find((synergy) => synergy.key === 'archer')?.streak ?? 0
	const mageStreak = jobSynergies.find((synergy) => synergy.key === 'mage')?.streak ?? 0

	legionMaxHp += getRaceBonus('human', humanStreak)
	legionRegen += getRaceBonus('undead', undeadStreak)

	const tankBonus = getJobBonus('tank', tankStreak)
	legionMaxHp += tankBonus
	legionRegen += Math.floor(tankBonus * 0.3)

	if (beastStreak > 0) {
		const beastBonus = getRaceBonus('beast', beastStreak)
		boardCards.forEach((card) => {
			attackByType[card.attackType] += beastBonus
		})
		legionRegen += beastBonus
	}

	if (raceSynergies.find((synergy) => synergy.key === 'elf')?.threshold) {
		attackByType.range = Math.round(
			attackByType.range * (1 + getRaceBonus('elf', raceSynergies.find((synergy) => synergy.key === 'elf')?.streak ?? 0)),
		)
	}

	if (raceSynergies.find((synergy) => synergy.key === 'orc')?.threshold) {
		attackByType.melee = Math.round(
			attackByType.melee * (1 + getRaceBonus('orc', raceSynergies.find((synergy) => synergy.key === 'orc')?.streak ?? 0)),
		)
	}

	if (raceSynergies.find((synergy) => synergy.key === 'demon')?.threshold) {
		attackByType.magic = Math.round(
			attackByType.magic *
				(1 + getRaceBonus('demon', raceSynergies.find((synergy) => synergy.key === 'demon')?.streak ?? 0)),
		)
	}

	attackByType.melee = Math.round(attackByType.melee * (1 + getJobBonus('warrior', warriorStreak)))
	attackByType.range = Math.round(attackByType.range * (1 + getJobBonus('archer', archerStreak)))
	attackByType.magic = Math.round(attackByType.magic * (1 + getJobBonus('mage', mageStreak)))

	const dominantAttackType = ATTACK_TYPE_ORDER.reduce((bestType, currentType) => {
		if (attackByType[currentType] > attackByType[bestType]) {
			return currentType
		}

		return bestType
	}, 'melee' as AttackType)

	let outgoingDamage = attackByType[dominantAttackType]
	const multipliers: string[] = []

	if (ATTACK_COUNTER[dominantAttackType] === monster.attackType) {
		outgoingDamage = Math.round(outgoingDamage * 1.25)
		multipliers.push(`${ATTACK_TYPE_LABEL[dominantAttackType]} 상성 +25%`)
	}

	const demonStreak = raceSynergies.find((synergy) => synergy.key === 'demon')?.streak ?? 0
	if (monster.race === 'undead' && demonStreak >= 6) {
		outgoingDamage = Math.round(outgoingDamage * 1.4)
		multipliers.push('마족 6시너지 vs 언데드 +40%')
	}

	const assassinStreak = jobSynergies.find((synergy) => synergy.key === 'assassin')?.streak ?? 0
	if (assassinStreak > 0 && (monster.job === 'archer' || monster.job === 'mage')) {
		outgoingDamage = Math.round(outgoingDamage * (1 + getJobBonus('assassin', assassinStreak)))
		multipliers.push(`암살자 ${getThreshold(assassinStreak, JOB_TIER_THRESHOLD)}단계 추격`)
	}

	return {
		attackByType,
		dominantAttackType,
		raceSynergies,
		jobSynergies,
		legionMaxHp: Math.max(legionMaxHp, currentLegionHp),
		legionRegen,
		outgoingDamage,
		incomingDamage: monster.attack,
		multipliers,
	} satisfies CombatPreview
}
