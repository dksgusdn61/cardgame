import { useEffect, useState } from 'react';
import { getDeck, getMyDecks } from '@/entities/deck/api/deck.api';
import useAuthSession from '@/features/auth/model/auth-session-context';
import { toCardInstance } from '@/shared/lib/remote-card';
import type { CardInstance } from '@/entities/card/types/card.types';

const useActiveDeck = () => {
	const { accessToken } = useAuthSession();
	const [deckCards, setDeckCards] = useState<CardInstance[] | null>(null);
	const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!accessToken) {
			setDeckCards(null);
			setActiveDeckId(null);
			setIsLoading(false);
			return;
		}

		const load = async () => {
			setIsLoading(true);
			try {
				const decks = await getMyDecks(accessToken);
				const activeDeck = decks.find((deck) => deck.active) ?? decks[0] ?? null;

				if (!activeDeck) {
					setDeckCards(null);
					setActiveDeckId(null);
					setMessage('사용할 덱이 없습니다.');
					return;
				}

				const detail = await getDeck(activeDeck.deckId, accessToken);
				setActiveDeckId(activeDeck.deckId);
				setDeckCards(detail.cards.map(toCardInstance));
				setMessage(null);
			} catch (error) {
				setActiveDeckId(null);
				setMessage(error instanceof Error ? error.message : '활성 덱을 불러오지 못했습니다.');
			} finally {
				setIsLoading(false);
			}
		};

		void load();
	}, [accessToken]);

	return {
		activeDeckId,
		deckCards,
		isLoading,
		message,
	};
};

export default useActiveDeck;
