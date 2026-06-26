import CardTile from '@/features/battle/ui/card-tile';
import type { EnemyUnit } from '@/entities/battle/types/battle.types';
import styles from './style.module.scss';

interface Props {
	selectedEnemy: EnemyUnit;
	waveNumber: number;
	currentEnemyHp: number;
}

const EnemyPanel = ({ selectedEnemy, waveNumber, currentEnemyHp }: Props) => {
	const attackTypeLabel =
		selectedEnemy.attackType === 'melee'
			? '근접공격'
			: selectedEnemy.attackType === 'range'
				? '원거리공격'
				: '마법공격';
	const enemyHpRatio =
		selectedEnemy.hp === 0 ? 0 : Math.max(0, (currentEnemyHp / selectedEnemy.hp) * 100);

	return (
		<section className={styles.panel}>
			<div className={styles.select_label}>
				<span>현재 웨이브</span>
				<strong>{waveNumber}번째 몬스터</strong>
			</div>
			<div className={styles.enemy_layout}>
				<div className={styles.enemy_card_wrap}>
					<CardTile
						card={{
							id: selectedEnemy.id,
							instanceId: selectedEnemy.id,
							name: selectedEnemy.name,
							race: selectedEnemy.race ?? 'undead',
							job: selectedEnemy.job ?? 'warrior',
							attack: selectedEnemy.attack,
							hp: selectedEnemy.hp,
							attackType: selectedEnemy.attackType,
						}}
						zone="field"
						size="large"
						isDraggable={false}
					/>
				</div>
				<div className={styles.enemy_info}>
					<h2>{selectedEnemy.name}</h2>
					<div className={styles.trait_chips}>
						{selectedEnemy.traits.map((trait) => (
							<div key={trait.name} className={styles.trait_chip}>
								<span>{trait.name}</span>
								<div className={styles.trait_tooltip}>{trait.description}</div>
							</div>
						))}
					</div>
					<div className={styles.enemy_metrics}>
						<div className={styles.enemy_metric}>
							<span>남은 체력</span>
							<strong>{currentEnemyHp}</strong>
						</div>
						<div className={styles.enemy_metric}>
							<span>{attackTypeLabel}</span>
							<strong>{selectedEnemy.attack} 데미지</strong>
						</div>
						<div className={styles.enemy_metric}>
							<span>턴당 회복</span>
							<strong>+ {selectedEnemy.recovery}</strong>
						</div>
					</div>
					<div className={styles.hp_bar}>
						<div className={styles.hp_bar_fill} style={{ width: `${enemyHpRatio}%` }} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default EnemyPanel;
