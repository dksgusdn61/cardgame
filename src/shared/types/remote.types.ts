export interface AuthTokenResponse {
	accessToken: string;
	refreshToken: string;
	tokenType: string;
	expiresInSeconds: number;
}

export interface MeResponse {
	userId: string;
	username: string;
	createdAt: string;
}

export interface RemoteUserCard {
	userCardId: string;
	cardMasterId: string;
	cardName: string;
	race: 'HUMAN' | 'ELF' | 'ORC' | 'DEMON' | 'UNDEAD';
	job: 'WARRIOR' | 'TANK' | 'ARCHER' | 'ASSASSIN' | 'MAGICIAN';
	attack: number;
	hp: number;
	attackType: 'MELEE' | 'RANGED' | 'MAGIC';
	obtainedAt: string;
	status: 'OWNED' | 'CONSUMED' | 'DELETED';
}

export interface RemoteDeckSummary {
	deckId: string;
	name: string;
	active: boolean;
	cardCount: number;
	updatedAt: string;
}

export interface RemoteDeckCard {
	userCardId: string;
	cardMasterId: string;
	cardName: string;
	race: RemoteUserCard['race'];
	job: RemoteUserCard['job'];
	attack: number;
	hp: number;
	attackType: RemoteUserCard['attackType'];
	position: number;
}

export interface RemoteDeckDetail {
	deckId: string;
	name: string;
	active: boolean;
	cards: RemoteDeckCard[];
}

export interface RemoteBattleCardView {
	userCardId: string;
	cardMasterId: string;
	cardName: string;
	race: RemoteUserCard['race'];
	job: RemoteUserCard['job'];
	attack: number;
	hp: number;
	attackType: RemoteUserCard['attackType'];
}

export interface RemoteBattleEnemyView {
	id: string;
	name: string;
	hp: number;
	attack: number;
	recovery: number;
	attackType: RemoteUserCard['attackType'];
	race: RemoteUserCard['race'];
	job: RemoteUserCard['job'];
}

export interface RemoteSelectiveRewardOffer {
	choiceType: 'DRAW_THREE' | 'PICK_TWO_FROM_FIVE' | 'RECOVER_MISSING_HP';
	pickLimit: number;
	offeredCards: RemoteBattleCardView[];
}

export interface RemoteTurnSummary {
	finalAttack: number;
	recoveryPerTurn: number;
	attackType: RemoteUserCard['attackType'];
	activatedSynergies: string[];
}

export interface RemoteBattleRunSummary {
	runId: string;
	deckId: string;
	status: 'IN_PROGRESS' | 'VICTORY' | 'DEFEAT' | 'ABANDONED';
	currentWave: number;
	currentTurn: number;
	playerHp: number;
	playerMaxHp: number;
	startedAt: string;
	endedAt: string | null;
}

export interface RemoteBattleState {
	phase:
		| 'TURN_READY'
		| 'AWAITING_WAVE_REWARD'
		| 'AWAITING_SELECTIVE_REWARD'
		| 'VICTORY'
		| 'DEFEAT'
		| 'ABANDONED';
	currentWave: number;
	currentTurn: number;
	currentEnemyHp: number;
	currentPlayerHp: number;
	currentPlayerMaxHp: number;
	enemy: RemoteBattleEnemyView;
	drawPile: RemoteBattleCardView[];
	hand: RemoteBattleCardView[];
	fieldSlots: Array<RemoteBattleCardView | null>;
	selectiveOffer: RemoteSelectiveRewardOffer | null;
	lastTurnSummary: RemoteTurnSummary | null;
}

export interface RemoteBattleRunDetail {
	run: RemoteBattleRunSummary;
	state: RemoteBattleState;
}

export interface RemoteBattleTurnLog {
	turnLogId: string;
	wave: number;
	turn: number;
	playerDamage: number;
	enemyDamage: number;
	playerRecovery: number;
	enemyRecovery: number;
	playerHpAfter: number;
	enemyHpAfter: number;
	detail: string | null;
	createdAt: string;
}

export interface RemoteResolveTurnResponse {
	run: RemoteBattleRunSummary;
	state: RemoteBattleState;
	latestTurnLog: RemoteBattleTurnLog;
}
