import { useDroppable } from '@dnd-kit/core';
import type { CardInstance } from '@/entities/card/types/card.types';
import CardTile from '@/features/battle/ui/card-tile';
import styles from './style.module.scss';

interface Props {
	cards: CardInstance[];
	deckCount: number;
	recentlyDrawnCardIds: string[];
	activeDragCardId?: string;
	isInteractionLocked?: boolean;
}

const HandZone = ({
	cards,
	deckCount,
	recentlyDrawnCardIds,
	activeDragCardId,
	isInteractionLocked = false,
}: Props) => {
	const { setNodeRef, isOver } = useDroppable({
		id: 'hand-zone',
		data: {
			zone: 'hand',
		},
		disabled: isInteractionLocked,
	});

	return (
		<section ref={setNodeRef} className={`${styles.hand_zone} ${isOver ? styles.is_over : ''}`}>
			<div className={styles.hand_rail}>
				<div className={styles.hand_scroll}>
					<div className={styles.hand_cards}>
						{cards.map((card, index) => (
							<div
								key={card.instanceId}
								className={`${styles.hand_card_wrap} ${
									recentlyDrawnCardIds.includes(card.instanceId) ? styles.is_entering : ''
								}`}
								style={{ ['--entry-delay' as const]: `${index * 40}ms` }}
							>
								<CardTile
									card={card}
									zone="hand"
									isDimmed={card.instanceId === activeDragCardId}
									isDraggable={!isInteractionLocked}
								/>
							</div>
						))}
					</div>
				</div>
				<div className={styles.deck_wrap} aria-label={`남은 덱 ${deckCount}장`}>
					<div className={styles.deck_stack}>
						<div className={styles.deck_shadow} />
						<div className={styles.deck_shadow} />
						<div className={styles.deck_shadow} />
						<div className={styles.deck_card} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default HandZone;
