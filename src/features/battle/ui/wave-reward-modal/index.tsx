import styles from './style.module.scss';

interface Props {
	onDrawThree: () => void;
	onPickTwo: () => void;
}

const WaveRewardModal = ({ onDrawThree, onPickTwo }: Props) => {
	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<h2>다음 웨이브 준비</h2>
				<p>다음 몬스터가 등장합니다. 이번 웨이브 드로우 방식을 선택하세요.</p>
				<div className={styles.button_stack}>
					<button type="button" onClick={onDrawThree} className={styles.primary_button}>
						3장 드로우
					</button>
					<button type="button" onClick={onPickTwo} className={styles.secondary_button}>
						5장 보고 2장 고르기
					</button>
				</div>
			</div>
		</div>
	);
};

export default WaveRewardModal;
