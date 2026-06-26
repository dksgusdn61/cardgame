import type { DungeonRunState } from '@/features/battle/model/dungeon-flow.types';
import styles from './style.module.scss';

interface Props {
	runState: DungeonRunState;
	canResolveTurn: boolean;
	hasPendingSelectiveDraw: boolean;
	isTurnResolving: boolean;
	onStartGame: () => void;
	onResolveTurn: () => void;
	onReset: () => void;
}

const BattleActionPanel = ({
	runState,
	canResolveTurn,
	hasPendingSelectiveDraw,
	isTurnResolving,
	onStartGame,
	onResolveTurn,
	onReset,
}: Props) => {
	const primaryAction =
		runState.phase === 'victory' || runState.phase === 'defeat' ? (
			<button type="button" onClick={onStartGame} className={styles.prepare_button}>
				다시 시작
			</button>
		) : (
			<button
				type="button"
				onClick={onResolveTurn}
				className={styles.prepare_button}
				disabled={
					runState.phase !== 'turn_ready' ||
					!canResolveTurn ||
					hasPendingSelectiveDraw ||
					isTurnResolving
				}
			>
				준비하기
			</button>
		);

	return (
		<section className={styles.panel}>
			<div className={styles.button_stack}>{primaryAction}</div>
			<button type="button" onClick={onReset} className={styles.surrender_button}>
				던전 포기
			</button>
		</section>
	);
};

export default BattleActionPanel;
