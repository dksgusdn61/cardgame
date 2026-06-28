import request from '@/shared/api/http';
import type { RemoteDeckDetail, RemoteDeckSummary } from '@/shared/types/remote.types';

export const getMyDecks = (accessToken: string) =>
	request<RemoteDeckSummary[]>('/api/me/decks', {
		method: 'GET',
		accessToken,
	});

export const getDeck = (deckId: string, accessToken: string) =>
	request<RemoteDeckDetail>(`/api/decks/${deckId}`, {
		method: 'GET',
		accessToken,
	});

export const saveDeckCards = (
	deckId: string,
	userCardIds: string[],
	accessToken: string,
) =>
	request<RemoteDeckDetail>(`/api/decks/${deckId}/cards`, {
		method: 'PUT',
		body: JSON.stringify({ userCardIds }),
		accessToken,
	});
