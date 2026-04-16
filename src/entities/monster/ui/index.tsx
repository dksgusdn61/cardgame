import { ATTACK_TYPE_LABEL, JOB_LABEL, RACE_LABEL } from 'src/entities/card/model/constants'
import type { MonsterEntity } from 'src/entities/monster/model/types'
import styles from './style.module.scss'

type Props = {
	monster: MonsterEntity
}

const MonsterCard = ({ monster }: Props) => {
	const hpRatio = monster.maxHp > 0 ? (monster.hp / monster.maxHp) * 100 : 0

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<div>
					<p className={styles.eyebrow}>Monster</p>
					<h2 className={styles.title}>{monster.name}</h2>
				</div>
				<div className={styles.tags}>
					<span>{ATTACK_TYPE_LABEL[monster.attackType]}</span>
					<span>{RACE_LABEL[monster.race]}</span>
					<span>{JOB_LABEL[monster.job]}</span>
				</div>
			</div>
			<div className={styles.stats}>
				<div>
					<span>HP</span>
					<strong>
						{monster.hp} / {monster.maxHp}
					</strong>
				</div>
				<div>
					<span>ATK</span>
					<strong>{monster.attack}</strong>
				</div>
			</div>
			<div className={styles.meter}>
				<div className={styles.fill} style={{ width: `${hpRatio}%` }} />
			</div>
		</section>
	)
}

export default MonsterCard
