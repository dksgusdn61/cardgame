import CardTile from '@/features/battle/ui/card-tile';
import type { CardInstance } from '@/entities/card/types/card.types';
import styles from './style.module.scss';

interface Props {
	title: string;
	cards: CardInstance[];
	empty_text: string;
	onCardClick: (cardId: string) => void;
	is_horizontal_scroll?: boolean;
}

const DeckCardSection = ({
	title,
	cards,
	empty_text,
	onCardClick,
	is_horizontal_scroll = false,
}: Props) => {
	return (
		<section className={styles.section}>
			<div className={styles.section_header}>
				<h2>{title}</h2>
				<span>{cards.length}장</span>
			</div>
			{cards.length > 0 ? (
				<div
					className={`${styles.card_grid} ${
						is_horizontal_scroll ? styles.is_horizontal_scroll : ''
					}`}
				>
					{cards.map((card) => (
						<CardTile
							key={card.instanceId}
							card={card}
							zone="hand"
							isDraggable={false}
							onClick={() => onCardClick(card.instanceId)}
						/>
					))}
				</div>
			) : (
				<div className={styles.empty_state}>{empty_text}</div>
			)}
		</section>
	);
};

export default DeckCardSection;
