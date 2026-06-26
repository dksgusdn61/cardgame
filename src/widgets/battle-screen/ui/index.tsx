import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { FIELD_SLOT_COUNT } from '@/features/battle/model/battle-state.utils';
import BattleActionPanel from '@/features/battle/ui/battle-action-panel';
import useBattleSimulator from '@/features/battle/model/use-battle-simulator';
import BattleSummary from '@/features/battle/ui/battle-summary';
import CardTile from '@/features/battle/ui/card-tile';
import EnemyPanel from '@/features/battle/ui/enemy-panel';
import FieldZone from '@/features/battle/ui/field-zone';
import HandZone from '@/features/battle/ui/hand-zone';
import LegionStatusPanel from '@/features/battle/ui/legion-status-panel';
import SelectiveDrawPanel from '@/features/battle/ui/selective-draw-panel';
import TurnBanner from '@/features/battle/ui/turn-banner';
import TurnInfoPanel from '@/features/battle/ui/turn-info-panel';
import WaveRewardModal from '@/features/battle/ui/wave-reward-modal';
import styles from './style.module.scss';

const BattleScreen = () => {
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
	} = useBattleSimulator();

	return (
		<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<main className={styles.battle_layout}>
				{runState.phase === 'idle' ? (
					<section className={styles.start_panel}>
						<button type="button" onClick={handleStartGame} className={styles.start_button}>
							게임 시작
						</button>
					</section>
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
							/>
							<HandZone
								cards={battleState.hand}
								deckCount={battleState.deck.length}
								recentlyDrawnCardIds={recentlyDrawnCardIds}
								activeDragCardId={activeDragCard?.instanceId}
							/>
						</section>
					</div>
				)}
			</main>
			{runState.phase === 'wave_cleared' ? (
				<WaveRewardModal
					onDrawThree={handleNextWaveDrawThree}
					onPickTwo={handleNextWavePickTwo}
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
