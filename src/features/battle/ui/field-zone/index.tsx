import type { CardInstance } from '@/entities/card/types/card.types';
import { isLockedFieldSlot } from '@/features/battle/model/battle-state.utils';
import FieldSlot from '@/features/battle/ui/field-slot';
import styles from './style.module.scss';

interface Props {
	field: Array<CardInstance | null>;
	unlockedSlotCount: number;
	activeDragCardId?: string;
	isInteractionLocked?: boolean;
}

const FieldZone = ({
	field,
	unlockedSlotCount,
	activeDragCardId,
	isInteractionLocked = false,
}: Props) => {
	return (
		<section className={styles.field_zone}>
			<div className={styles.field_grid}>
				{field.map((card, index) => (
					<FieldSlot
						key={`field-slot-${index}`}
						index={index}
						card={card}
						isLocked={isLockedFieldSlot(index, unlockedSlotCount)}
						activeDragCardId={activeDragCardId}
						isInteractionLocked={isInteractionLocked}
					/>
				))}
			</div>
		</section>
	);
};

export default FieldZone;
