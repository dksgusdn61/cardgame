import {
	getWaveScaledEnemy,
} from '@/entities/battle/model/battle-balance';
import {
	getEffectiveEnemyAttack,
	getEffectiveLegionRecovery,
	getEffectivePlayerDamage,
} from '@/entities/battle/model/enemy-effects';
import enemyCatalog from '@/entities/battle/model/enemy-catalog';
import { calculateLegionSummary } from '@/entities/battle/model/calculate-legion-summary';
import type { CardInstance } from '@/entities/card/types/card.types';
import {
	createInitialBattleState,
	createInitialBattleStateFromDeck,
	drawCardsToHand,
	startSelectiveDraw,
} from '@/features/battle/model/battle-state.utils';
import type {
	ActiveBattleSession,
	DungeonRunState,
	TurnLogEntry,
} from '@/features/battle/model/dungeon-flow.types';

const getFilledFieldCards = (field: Array<CardInstance | null>) =>
	field.filter((card): card is CardInstance => card !== null);

const WAVE_CLEAR_FIXED_RECOVERY = 30;
const WAVE_CLEAR_MISSING_HP_RECOVERY_RATE = 0.35;

export const hasDeployedCard = (field: Array<CardInstance | null>) => getFilledFieldCards(field).length > 0;

export const createIdleRunState = (): DungeonRunState => ({
	phase: 'idle',
	waveIndex: 0,
	turn: 1,
	currentEnemyHp: 0,
	currentLegionHp: null,
	currentLegionMaxHp: null,
	logs: [],
	statusMessage: '게임을 시작하면 첫 번째 몬스터와 전투가 시작됩니다.',
});

export const createInitialDungeonSession = (deck?: CardInstance[]): ActiveBattleSession => {
	const initialBattleState = deck
		? createInitialBattleStateFromDeck(deck)
		: createInitialBattleState();
	const drawnBattleState = drawCardsToHand(initialBattleState, 4);

	return {
		battleState: drawnBattleState,
		runState: {
			phase: 'turn_ready',
			waveIndex: 0,
			turn: 1,
			currentEnemyHp: drawnBattleState.enemy.hp,
			currentLegionHp: null,
			currentLegionMaxHp: null,
			logs: [],
			statusMessage: '첫 웨이브입니다. 최소 1장을 필드에 배치한 뒤 턴을 진행하세요.',
		},
	};
};

export const startNextWaveWithDraw = (
	session: ActiveBattleSession,
	drawType: 'draw_three' | 'pick_two' | 'recover_missing_hp',
): ActiveBattleSession => {
	const nextWaveIndex = session.runState.waveIndex + 1;
	const nextEnemy = enemyCatalog[nextWaveIndex];

	if (!nextEnemy) {
		return {
			...session,
			runState: {
				...session.runState,
				phase: 'victory',
				statusMessage: '모든 몬스터를 처치했습니다. 던전 클리어입니다.',
			},
		};
	}

	const battleStateWithEnemy = {
		...session.battleState,
		enemy: getWaveScaledEnemy(nextEnemy, nextWaveIndex + 1),
	};
	const nextBattleState =
		drawType === 'draw_three'
			? drawCardsToHand(battleStateWithEnemy, 3)
			: drawType === 'pick_two'
				? startSelectiveDraw(battleStateWithEnemy, 5, 2)
				: battleStateWithEnemy;
	const recoveredLegionHp =
		drawType === 'recover_missing_hp'
			? Math.min(
					session.runState.currentLegionMaxHp ?? session.runState.currentLegionHp ?? 0,
					(session.runState.currentLegionHp ?? 0) +
						Math.round(
							((session.runState.currentLegionMaxHp ?? session.runState.currentLegionHp ?? 0) -
								(session.runState.currentLegionHp ?? 0)) *
								WAVE_CLEAR_MISSING_HP_RECOVERY_RATE,
						),
				)
			: session.runState.currentLegionHp;

	return {
		battleState: nextBattleState,
		runState: {
			...session.runState,
			phase:
				drawType === 'pick_two'
					? 'wave_setup'
					: 'turn_ready',
			waveIndex: nextWaveIndex,
			turn: 1,
			currentEnemyHp: getWaveScaledEnemy(nextEnemy, nextWaveIndex + 1).hp,
			currentLegionHp: recoveredLegionHp,
			logs: [],
			statusMessage:
				drawType === 'draw_three'
					? `${nextWaveIndex + 1}번째 몬스터가 등장했습니다. 배치를 조정한 뒤 턴을 진행하세요.`
					: drawType === 'pick_two'
						? `${nextWaveIndex + 1}번째 몬스터 전투 준비입니다. 5장 중 2장을 고르세요.`
						: `${nextWaveIndex + 1}번째 몬스터 전투 준비입니다. 잃은 체력의 35%를 회복했습니다.`,
		},
	};
};

export const finalizeSelectiveWaveSetup = (session: ActiveBattleSession): ActiveBattleSession => ({
	...session,
	runState: {
		...session.runState,
		phase: 'turn_ready',
		statusMessage: `${session.runState.waveIndex + 1}번째 몬스터 전투를 시작할 수 있습니다.`,
	},
});

export const resolveDungeonTurnWithoutDraw = (session: ActiveBattleSession): ActiveBattleSession => {
	const { battleState, runState } = session;
	const deployedCards = getFilledFieldCards(battleState.field);

	if (deployedCards.length === 0) {
		return {
			...session,
			runState: {
				...runState,
				statusMessage: '턴을 진행하려면 필드에 최소 1장의 카드가 있어야 합니다.',
			},
		};
	}

	const legionSummary = calculateLegionSummary(battleState.field, battleState.enemy);
	const currentLegionHp = Math.min(
		runState.currentLegionHp ?? legionSummary.maxHp,
		legionSummary.maxHp,
	);
	const enemyRecovery = Math.round(battleState.enemy.recovery * (1 - legionSummary.antiHealRate));
	const enemyHpAfterRecovery = Math.min(battleState.enemy.hp, runState.currentEnemyHp + enemyRecovery);
	const playerDamage = getEffectivePlayerDamage(battleState.enemy, runState.turn, legionSummary);
	const enemyHpAfterAttack = Math.max(0, enemyHpAfterRecovery - playerDamage);
	const legionHpAfterWaveClearRecovery = Math.min(
		legionSummary.maxHp,
		currentLegionHp + WAVE_CLEAR_FIXED_RECOVERY,
	);

	if (enemyHpAfterAttack === 0) {
		return {
			battleState,
			runState: {
				...runState,
				phase:
					runState.waveIndex === enemyCatalog.length - 1 ? 'victory' : 'wave_cleared',
				currentEnemyHp: 0,
				currentLegionHp:
					runState.waveIndex === enemyCatalog.length - 1
						? currentLegionHp
						: legionHpAfterWaveClearRecovery,
				currentLegionMaxHp: legionSummary.maxHp,
				logs: [
					{
						turn: runState.turn,
						playerDamage,
						enemyDamage: 0,
						enemyRecovery,
						legionRecovery:
							runState.waveIndex === enemyCatalog.length - 1
								? 0
								: legionHpAfterWaveClearRecovery - currentLegionHp,
						enemyHpAfterTurn: 0,
						legionHpAfterTurn:
							runState.waveIndex === enemyCatalog.length - 1
								? currentLegionHp
								: legionHpAfterWaveClearRecovery,
					},
					...runState.logs,
				],
				statusMessage:
					runState.waveIndex === enemyCatalog.length - 1
						? '마지막 몬스터를 쓰러뜨렸습니다. 던전 클리어입니다.'
						: `${runState.waveIndex + 1}번째 몬스터를 처치했습니다. 30 회복 후 다음 웨이브 보상을 선택하세요.`,
			},
		};
	}

	const incomingAttack = getEffectiveEnemyAttack(battleState.enemy, runState.turn, legionSummary);
	const incomingDamage = Math.round(incomingAttack * (1 - legionSummary.damageReductionRate));
	const legionHpAfterEnemyAttack = Math.max(0, currentLegionHp - incomingDamage);

	if (legionHpAfterEnemyAttack === 0) {
		const defeatLog: TurnLogEntry = {
			turn: runState.turn,
			playerDamage,
			enemyDamage: incomingDamage,
			enemyRecovery,
			legionRecovery: 0,
			enemyHpAfterTurn: enemyHpAfterAttack,
			legionHpAfterTurn: 0,
		};

		return {
			battleState,
			runState: {
				...runState,
				phase: 'defeat',
				currentEnemyHp: enemyHpAfterAttack,
				currentLegionHp: 0,
				currentLegionMaxHp: legionSummary.maxHp,
				logs: [defeatLog, ...runState.logs],
				statusMessage: '군단의 체력이 모두 소진되었습니다. 던전 실패입니다.',
			},
		};
	}

	const legionRecovery = getEffectiveLegionRecovery(battleState.enemy, legionSummary);
	const legionHpAfterRecovery = Math.min(
		legionSummary.maxHp,
		legionHpAfterEnemyAttack + legionRecovery,
	);
	const nextLog: TurnLogEntry = {
		turn: runState.turn,
		playerDamage,
		enemyDamage: incomingDamage,
		enemyRecovery,
		legionRecovery,
		enemyHpAfterTurn: enemyHpAfterAttack,
		legionHpAfterTurn: legionHpAfterRecovery,
	};

	return {
		battleState,
		runState: {
			...runState,
			phase: 'turn_ready',
			turn: runState.turn + 1,
			currentEnemyHp: enemyHpAfterAttack,
			currentLegionHp: legionHpAfterRecovery,
			currentLegionMaxHp: legionSummary.maxHp,
			logs: [nextLog, ...runState.logs],
			statusMessage: `${runState.turn}턴이 종료되었습니다.`,
		},
	};
};

export const applyTurnDraw = (session: ActiveBattleSession, drawCount: number): ActiveBattleSession => ({
	...session,
	battleState: drawCardsToHand(session.battleState, drawCount),
	runState: {
		...session.runState,
		statusMessage: `${session.runState.turn}턴 시작. 덱 위에서 카드 ${drawCount}장을 드로우했습니다.`,
	},
});

export const resolveDungeonTurn = (session: ActiveBattleSession): ActiveBattleSession => {
	const resolvedSession = resolveDungeonTurnWithoutDraw(session);

	return resolvedSession.runState.turn === session.runState.turn
		? resolvedSession
		: applyTurnDraw(resolvedSession, 1);
};
