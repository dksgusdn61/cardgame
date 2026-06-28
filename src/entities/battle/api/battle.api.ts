import request from '@/shared/api/http';
import type {
	RemoteBattleRunDetail,
	RemoteBattleRunSummary,
	RemoteResolveTurnResponse,
} from '@/shared/types/remote.types';

export const startBattleRun = (
	payload: { deckId: string; dungeonId: string },
	accessToken: string,
) =>
	request<RemoteBattleRunDetail>('/api/battle-runs', {
		method: 'POST',
		body: JSON.stringify(payload),
		accessToken,
	});

export const resolveBattleTurn = (
	runId: string,
	payload: { fieldUserCardIds: Array<string | null> },
	accessToken: string,
) =>
	request<RemoteResolveTurnResponse>(`/api/battle-runs/${runId}/resolve-turn`, {
		method: 'POST',
		body: JSON.stringify(payload),
		accessToken,
	});

export const selectWaveReward = (
	runId: string,
	payload: {
		choiceType: 'DRAW_THREE' | 'PICK_TWO_FROM_FIVE' | 'RECOVER_MISSING_HP';
		selectedUserCardIds?: string[];
	},
	accessToken: string,
) =>
	request<RemoteBattleRunDetail>(`/api/battle-runs/${runId}/wave-reward`, {
		method: 'POST',
		body: JSON.stringify(payload),
		accessToken,
	});

export const abandonBattleRun = (runId: string, accessToken: string) =>
	request<RemoteBattleRunSummary>(`/api/battle-runs/${runId}/abandon`, {
		method: 'POST',
		accessToken,
	});
