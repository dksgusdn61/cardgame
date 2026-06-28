import { useDraggable } from '@dnd-kit/core';
import { jobColorMap, raceColorMap } from '@/entities/card/model/card-appearance';
import { getJobLabel, getRaceLabel } from '@/entities/card/model/card-label';
import type { CardInstance } from '@/entities/card/types/card.types';
import styles from './style.module.scss';

interface Props {
	card: CardInstance;
	zone: 'hand' | 'field';
	size?: 'small' | 'large';
	isSelected?: boolean;
	onClick?: () => void;
	isDraggable?: boolean;
	isDimmed?: boolean;
}

const CardTile = ({
	card,
	zone,
	size = 'small',
	isSelected = false,
	onClick,
	isDraggable = true,
	isDimmed = false,
}: Props) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: card.instanceId,
		data: {
			zone,
		},
		disabled: !isDraggable,
	});

	const handleClick = () => {
		onClick?.();
	};

	return (
		<button
			ref={setNodeRef}
			type="button"
			className={`${styles.card} ${
				size === 'large' ? styles.is_large : styles.is_small
			} ${zone === 'field' ? styles.is_field : styles.is_hand} ${isSelected ? styles.is_selected : ''} ${isDragging ? styles.is_dragging : ''} ${isDimmed ? styles.is_dimmed : ''}`}
			style={
				{
					...(transform
						? {
								transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
							}
						: undefined),
					['--race-color' as const]: raceColorMap[card.race],
					['--job-color' as const]: jobColorMap[card.job],
				}
			}
			onClick={handleClick}
			{...(isDraggable ? listeners : {})}
			{...(isDraggable ? attributes : {})}
		>
			<div className={styles.badges}>
				<span className={styles.race_badge}>{getRaceLabel(card.race)}</span>
				<strong>{getJobLabel(card.job)}</strong>
			</div>
			<div className={styles.art} aria-hidden="true" />
			<div className={styles.bottom_shadow} aria-hidden="true" />
			<div className={styles.meta}>
				<div className={styles.meta_row}>
					<img
						className={styles.attack_type_icon}
						src={`/attack-type-icon/${card.attackType}.svg`}
						alt={card.attackType}
					/>
					<b>{card.name}</b>
				</div>
			</div>
		</button>
	);
};

export default CardTile;
