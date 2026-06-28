import styles from './style.module.scss';

interface Props {
	currentLegionHp: number | null;
	currentLegionMaxHp: number | null;
	onDrawThree: () => void;
	onPickTwo: () => void;
	onRecoverMissingHp: () => void;
}

const WaveRewardModal = ({
	currentLegionHp,
	currentLegionMaxHp,
	onDrawThree,
	onPickTwo,
	onRecoverMissingHp,
}: Props) => {
	const missingHp = Math.max(0, (currentLegionMaxHp ?? 0) - (currentLegionHp ?? 0));
	const recoveryAmount = Math.round(missingHp * 0.35);

	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<h2>다음 웨이브 준비</h2>
				<p>다음 몬스터가 등장합니다. 이번 웨이브 보상을 선택하세요. 웨이브 클리어로 30 회복은 이미 적용되었습니다.</p>
				<div className={styles.button_stack}>
					<button type="button" onClick={onDrawThree} className={styles.primary_button}>
						3장 드로우
					</button>
					<button type="button" onClick={onPickTwo} className={styles.secondary_button}>
						5장 보고 2장 고르기
					</button>
					<button
						type="button"
						onClick={onRecoverMissingHp}
						className={styles.tertiary_button}
						disabled={recoveryAmount <= 0}
					>
						잃은 체력의 35% 회복
						{recoveryAmount > 0 ? ` (+${recoveryAmount})` : ' (회복 불필요)'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default WaveRewardModal;
