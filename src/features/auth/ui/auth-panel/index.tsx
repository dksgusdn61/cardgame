import { useState } from 'react';
import useAuthSession from '@/features/auth/model/auth-session-context';
import styles from './style.module.scss';

const AuthPanel = () => {
	const { errorMessage, isLoading, signInWithId, signUpWithId } = useAuthSession();
	const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async () => {
		if (mode === 'sign_in') {
			await signInWithId({ username, password });
			return;
		}

		await signUpWithId({ username, password });
	};

	return (
		<section className={styles.panel}>
			<div className={styles.mode_row}>
				<button
					type="button"
					onClick={() => setMode('sign_in')}
					className={mode === 'sign_in' ? styles.is_active : ''}
				>
					로그인
				</button>
				<button
					type="button"
					onClick={() => setMode('sign_up')}
					className={mode === 'sign_up' ? styles.is_active : ''}
				>
					회원가입
				</button>
			</div>
			<div className={styles.form}>
				<input
					type="text"
					placeholder="username"
					value={username}
					onChange={(event) => setUsername(event.target.value)}
				/>
				<input
					type="password"
					placeholder="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
				/>
				<button type="button" onClick={handleSubmit} disabled={isLoading}>
					{mode === 'sign_in' ? '로그인' : '회원가입'}
				</button>
				{errorMessage ? <p>{errorMessage}</p> : null}
			</div>
		</section>
	);
};

export default AuthPanel;
