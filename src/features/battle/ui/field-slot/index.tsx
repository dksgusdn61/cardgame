import { useDroppable } from '@dnd-kit/core';
import type { CardInstance } from '@/entities/card/types/card.types';
import CardTile from '@/features/battle/ui/card-tile';
import styles from './style.module.scss';

interface Props {
	index: number;
	card: CardInstance | null;
	isLocked?: boolean;
	activeDragCardId?: string;
}

const FieldSlot = ({ index, card, isLocked = false, activeDragCardId }: Props) => {
	const { setNodeRef, isOver } = useDroppable({
		id: `field-slot-${index}`,
		data: {
			zone: 'field',
			index,
		},
		disabled: isLocked,
	});

	return (
		<div
			ref={setNodeRef}
			className={`${styles.field_slot} ${isLocked ? styles.is_locked : ''} ${isOver ? styles.is_over : ''}`}
		>
			{card ? (
				<CardTile card={card} zone="field" isDimmed={card.instanceId === activeDragCardId} />
			) : (
				<div className={`${styles.empty} ${isLocked ? styles.empty_locked : ''}`} />
			)}
		</div>
	);
};

export default FieldSlot;
