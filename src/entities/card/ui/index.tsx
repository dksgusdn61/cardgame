import type { CardEntity } from 'src/entities/card/model/types'
import { ATTACK_TYPE_LABEL, JOB_LABEL, RACE_LABEL } from 'src/entities/card/model/constants'
import styles from './style.module.scss'

type Props = {
	card: CardEntity
	isSelected?: boolean
	draggable?: boolean
	onClick?: () => void
	onDragStart?: (event: React.DragEvent<HTMLElement>) => void
	size?: 'sm' | 'md'
}

const CardView = ({
	card,
	isSelected = false,
	draggable = false,
	onClick,
	onDragStart,
	size = 'md',
}: Props) => {
	return (
		<article
			className={[
				styles.container,
				styles[`tone_${card.attackType}`],
				styles[`size_${size}`],
				isSelected ? styles.selected : '',
			].join(' ')}
			draggable={draggable}
			onClick={onClick}
			onDragStart={onDragStart}
		>
			<header className={styles.header}>
				<strong className={styles.name}>{card.name}</strong>
				<span className={styles.attack_type}>{ATTACK_TYPE_LABEL[card.attackType]}</span>
			</header>
			<div className={styles.tags}>
				<span>{RACE_LABEL[card.race]}</span>
				<span>{JOB_LABEL[card.job]}</span>
			</div>
			<div className={styles.stats}>
				<span>ATK {card.attack}</span>
				<span>HP {card.hp}</span>
			</div>
		</article>
	)
}

export default CardView
