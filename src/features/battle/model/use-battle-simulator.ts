import { useEffect, useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { calculateLegionSummary } from '@/entities/battle/model/calculate-legion-summary';
import {
	abandonBattleRun,
	resolveBattleTurn,
	selectWaveReward,
	startBattleRun,
} from '@/entities/battle/api/battle.api';
import type { CardInstance } from '@/entities/card/types/card.types';
import useAuthSession from '@/features/auth/model/auth-session-context';
import {
	getFieldUserCardIds,
	toActiveBattleSession,
	toLatestTurnLog,
} from '@/features/battle/model/battle-remote.mapper';
import { FIELD_SLOT_COUNT, getUnlockedFieldSlotCount, moveCardBetweenZones } from '@/features/battle/model/battle-state.utils';
import { createIdleRunState } from '@/features/battle/model/dungeon-flow.utils';
import type { ActiveBattleSession } from '@/features/battle/model/dungeon-flow.types';

const ATTACK_ANIMATION_MS = 380;
const COUNTER_ANIMATION_MS = 420;
const TURN_BANNER_MS = 900;

const createEmptySession = (enemy: ActiveBattleSession['battleState']['enemy']): ActiveBattleSession => ({
	battleState: {
		deck: [],
		hand: [],
		field: Array.from({ length: FIELD_SLOT_COUNT }, () => null),
		discard: [],
		enemy,
	},
	runState: createIdleRunState(),
});

const useBattleSimulator = (
	remoteDeck?: CardInstance[] | null,
	activeDeckId?: string | null,
) => {
	const { accessToken } = useAuthSession();
	const fallbackEnemy = {
		id: 'starved-zombie',
		name: '굶주린 좀비',
		hp: 140,
		attack: 26,
		recovery: 0,
		attackType: 'melee' as const,
		race: 'undead' as const,
		job: 'warrior' as const,
		traits: [],
	};
	const [session, setSession] = useState<ActiveBattleSession>(() => createEmptySession(fallbackEnemy));
	const [runId, setRunId] = useState<string | null>(null);
	const [recentlyDrawnCardIds, setRecentlyDrawnCardIds] = useState<string[]>([]);
	const [activeDragCard, setActiveDragCard] = useState<CardInstance | null>(null);
	const [turnBannerTurn, setTurnBannerTurn] = useState<number | null>(null);
	const [combatAnimation, setCombatAnimation] = useState<'player_attack' | 'enemy_attack' | null>(null);
	const [isTurnResolving, setIsTurnResolving] = useState(false);
	const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);

	const battleState = session.battleState;
	const runState = session.runState;
	const legionSummary = calculateLegionSummary(battleState.field, battleState.enemy);
	const currentWaveNumber = runState.waveIndex + 1;
	const unlockedSlotCount = getUnlockedFieldSlotCount(currentWaveNumber);

	useEffect(() => {
		if (recentlyDrawnCardIds.length === 0) {
			return;
		}

		const timeout = window.setTimeout(() => {
			setRecentlyDrawnCardIds([]);
		}, 900);

		return () => window.clearTimeout(timeout);
	}, [recentlyDrawnCardIds]);

	useEffect(() => {
		if (!accessToken) {
			setRunId(null);
			setSelectedOfferIds([]);
			setRecentlyDrawnCardIds([]);
			setSession(createEmptySession(fallbackEnemy));
		}
	}, [accessToken]);

	const setStatusMessage = (message: string) => {
		setSession((currentSession) => ({
			...currentSession,
			runState: {
				...currentSession.runState,
				statusMessage: message,
			},
		}));
	};

	const pushRecentHandDiff = (previousSession: ActiveBattleSession, nextSession: ActiveBattleSession) => {
		const nextIds = nextSession.battleState.hand
			.filter(
				(card) =>
					!previousSession.battleState.hand.some(
						(previousCard) => previousCard.instanceId === card.instanceId,
					),
			)
			.map((card) => card.instanceId);

		if (nextIds.length > 0) {
			setRecentlyDrawnCardIds(nextIds);
		}
	};

	const syncRemoteSession = (
		response: Parameters<typeof toActiveBattleSession>[0],
		logs = session.runState.logs,
		nextSelectedOfferIds: string[] = [],
	) => {
		const nextSession = toActiveBattleSession(response, nextSelectedOfferIds, logs);
		setSelectedOfferIds(nextSelectedOfferIds);
		setSession(nextSession);
		return nextSession;
	};

	const handleStartGame = async () => {
		if (!accessToken || !activeDeckId) {
			setStatusMessage('활성 덱이 없어 전투를 시작할 수 없습니다.');
			return;
		}

		setIsTurnResolving(true);

		try {
			const response = await startBattleRun(
				{
					deckId: activeDeckId,
					dungeonId: 'default-dungeon',
				},
				accessToken,
			);
			setRunId(response.run.runId);
			const nextSession = syncRemoteSession(response, []);
			setRecentlyDrawnCardIds(nextSession.battleState.hand.map((card) => card.instanceId));
			setActiveDragCard(null);
			setCombatAnimation(null);
			setTurnBannerTurn(null);
		} catch (error) {
			setStatusMessage(error instanceof Error ? error.message : '전투를 시작하지 못했습니다.');
		} finally {
			setIsTurnResolving(false);
		}
	};

	const handleToggleSelectiveCard = (cardId: string) => {
		setSelectedOfferIds((currentSelectedOfferIds) => {
			const pickLimit = battleState.selectiveDraw?.pickLimit ?? 0;
			const isSelected = currentSelectedOfferIds.includes(cardId);

			if (isSelected) {
				return currentSelectedOfferIds.filter((selectedId) => selectedId !== cardId);
			}

			if (currentSelectedOfferIds.length >= pickLimit) {
				return currentSelectedOfferIds;
			}

			return [...currentSelectedOfferIds, cardId];
		});
	};

	const handleConfirmSelectiveDraw = async () => {
		if (!accessToken || !runId || selectedOfferIds.length !== (battleState.selectiveDraw?.pickLimit ?? 0)) {
			return;
		}

		try {
			const previousSession = session;
			const response = await selectWaveReward(
				runId,
				{
					choiceType: 'PICK_TWO_FROM_FIVE',
					selectedUserCardIds: selectedOfferIds,
				},
				accessToken,
			);
			const nextSession = syncRemoteSession(response, previousSession.runState.logs, []);
			pushRecentHandDiff(previousSession, nextSession);
		} catch (error) {
			setStatusMessage(error instanceof Error ? error.message : '선택 드로우를 반영하지 못했습니다.');
		}
	};

	const handleCancelSelectiveDraw = () => {
		setSelectedOfferIds([]);
	};

	const handleReset = async () => {
		if (accessToken && runId && runState.phase !== 'idle' && runState.phase !== 'victory' && runState.phase !== 'defeat') {
			try {
				await abandonBattleRun(runId, accessToken);
			} catch {
				// ignore abandon failures during local reset
			}
		}

		setRunId(null);
		setSelectedOfferIds([]);
		setRecentlyDrawnCardIds([]);
		setActiveDragCard(null);
		setCombatAnimation(null);
		setTurnBannerTurn(null);
		setSession(createEmptySession(battleState.enemy));
	};

	const handleResolveTurn = async () => {
		if (isTurnResolving || !accessToken || !runId) {
			return;
		}

		if (battleState.field.every((card) => card === null)) {
			setStatusMessage('턴을 진행하려면 필드에 최소 1장의 카드가 있어야 합니다.');
			return;
		}

		setIsTurnResolving(true);
		setCombatAnimation('player_attack');

		try {
			const response = await resolveBattleTurn(
				runId,
				{
					fieldUserCardIds: getFieldUserCardIds(battleState.field),
				},
				accessToken,
			);
			const previousSession = session;
			const nextLogs = [toLatestTurnLog(response.latestTurnLog), ...previousSession.runState.logs];

			window.setTimeout(() => {
				const nextSession = syncRemoteSession(response, nextLogs, []);

				if (
					nextSession.runState.phase === 'wave_cleared' ||
					nextSession.runState.phase === 'victory' ||
					nextSession.runState.phase === 'defeat'
				) {
					setCombatAnimation(null);
					setIsTurnResolving(false);
					return;
				}

				setCombatAnimation('enemy_attack');

				window.setTimeout(() => {
					setCombatAnimation(null);
					setTurnBannerTurn(nextSession.runState.turn);
					pushRecentHandDiff(previousSession, nextSession);

					window.setTimeout(() => {
						setTurnBannerTurn(null);
						setIsTurnResolving(false);
					}, TURN_BANNER_MS);
				}, COUNTER_ANIMATION_MS);
			}, ATTACK_ANIMATION_MS);
		} catch (error) {
			setCombatAnimation(null);
			setIsTurnResolving(false);
			setStatusMessage(error instanceof Error ? error.message : '턴을 진행하지 못했습니다.');
		}
	};

	const handleNextWaveDrawThree = async () => {
		if (!accessToken || !runId) {
			return;
		}

		try {
			const previousSession = session;
			const response = await selectWaveReward(
				runId,
				{
					choiceType: 'DRAW_THREE',
				},
				accessToken,
			);
			const nextSession = syncRemoteSession(response, [], []);
			pushRecentHandDiff(previousSession, nextSession);
			setTurnBannerTurn(nextSession.runState.turn);
			window.setTimeout(() => setTurnBannerTurn(null), TURN_BANNER_MS);
		} catch (error) {
			setStatusMessage(error instanceof Error ? error.message : '3장 드로우를 처리하지 못했습니다.');
		}
	};

	const handleNextWavePickTwo = async () => {
		if (!accessToken || !runId) {
			return;
		}

		try {
			const response = await selectWaveReward(
				runId,
				{
					choiceType: 'PICK_TWO_FROM_FIVE',
				},
				accessToken,
			);
			syncRemoteSession(response, [], []);
		} catch (error) {
			setStatusMessage(error instanceof Error ? error.message : '선택 드로우를 시작하지 못했습니다.');
		}
	};

	const handleNextWaveRecoverMissingHp = async () => {
		if (!accessToken || !runId) {
			return;
		}

		try {
			const response = await selectWaveReward(
				runId,
				{
					choiceType: 'RECOVER_MISSING_HP',
				},
				accessToken,
			);
			syncRemoteSession(response, [], []);
			setTurnBannerTurn(response.state.currentTurn);
			window.setTimeout(() => setTurnBannerTurn(null), TURN_BANNER_MS);
		} catch (error) {
			setStatusMessage(error instanceof Error ? error.message : '체력 회복 보상을 처리하지 못했습니다.');
		}
	};

	const handleDragStart = (event: DragStartEvent) => {
		const cardId = event.active.id as string;
		const draggedCard =
			battleState.hand.find((card) => card.instanceId === cardId) ??
			battleState.field.find((card) => card?.instanceId === cardId) ??
			null;

		setActiveDragCard(draggedCard);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const sourceZone = event.active.data.current?.zone as 'hand' | 'field' | undefined;
		const targetZone = event.over?.data.current?.zone as 'hand' | 'field' | undefined;
		const targetIndex = event.over?.data.current?.index as number | undefined;
		const cardId = event.active.id as string;

		if (!sourceZone || !targetZone) {
			setActiveDragCard(null);
			return;
		}

		setSession((currentSession) => ({
			...currentSession,
			battleState: moveCardBetweenZones(
				currentSession.battleState,
				cardId,
				sourceZone,
				targetZone,
				targetIndex,
				unlockedSlotCount,
			),
		}));
		setActiveDragCard(null);
	};

	return {
		activeDragCard,
		battleState: {
			...battleState,
			selectiveDraw: battleState.selectiveDraw
				? {
						...battleState.selectiveDraw,
						selectedIds: selectedOfferIds,
					}
				: undefined,
		},
		combatAnimation,
		currentWaveNumber,
		handleCancelSelectiveDraw,
		handleConfirmSelectiveDraw,
		handleDragStart,
		handleDragEnd,
		handleNextWaveDrawThree,
		handleNextWavePickTwo,
		handleNextWaveRecoverMissingHp,
		handleResolveTurn,
		handleReset,
		handleStartGame,
		handleToggleSelectiveCard,
		isTurnResolving,
		legionSummary,
		recentlyDrawnCardIds,
		runState,
		turnBannerTurn,
		unlockedSlotCount,
	};
};

export default useBattleSimulator;
