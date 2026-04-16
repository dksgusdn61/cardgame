import { useMemo, useState } from 'react'
import { INITIAL_LEGION_HP } from 'src/entities/battle/model/constants'
import { getBattlePreview, getPlacementLimit } from 'src/entities/battle/model/calculation'
import type { CombatPreview } from 'src/entities/battle/model/types'
import starterDeck from 'src/entities/card/model/mock'
import type { CardEntity } from 'src/entities/card/model/types'
import { getMonsterGrowthValue } from 'src/entities/monster/model/growth'
import initialMonster from 'src/entities/monster/model/mock'
import type { MonsterEntity } from 'src/entities/monster/model/types'
import type { DragPayload } from 'src/features/card-drag-drop/model/types'
import type { BattleSessionState, BoardSlot } from 'src/features/battle-session/model/types'

const drawCards = (deck: CardEntity[], count: number) => ({
	drawnCards: deck.slice(0, count),
	nextDeck: deck.slice(count),
})

const getBoardCards = (board: BoardSlot[]) => board.filter((card): card is CardEntity => card !== null)

const createInitialState = (): BattleSessionState => {
	const { drawnCards, nextDeck } = drawCards(starterDeck, 7)

	return {
		deck: nextDeck,
		hand: drawnCards,
		board: Array.from({ length: 12 }, () => null),
		discard: [],
		monster: { ...initialMonster },
		turn: 1,
		legionHp: INITIAL_LEGION_HP,
		exchangedThisTurn: false,
		selectedHandCardId: null,
		logs: ['전투 시작. 첫 턴에는 카드 7장을 들고 시작합니다.'],
		lastPreview: null,
	}
}

const growMonster = (monster: MonsterEntity, completedTurns: number) => {
	const currentGrowth = getMonsterGrowthValue(completedTurns)
	const nextGrowth = getMonsterGrowthValue(completedTurns + 1)
	const growthDelta = Math.max(0, nextGrowth - currentGrowth)

	if (growthDelta === 0) {
		return monster
	}

	const hpDelta = growthDelta * 10

	return {
		...monster,
		maxHp: monster.maxHp + hpDelta,
		hp: Math.min(monster.maxHp + hpDelta, monster.hp + hpDelta),
		attack: monster.attack + growthDelta,
	}
}

const prependLogs = (currentLogs: string[], nextEntries: string[]) => [...nextEntries, ...currentLogs].slice(0, 14)

const useBattleSession = () => {
	const [state, setState] = useState(createInitialState)

	const preview = useMemo(
		() => getBattlePreview(getBoardCards(state.board), state.monster, state.legionHp),
		[state.board, state.monster, state.legionHp],
	)

	const placementLimit = getPlacementLimit(state.turn)
	const isBattleFinished = state.monster.hp <= 0 || state.legionHp <= 0

	const resetBattle = () => {
		setState(createInitialState())
	}

	const selectHandCard = (cardId: string) => {
		setState((currentState) => ({
			...currentState,
			selectedHandCardId: currentState.selectedHandCardId === cardId ? null : cardId,
		}))
	}

	const placeCard = (payload: DragPayload, slotIndex: number) => {
		setState((currentState) => {
			if (slotIndex >= getPlacementLimit(currentState.turn) || currentState.monster.hp <= 0) {
				return currentState
			}

			const nextBoard = [...currentState.board]

			if (payload.source === 'hand') {
				if (currentState.exchangedThisTurn || nextBoard[slotIndex] !== null) {
					return currentState
				}

				const nextHand = [...currentState.hand]
				const [selectedCard] = nextHand.splice(payload.index, 1)
				if (!selectedCard) {
					return currentState
				}

				nextBoard[slotIndex] = selectedCard

				return {
					...currentState,
					board: nextBoard,
					hand: nextHand,
					selectedHandCardId:
						currentState.selectedHandCardId === selectedCard.id ? null : currentState.selectedHandCardId,
				}
			}

			const sourceCard = nextBoard[payload.index]
			if (!sourceCard) {
				return currentState
			}

			const targetCard = nextBoard[slotIndex]
			nextBoard[slotIndex] = sourceCard
			nextBoard[payload.index] = targetCard

			return {
				...currentState,
				board: nextBoard,
			}
		})
	}

	const returnCardToHand = (payload: DragPayload) => {
		if (payload.source !== 'board') {
			return
		}

		setState((currentState) => {
			const nextBoard = [...currentState.board]
			const card = nextBoard[payload.index]

			if (!card) {
				return currentState
			}

			nextBoard[payload.index] = null

			return {
				...currentState,
				board: nextBoard,
				hand: [...currentState.hand, card],
			}
		})
	}

	const exchangeSelectedCard = () => {
		setState((currentState) => {
			if (currentState.turn < 2 || currentState.selectedHandCardId === null || currentState.exchangedThisTurn) {
				return currentState
			}

			const selectedIndex = currentState.hand.findIndex((card) => card.id === currentState.selectedHandCardId)
			if (selectedIndex === -1) {
				return currentState
			}

			const nextHand = [...currentState.hand]
			const [discardedCard] = nextHand.splice(selectedIndex, 1)

			if (!discardedCard) {
				return currentState
			}

			const { drawnCards, nextDeck } = drawCards(currentState.deck, 1)

			return {
				...currentState,
				deck: nextDeck,
				hand: drawnCards[0] ? [...nextHand, drawnCards[0]] : nextHand,
				discard: [discardedCard, ...currentState.discard],
				exchangedThisTurn: true,
				selectedHandCardId: null,
				logs: prependLogs(
					currentState.logs,
					[
						`${discardedCard.name} 교체`,
						drawnCards[0] ? `${drawnCards[0].name} 획득` : '덱이 비어 카드를 더 뽑지 못했습니다.',
					],
				),
			}
		})
	}

	const prepareBattle = () => {
		setState((currentState) => {
			const boardCards = getBoardCards(currentState.board)

			if (boardCards.length === 0 || currentState.monster.hp <= 0 || currentState.legionHp <= 0) {
				return {
					...currentState,
					logs:
						boardCards.length === 0
							? prependLogs(currentState.logs, ['최소 한 장은 필드에 배치해야 합니다.'])
							: currentState.logs,
				}
			}

			const currentPreview = getBattlePreview(boardCards, currentState.monster, currentState.legionHp)
			const nextMonsterHp = Math.max(0, currentState.monster.hp - currentPreview.outgoingDamage)
			const attackedMonster = {
				...currentState.monster,
				hp: nextMonsterHp,
			}

			if (nextMonsterHp <= 0) {
				return {
					...currentState,
					monster: attackedMonster,
					lastPreview: currentPreview,
					logs: prependLogs(currentState.logs, [
						`${currentState.turn}턴 공격 ${currentPreview.outgoingDamage} 피해`,
						'몬스터 격파. 웨이브 시스템은 다음 단계에서 연결합니다.',
					]),
				}
			}

			const damagedLegionHp = Math.max(0, currentState.legionHp - currentPreview.incomingDamage)
			const healedLegionHp = Math.min(currentPreview.legionMaxHp, damagedLegionHp + currentPreview.legionRegen)
			const { drawnCards, nextDeck } = drawCards(currentState.deck, 3)
			const nextTurn = currentState.turn + 1

			const nextLogs = [
				`${currentState.turn}턴 공격 ${currentPreview.outgoingDamage} 피해`,
				`몬스터 반격 ${currentPreview.incomingDamage} 피해`,
				`턴 종료 회복 ${currentPreview.legionRegen}`,
				`${nextTurn}턴 시작. 카드 ${drawnCards.length}장 드로우`,
			]

			if (currentPreview.multipliers.length > 0) {
				nextLogs.unshift(`보정 ${currentPreview.multipliers.join(', ')}`)
			}

			return {
				...currentState,
				turn: nextTurn,
				deck: nextDeck,
				hand: [...currentState.hand, ...drawnCards],
				monster: growMonster(attackedMonster, currentState.turn),
				legionHp: healedLegionHp,
				exchangedThisTurn: false,
				lastPreview: currentPreview,
				logs: prependLogs(currentState.logs, nextLogs),
			}
		})
	}

	return {
		state,
		preview,
		placementLimit,
		isBattleFinished,
		selectHandCard,
		placeCard,
		returnCardToHand,
		exchangeSelectedCard,
		prepareBattle,
		resetBattle,
	}
}

export default useBattleSession
