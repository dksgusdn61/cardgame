import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { FIELD_SLOT_COUNT } from '@/features/battle/model/battle-state.utils';
import BattleActionPanel from '@/features/battle/ui/battle-action-panel';
import useAuthSession from '@/features/auth/model/auth-session-context';
import AuthPanel from '@/features/auth/ui/auth-panel';
import useBattleSimulator from '@/features/battle/model/use-battle-simulator';
import useActiveDeck from '@/features/battle/model/use-active-deck';
import BattleSummary from '@/features/battle/ui/battle-summary';
import CardTile from '@/features/battle/ui/card-tile';
import EnemyPanel from '@/features/battle/ui/enemy-panel';
import FieldZone from '@/features/battle/ui/field-zone';
import HandZone from '@/features/battle/ui/hand-zone';
import MainMenu from '@/features/home/ui/main-menu';
import LegionStatusPanel from '@/features/battle/ui/legion-status-panel';
import SelectiveDrawPanel from '@/features/battle/ui/selective-draw-panel';
import TurnBanner from '@/features/battle/ui/turn-banner';
import TurnInfoPanel from '@/features/battle/ui/turn-info-panel';
import WaveRewardModal from '@/features/battle/ui/wave-reward-modal';
import styles from './style.module.scss';

const BattleScreen = () => {
	const { accessToken, isLoading: isAuthLoading } = useAuthSession();
	const { activeDeckId, deckCards, isLoading: isDeckLoading, message: deckMessage } = useActiveDeck();
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const {
		activeDragCard,
		battleState,
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
	} = useBattleSimulator(deckCards, activeDeckId);

	return (
		<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<main className={styles.battle_layout}>
				{!accessToken ? (
					isAuthLoading ? (
						<section className={styles.start_panel}>불러오는 중...</section>
					) : (
						<AuthPanel />
					)
				) : runState.phase === 'idle' ? (
					isDeckLoading ? (
						<section className={styles.start_panel}>덱 불러오는 중...</section>
					) : deckCards ? (
						<>
							{deckMessage ? <p className={styles.deck_message}>{deckMessage}</p> : null}
							<MainMenu
								canStartGame={deckCards.length === 40}
								onStartGame={handleStartGame}
								statusMessage={
									deckCards.length === 40
										? runState.statusMessage
										: `현재 덱 카드 수: ${deckCards.length}장 / 전투 시작에는 40장이 필요합니다.`
								}
							/>
						</>
					) : (
						<section className={styles.start_panel}>
							<p>{deckMessage ?? '활성 덱이 없습니다. 덱 편성부터 해주세요.'}</p>
						</section>
					)
				) : (
					<div className={styles.battle_workspace}>
						<aside className={styles.battle_sidebar}>
							<div className={styles.sidebar_top}>
								<BattleSummary legionSummary={legionSummary} />
								<TurnInfoPanel
									turn={runState.turn}
									unlockedSlotCount={unlockedSlotCount}
									totalSlotCount={FIELD_SLOT_COUNT}
								/>
							</div>
							<div className={styles.sidebar_bottom}>
								<BattleActionPanel
									runState={runState}
									canResolveTurn={legionSummary.deployedCards.length > 0}
									hasPendingSelectiveDraw={Boolean(battleState.selectiveDraw)}
									isTurnResolving={isTurnResolving}
									onStartGame={handleStartGame}
									onResolveTurn={handleResolveTurn}
									onReset={handleReset}
								/>
							</div>
						</aside>
						<section className={styles.battle_board}>
							<div
								className={`${styles.enemy_wrap} ${
									combatAnimation === 'player_attack' ? styles.is_enemy_hit : ''
								}`}
							>
								<EnemyPanel
									selectedEnemy={battleState.enemy}
									waveNumber={currentWaveNumber}
									currentEnemyHp={runState.currentEnemyHp}
								/>
							</div>
							<div
								className={`${styles.legion_status_wrap} ${
									combatAnimation === 'enemy_attack' ? styles.is_legion_hit : ''
								}`}
							>
								<LegionStatusPanel runState={runState} legionSummary={legionSummary} />
							</div>
							<SelectiveDrawPanel
								selectiveDraw={battleState.selectiveDraw}
								onToggleCard={handleToggleSelectiveCard}
								onConfirm={handleConfirmSelectiveDraw}
								onCancel={handleCancelSelectiveDraw}
							/>
							<FieldZone
								field={battleState.field}
								unlockedSlotCount={unlockedSlotCount}
								activeDragCardId={activeDragCard?.instanceId}
								isInteractionLocked={Boolean(battleState.selectiveDraw)}
							/>
							<HandZone
								cards={battleState.hand}
								deckCount={battleState.deck.length}
								recentlyDrawnCardIds={recentlyDrawnCardIds}
								activeDragCardId={activeDragCard?.instanceId}
								isInteractionLocked={Boolean(battleState.selectiveDraw)}
							/>
						</section>
					</div>
				)}
			</main>
			{runState.phase === 'wave_cleared' && !battleState.selectiveDraw ? (
				<WaveRewardModal
					currentLegionHp={runState.currentLegionHp}
					currentLegionMaxHp={runState.currentLegionMaxHp}
					onDrawThree={handleNextWaveDrawThree}
					onPickTwo={handleNextWavePickTwo}
					onRecoverMissingHp={handleNextWaveRecoverMissingHp}
				/>
			) : null}
			{turnBannerTurn !== null ? <TurnBanner turn={turnBannerTurn} /> : null}
			<DragOverlay>
				{activeDragCard ? (
					<div className={styles.drag_overlay_card}>
						<CardTile card={activeDragCard} zone="hand" isDraggable={false} />
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
};

export default BattleScreen;
