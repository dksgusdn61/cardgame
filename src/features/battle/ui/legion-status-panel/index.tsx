import type { LegionSummary } from '@/entities/battle/types/battle.types';
import type { DungeonRunState } from '@/features/battle/model/dungeon-flow.types';
import styles from './style.module.scss';

interface Props {
	runState: DungeonRunState;
	legionSummary: LegionSummary;
}

const getAttackTypeLabel = (attackType?: LegionSummary['dominantAttackType']) => {
	if (attackType === 'melee') {
		return '근접 공격';
	}

	if (attackType === 'range') {
		return '원거리 공격';
	}

	if (attackType === 'magic') {
		return '마법 공격';
	}

	return '공격 타입';
};

const LegionStatusPanel = ({ runState, legionSummary }: Props) => {
	const currentLegionHp =
		runState.currentLegionHp === null ? legionSummary.maxHp : runState.currentLegionHp;
	const legionHpRatio =
		legionSummary.maxHp === 0 ? 0 : Math.max(0, (currentLegionHp / legionSummary.maxHp) * 100);

	return (
		<section className={styles.panel}>
			<div className={styles.hp_card}>
				<div className={styles.hp_header}>
					<span>군단 체력</span>
					<strong>
						{currentLegionHp} / {legionSummary.maxHp}
					</strong>
				</div>
				<div className={styles.hp_bar}>
					<div className={styles.hp_fill} style={{ width: `${legionHpRatio}%` }} />
				</div>
			</div>
			<div className={styles.metric_card}>
				<span>{getAttackTypeLabel(legionSummary.dominantAttackType)}</span>
				<strong>{legionSummary.finalAttack} 데미지</strong>
			</div>
			<div className={styles.metric_card}>
				<span>턴 종료 회복</span>
				<strong>+ {legionSummary.recoveryPerTurn} HP</strong>
			</div>
		</section>
	);
};

export default LegionStatusPanel;
