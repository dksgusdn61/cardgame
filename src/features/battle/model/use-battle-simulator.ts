import { useEffect, useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { calculateLegionSummary } from '@/entities/battle/model/calculate-legion-summary';
import { simulateBattle } from '@/entities/battle/model/simulate-battle';
import type { CardInstance } from '@/entities/card/types/card.types';
import {
	cancelSelectiveDraw,
	confirmSelectiveDraw,
	createInitialBattleState,
	getUnlockedFieldSlotCount,
	moveCardBetweenZones,
	toggleSelectiveCard,
} from '@/features/battle/model/battle-state.utils';
import {
	applyTurnDraw,
	createIdleRunState,
	createInitialDungeonSession,
	finalizeSelectiveWaveSetup,
	resolveDungeonTurnWithoutDraw,
	startNextWaveWithDraw,
} from '@/features/battle/model/dungeon-flow.utils';
import type { ActiveBattleSession } from '@/features/battle/model/dungeon-flow.types';

const ATTACK_ANIMATION_MS = 380;
const COUNTER_ANIMATION_MS = 420;
const TURN_BANNER_MS = 900;

const useBattleSimulator = () => {
	const [session, setSession] = useState<ActiveBattleSession>({
		battleState: createInitialBattleState(),
		runState: createIdleRunState(),
	});
	const [recentlyDrawnCardIds, setRecentlyDrawnCardIds] = useState<string[]>([]);
	const [activeDragCard, setActiveDragCard] = useState<CardInstance | null>(null);
	const [turnBannerTurn, setTurnBannerTurn] = useState<number | null>(null);
	const [combatAnimation, setCombatAnimation] = useState<'player_attack' | 'enemy_attack' | null>(null);
	const [isTurnResolving, setIsTurnResolving] = useState(false);

	const battleState = session.battleState;
	const runState = session.runState;
	const legionSummary = calculateLegionSummary(battleState.field, battleState.enemy);
	const battlePreview = simulateBattle(legionSummary, battleState.enemy);
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

	const handleStartGame = () => {
		const nextSession = createInitialDungeonSession();
		setSession(nextSession);
		setRecentlyDrawnCardIds(nextSession.battleState.hand.map((card) => card.instanceId));
		setActiveDragCard(null);
	};

	const handleToggleSelectiveCard = (cardId: string) => {
		setSession((currentSession) => ({
			...currentSession,
			battleState: toggleSelectiveCard(currentSession.battleState, cardId),
		}));
	};

	const handleConfirmSelectiveDraw = () => {
		setSession((currentSession) => {
			const nextBattleState = confirmSelectiveDraw(currentSession.battleState);
			const nextSession = finalizeSelectiveWaveSetup({
				...currentSession,
				battleState: nextBattleState,
			});
			pushRecentHandDiff(currentSession, nextSession);
			return nextSession;
		});
	};

	const handleCancelSelectiveDraw = () => {
		setSession((currentSession) => ({
			...currentSession,
			battleState: cancelSelectiveDraw(currentSession.battleState),
			runState: {
				...currentSession.runState,
				phase: 'turn_ready',
				statusMessage: `${currentSession.runState.waveIndex + 1}번째 몬스터 전투를 시작할 수 있습니다.`,
			},
		}));
	};

	const handleReset = () => {
		setSession({
			battleState: createInitialBattleState(),
			runState: createIdleRunState(),
		});
		setRecentlyDrawnCardIds([]);
		setActiveDragCard(null);
	};

	const handleResolveTurn = () => {
		if (isTurnResolving) {
			return;
		}

		const currentSession = session;
		if (currentSession.battleState.field.every((card) => card === null)) {
			const nextSession = resolveDungeonTurnWithoutDraw(currentSession);
			setSession(nextSession);
			return;
		}

		setIsTurnResolving(true);
		setCombatAnimation('player_attack');

		window.setTimeout(() => {
			const afterPlayerAttack = resolveDungeonTurnWithoutDraw(currentSession);
			setSession(afterPlayerAttack);

			if (
				afterPlayerAttack.runState.phase === 'wave_cleared' ||
				afterPlayerAttack.runState.phase === 'victory' ||
				afterPlayerAttack.runState.phase === 'defeat'
			) {
				setCombatAnimation(null);
				setIsTurnResolving(false);
				return;
			}

			setCombatAnimation('enemy_attack');

			window.setTimeout(() => {
				setCombatAnimation(null);
				setTurnBannerTurn(afterPlayerAttack.runState.turn);

				window.setTimeout(() => {
					const drawnSession = applyTurnDraw(afterPlayerAttack, 1);
					setSession(drawnSession);
					pushRecentHandDiff(afterPlayerAttack, drawnSession);
					setTurnBannerTurn(null);
					setIsTurnResolving(false);
				}, TURN_BANNER_MS);
			}, COUNTER_ANIMATION_MS);
		}, ATTACK_ANIMATION_MS);
	};

	const handleNextWaveDrawThree = () => {
		setSession((currentSession) => {
			const nextSession = startNextWaveWithDraw(currentSession, 'draw_three');
			pushRecentHandDiff(currentSession, nextSession);
			return nextSession;
		});
	};

	const handleNextWavePickTwo = () => {
		setSession((currentSession) => startNextWaveWithDraw(currentSession, 'pick_two'));
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
		battleState,
		battlePreview,
		currentWaveNumber,
		legionSummary,
		combatAnimation,
		isTurnResolving,
		recentlyDrawnCardIds,
		runState,
		turnBannerTurn,
		unlockedSlotCount,
		handleCancelSelectiveDraw,
		handleConfirmSelectiveDraw,
		handleDragStart,
		handleDragEnd,
		handleNextWaveDrawThree,
		handleNextWavePickTwo,
		handleResolveTurn,
		handleReset,
		handleStartGame,
		handleToggleSelectiveCard,
	};
};

export default useBattleSimulator;
