import enemyCatalog from '@/entities/battle/model/enemy-catalog';
import { calculateLegionSummary } from '@/entities/battle/model/calculate-legion-summary';
import type { CardInstance } from '@/entities/card/types/card.types';
import {
	createInitialBattleState,
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

export const hasDeployedCard = (field: Array<CardInstance | null>) => getFilledFieldCards(field).length > 0;

export const createIdleRunState = (): DungeonRunState => ({
	phase: 'idle',
	waveIndex: 0,
	turn: 1,
	currentEnemyHp: 0,
	currentLegionHp: null,
	logs: [],
	statusMessage: '게임을 시작하면 첫 번째 몬스터와 전투가 시작됩니다.',
});

export const createInitialDungeonSession = (): ActiveBattleSession => {
	const initialBattleState = createInitialBattleState();
	const drawnBattleState = drawCardsToHand(initialBattleState, 7);

	return {
		battleState: drawnBattleState,
		runState: {
			phase: 'turn_ready',
			waveIndex: 0,
			turn: 1,
			currentEnemyHp: drawnBattleState.enemy.hp,
			currentLegionHp: null,
			logs: [],
			statusMessage: '첫 웨이브입니다. 최소 1장을 필드에 배치한 뒤 턴을 진행하세요.',
		},
	};
};

export const startNextWaveWithDraw = (
	session: ActiveBattleSession,
	drawType: 'draw_three' | 'pick_two',
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
		enemy: nextEnemy,
	};
	const nextBattleState =
		drawType === 'draw_three'
			? drawCardsToHand(battleStateWithEnemy, 3)
			: startSelectiveDraw(battleStateWithEnemy, 5, 2);

	return {
		battleState: nextBattleState,
		runState: {
			...session.runState,
			phase: drawType === 'draw_three' ? 'turn_ready' : 'wave_setup',
			waveIndex: nextWaveIndex,
			turn: 1,
			currentEnemyHp: nextEnemy.hp,
			logs: [],
			statusMessage:
				drawType === 'draw_three'
					? `${nextWaveIndex + 1}번째 몬스터가 등장했습니다. 배치를 조정한 뒤 턴을 진행하세요.`
					: `${nextWaveIndex + 1}번째 몬스터 전투 준비입니다. 5장 중 2장을 고르세요.`,
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
	const enemyHpAfterAttack = Math.max(0, enemyHpAfterRecovery - legionSummary.finalAttack);

	if (enemyHpAfterAttack === 0) {
		return {
			battleState,
			runState: {
				...runState,
				phase:
					runState.waveIndex === enemyCatalog.length - 1 ? 'victory' : 'wave_cleared',
				currentEnemyHp: 0,
				currentLegionHp,
				logs: [
					{
						turn: runState.turn,
						playerDamage: legionSummary.finalAttack,
						enemyDamage: 0,
						enemyRecovery,
						legionRecovery: 0,
						enemyHpAfterTurn: 0,
						legionHpAfterTurn: currentLegionHp,
					},
					...runState.logs,
				],
				statusMessage:
					runState.waveIndex === enemyCatalog.length - 1
						? '마지막 몬스터를 쓰러뜨렸습니다. 던전 클리어입니다.'
						: `${runState.waveIndex + 1}번째 몬스터를 처치했습니다. 다음 웨이브 드로우를 선택하세요.`,
			},
		};
	}

	const incomingDamage = Math.round(
		battleState.enemy.attack * (1 - legionSummary.damageReductionRate),
	);
	const legionHpAfterEnemyAttack = Math.max(0, currentLegionHp - incomingDamage);

	if (legionHpAfterEnemyAttack === 0) {
		const defeatLog: TurnLogEntry = {
			turn: runState.turn,
			playerDamage: legionSummary.finalAttack,
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
				logs: [defeatLog, ...runState.logs],
				statusMessage: '군단의 체력이 모두 소진되었습니다. 던전 실패입니다.',
			},
		};
	}

	const legionHpAfterRecovery = Math.min(
		legionSummary.maxHp,
		legionHpAfterEnemyAttack + legionSummary.recoveryPerTurn,
	);
	const battleStateAfterDraw = drawCardsToHand(battleState, 1);
	const nextLog: TurnLogEntry = {
		turn: runState.turn,
		playerDamage: legionSummary.finalAttack,
		enemyDamage: incomingDamage,
		enemyRecovery,
		legionRecovery: legionSummary.recoveryPerTurn,
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
