import type { CardEntity } from 'src/entities/card/model/types'
import type { CombatPreview } from 'src/entities/battle/model/types'
import type { MonsterEntity } from 'src/entities/monster/model/types'

export type BoardSlot = CardEntity | null

export type BattleSessionState = {
	deck: CardEntity[]
	hand: CardEntity[]
	board: BoardSlot[]
	discard: CardEntity[]
	monster: MonsterEntity
	turn: number
	legionHp: number
	exchangedThisTurn: boolean
	selectedHandCardId: string | null
	logs: string[]
	lastPreview: CombatPreview | null
}
