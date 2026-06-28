import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import useRemoteDeckBuilder from '@/features/deck-builder/model/use-remote-deck-builder';
import DeckCardSection from '@/features/deck-builder/ui/deck-card-section';
import styles from './style.module.scss';

const DeckBuilderScreen = () => {
	const {
		deck,
		ownedCards,
		deckName,
		isDirty,
		isLoading,
		isSaving,
		message,
		handleAddCardToDeck,
		handleRemoveCardFromDeck,
		handleSaveDeck,
	} = useRemoteDeckBuilder();

	return (
		<main className={styles.deck_builder_layout}>
			<div className={styles.deck_builder_panel}>
				<header className={styles.page_header}>
					<Link to="/" className={styles.back_link}>
						<ChevronLeft size={22} />
						<span>나의 덱</span>
					</Link>
				</header>
				{message ? <p className={styles.message}>{message}</p> : null}
				{isLoading ? <p className={styles.message}>덱을 불러오는 중...</p> : null}
				<DeckCardSection
					title={deckName}
					cards={deck}
					empty_text="덱에 넣을 카드를 골라 주세요."
					onCardClick={handleRemoveCardFromDeck}
					is_horizontal_scroll
				/>
				<div className={styles.action_row}>
					<button
						type="button"
						onClick={() => void handleSaveDeck()}
						disabled={!isDirty || isSaving}
						className={styles.save_button}
					>
						{isSaving ? '저장 중...' : '덱 저장'}
					</button>
					<span>{deck.length}/40</span>
				</div>
				<div className={styles.divider} />
				<DeckCardSection
					title="보유 카드"
					cards={ownedCards}
					empty_text="보유한 카드가 없습니다."
					onCardClick={handleAddCardToDeck}
				/>
			</div>
		</main>
	);
};

export default DeckBuilderScreen;
