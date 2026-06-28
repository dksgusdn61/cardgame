import { useEffect, useMemo, useState } from 'react';
import { getMyCards } from '@/entities/user/api/user.api';
import { getDeck, getMyDecks, saveDeckCards } from '@/entities/deck/api/deck.api';
import useAuthSession from '@/features/auth/model/auth-session-context';
import { toCardInstance } from '@/shared/lib/remote-card';
import type { CardInstance } from '@/entities/card/types/card.types';
import type { RemoteDeckDetail, RemoteUserCard } from '@/shared/types/remote.types';

const useRemoteDeckBuilder = () => {
	const { accessToken } = useAuthSession();
	const [allOwnedCards, setAllOwnedCards] = useState<RemoteUserCard[]>([]);
	const [deckDetail, setDeckDetail] = useState<RemoteDeckDetail | null>(null);
	const [draftDeck, setDraftDeck] = useState<CardInstance[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!accessToken) {
			setIsLoading(false);
			return;
		}

		const load = async () => {
			setIsLoading(true);
			try {
				const [cards, decks] = await Promise.all([getMyCards(accessToken), getMyDecks(accessToken)]);
				const activeDeck = decks.find((deck) => deck.active) ?? decks[0] ?? null;
				setAllOwnedCards(cards);

				if (!activeDeck) {
					setDeckDetail(null);
					setDraftDeck([]);
					setMessage('덱이 없습니다.');
					return;
				}

				const detail = await getDeck(activeDeck.deckId, accessToken);
				setDeckDetail(detail);
				setDraftDeck(detail.cards.map(toCardInstance));
				setMessage(null);
			} catch (error) {
				setMessage(error instanceof Error ? error.message : '덱 데이터를 불러오지 못했습니다.');
			} finally {
				setIsLoading(false);
			}
		};

		void load();
	}, [accessToken]);

	const ownedCards = useMemo(() => {
		const deckIds = new Set(draftDeck.map((card) => card.instanceId));
		return allOwnedCards
			.filter((card) => !deckIds.has(card.userCardId))
			.map(toCardInstance);
	}, [allOwnedCards, draftDeck]);

	const isDirty = useMemo(() => {
		if (!deckDetail) {
			return false;
		}

		const originalIds = deckDetail.cards.map((card) => card.userCardId);
		const draftIds = draftDeck.map((card) => card.instanceId);
		return JSON.stringify(originalIds) !== JSON.stringify(draftIds);
	}, [deckDetail, draftDeck]);

	const handleAddCardToDeck = (cardId: string) => {
		if (draftDeck.length >= 40) {
			setMessage('덱이 이미 40장입니다. 먼저 카드를 빼 주세요.');
			return;
		}

		const card = ownedCards.find((ownedCard) => ownedCard.instanceId === cardId);
		if (!card) {
			return;
		}

		setDraftDeck((previousDeck) => [...previousDeck, card]);
		setMessage(null);
	};

	const handleRemoveCardFromDeck = (cardId: string) => {
		setDraftDeck((previousDeck) =>
			previousDeck.filter((card) => card.instanceId !== cardId),
		);
		setMessage(null);
	};

	const handleSaveDeck = async () => {
		if (!accessToken || !deckDetail) {
			return;
		}

		if (draftDeck.length !== 40) {
			setMessage('덱은 정확히 40장이어야 저장할 수 있습니다.');
			return;
		}

		setIsSaving(true);
		try {
			const nextDetail = await saveDeckCards(
				deckDetail.deckId,
				draftDeck.map((card) => card.instanceId),
				accessToken,
			);
			setDeckDetail(nextDetail);
			setDraftDeck(nextDetail.cards.map(toCardInstance));
			setMessage('덱이 저장되었습니다.');
		} catch (error) {
			setMessage(error instanceof Error ? error.message : '덱 저장에 실패했습니다.');
		} finally {
			setIsSaving(false);
		}
	};

	return {
		deck: draftDeck,
		ownedCards,
		deckName: deckDetail?.name ?? '내 덱',
		isDirty,
		isLoading,
		isSaving,
		message,
		handleAddCardToDeck,
		handleRemoveCardFromDeck,
		handleSaveDeck,
	};
};

export default useRemoteDeckBuilder;
