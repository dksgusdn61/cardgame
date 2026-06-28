import { useState } from 'react';
import type { FocusEvent, MouseEvent } from 'react';
import CardTile from '@/features/battle/ui/card-tile';
import type { EnemyUnit } from '@/entities/battle/types/battle.types';
import styles from './style.module.scss';

interface Props {
	selectedEnemy: EnemyUnit;
	waveNumber: number;
	currentEnemyHp: number;
}

const EnemyPanel = ({ selectedEnemy, waveNumber, currentEnemyHp }: Props) => {
	const [tooltipState, setTooltipState] = useState<{
		left: number;
		top: number;
		text: string;
		title: string;
	} | null>(null);
	const attackTypeLabel =
		selectedEnemy.attackType === 'melee'
			? '근접공격'
			: selectedEnemy.attackType === 'range'
				? '원거리공격'
				: '마법공격';
	const enemyHpRatio =
		selectedEnemy.hp === 0 ? 0 : Math.max(0, (currentEnemyHp / selectedEnemy.hp) * 100);

	const openTooltip = (
		event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>,
		title: string,
		text: string,
	) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const tooltipWidth = 280;
		const left = Math.min(
			window.innerWidth - tooltipWidth - 16,
			Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2),
		);
		const top = Math.max(16, rect.bottom + 12);

		setTooltipState({
			left,
			top,
			title,
			text,
		});
	};

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
							<div
								key={trait.name}
								className={styles.trait_chip}
								onMouseEnter={(event) => openTooltip(event, trait.name, trait.description)}
								onMouseLeave={() => setTooltipState(null)}
								onFocus={(event) => openTooltip(event, trait.name, trait.description)}
								onBlur={() => setTooltipState(null)}
								tabIndex={0}
							>
								<span>{trait.name}</span>
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
			{tooltipState ? (
				<div
					className={styles.floating_tooltip}
					style={{ left: `${tooltipState.left}px`, top: `${tooltipState.top}px` }}
				>
					<strong>{tooltipState.title}</strong>
					<p>{tooltipState.text}</p>
				</div>
			) : null}
		</section>
	);
};

export default EnemyPanel;
