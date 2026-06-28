import type { EnemyUnit } from '@/entities/battle/types/battle.types';
import enemyCatalog from '@/entities/battle/model/enemy-catalog';
import type { CardInstance } from '@/entities/card/types/card.types';
import { toCardInstance } from '@/shared/lib/remote-card';
import type {
	RemoteBattleEnemyView,
	RemoteBattleRunDetail,
	RemoteBattleState,
	RemoteBattleTurnLog,
} from '@/shared/types/remote.types';
import type { BattleState, SelectiveDrawState } from '@/features/battle/model/battle-state.types';
import type {
	ActiveBattleSession,
	DungeonRunState,
	TurnLogEntry,
} from '@/features/battle/model/dungeon-flow.types';

const mapPhase = (phase: RemoteBattleState['phase']): DungeonRunState['phase'] => {
	switch (phase) {
		case 'TURN_READY':
			return 'turn_ready';
		case 'AWAITING_WAVE_REWARD':
		case 'AWAITING_SELECTIVE_REWARD':
			return 'wave_cleared';
		case 'VICTORY':
			return 'victory';
		case 'DEFEAT':
		case 'ABANDONED':
			return 'defeat';
	}
};

const mapEnemy = (enemy: RemoteBattleEnemyView): EnemyUnit => {
	const localEnemy = enemyCatalog.find((item) => item.id === enemy.id);

	return {
		id: enemy.id,
		name: enemy.name,
		hp: enemy.hp,
		attack: enemy.attack,
		recovery: enemy.recovery,
		attackType:
			enemy.attackType === 'MELEE'
				? 'melee'
				: enemy.attackType === 'RANGED'
					? 'range'
					: 'magic',
		race:
			enemy.race === 'HUMAN'
				? 'human'
				: enemy.race === 'ELF'
					? 'elf'
					: enemy.race === 'ORC'
						? 'orc'
						: enemy.race === 'DEMON'
							? 'demon'
							: 'undead',
		job:
			enemy.job === 'WARRIOR'
				? 'warrior'
				: enemy.job === 'TANK'
					? 'tank'
					: enemy.job === 'ARCHER'
						? 'archer'
						: enemy.job === 'ASSASSIN'
							? 'assassin'
							: 'mage',
		traits: localEnemy?.traits ?? [],
	};
};

const mapSelectiveDraw = (
	selectiveOffer: RemoteBattleState['selectiveOffer'],
	selectedIds: string[],
): SelectiveDrawState | undefined => {
	if (!selectiveOffer) {
		return undefined;
	}

	return {
		cards: selectiveOffer.offeredCards.map(toCardInstance),
		selectedIds,
		pickLimit: selectiveOffer.pickLimit,
	};
};

const mapTurnLog = (turnLog: RemoteBattleTurnLog): TurnLogEntry => ({
	turn: turnLog.turn,
	playerDamage: turnLog.playerDamage,
	enemyDamage: turnLog.enemyDamage,
	enemyRecovery: turnLog.enemyRecovery,
	legionRecovery: turnLog.playerRecovery,
	enemyHpAfterTurn: turnLog.enemyHpAfter,
	legionHpAfterTurn: turnLog.playerHpAfter,
});

export const toBattleState = (
	state: RemoteBattleState,
	selectedOfferIds: string[],
): BattleState => ({
	deck: state.drawPile.map(toCardInstance),
	hand: state.hand.map(toCardInstance),
	field: state.fieldSlots.map((card) => (card ? toCardInstance(card) : null)),
	discard: [],
	enemy: mapEnemy(state.enemy),
	selectiveDraw: mapSelectiveDraw(state.selectiveOffer, selectedOfferIds),
});

export const toRunState = (
	state: RemoteBattleState,
	logs: TurnLogEntry[],
): DungeonRunState => ({
	phase: mapPhase(state.phase),
	waveIndex: Math.max(0, state.currentWave - 1),
	turn: state.currentTurn,
	currentEnemyHp: state.currentEnemyHp,
	currentLegionHp: state.currentPlayerHp,
	currentLegionMaxHp: state.currentPlayerMaxHp,
	logs,
	statusMessage:
		state.phase === 'AWAITING_SELECTIVE_REWARD'
			? `${state.currentWave}번째 몬스터 전투 준비입니다. 5장 중 2장을 고르세요.`
			: state.phase === 'AWAITING_WAVE_REWARD'
				? `${state.currentWave}번째 몬스터를 처치했습니다. 다음 웨이브 보상을 선택하세요.`
				: state.phase === 'VICTORY'
					? '모든 몬스터를 처치했습니다. 던전 클리어입니다.'
					: state.phase === 'DEFEAT'
						? '군단이 전멸했습니다.'
						: '배치를 조정한 뒤 턴을 진행하세요.',
});

export const toActiveBattleSession = (
	response: RemoteBattleRunDetail,
	selectedOfferIds: string[],
	logs: TurnLogEntry[],
): ActiveBattleSession => ({
	battleState: toBattleState(response.state, selectedOfferIds),
	runState: toRunState(response.state, logs),
});

export const toLatestTurnLog = (turnLog: RemoteBattleTurnLog) => mapTurnLog(turnLog);

export const getFieldUserCardIds = (field: Array<CardInstance | null>) =>
	field.map((card) => card?.instanceId ?? null);
