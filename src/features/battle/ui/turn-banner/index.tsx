import styles from './style.module.scss';

interface Props {
	turn: number;
}

const TurnBanner = ({ turn }: Props) => {
	return (
		<div className={styles.overlay}>
			<div className={styles.banner}>
				<span>TURN</span>
				<strong>{turn}</strong>
			</div>
		</div>
	);
};

export default TurnBanner;
