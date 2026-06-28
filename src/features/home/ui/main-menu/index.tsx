import { Link } from '@tanstack/react-router';
import useAuthSession from '@/features/auth/model/auth-session-context';
import styles from './style.module.scss';

interface Props {
	canStartGame?: boolean;
	onStartGame: () => void;
	statusMessage?: string;
}

const MainMenu = ({ canStartGame = true, onStartGame, statusMessage }: Props) => {
	const { signOutSession, user } = useAuthSession();

	return (
		<section className={styles.menu_panel}>
			{user ? <p>{user.username}</p> : null}
			<button
				type="button"
				onClick={onStartGame}
				className={styles.menu_button}
				disabled={!canStartGame}
			>
				게임 시작
			</button>
			{statusMessage ? <p>{statusMessage}</p> : null}
			<Link to="/deck" className={styles.menu_button}>
				덱 편성
			</Link>
			<button type="button" onClick={() => void signOutSession()} className={styles.menu_button}>
				로그아웃
			</button>
		</section>
	);
};

export default MainMenu;
