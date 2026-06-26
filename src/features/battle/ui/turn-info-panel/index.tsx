import styles from './style.module.scss';

interface Props {
	turn: number;
	unlockedSlotCount: number;
	totalSlotCount: number;
}

const TurnInfoPanel = ({ turn, unlockedSlotCount, totalSlotCount }: Props) => {
	return (
		<section className={styles.panel}>
			<h2>전투 정보</h2>
			<div className={styles.info_list}>
				<div className={styles.info_row}>
					<span>턴</span>
					<strong>{turn}</strong>
				</div>
				<div className={styles.info_row}>
					<span>배치한도</span>
					<strong>
						{unlockedSlotCount}/{totalSlotCount}
					</strong>
				</div>
			</div>
		</section>
	);
};

export default TurnInfoPanel;
