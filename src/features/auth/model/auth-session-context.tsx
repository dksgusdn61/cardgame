import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react';
import { getMe, signIn, signOut, signUp } from '@/entities/auth/api/auth.api';
import {
	clearStoredTokens,
	loadStoredTokens,
	storeTokens,
} from '@/shared/lib/token-storage';
import type { MeResponse } from '@/shared/types/remote.types';

interface AuthSessionValue {
	accessToken: string | null;
	refreshToken: string | null;
	user: MeResponse | null;
	isLoading: boolean;
	errorMessage: string | null;
	signInWithId: (payload: { username: string; password: string }) => Promise<void>;
	signUpWithId: (payload: {
		username: string;
		password: string;
	}) => Promise<void>;
	signOutSession: () => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export const AuthSessionProvider = ({ children }: { children: ReactNode }) => {
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [refreshToken, setRefreshToken] = useState<string | null>(null);
	const [user, setUser] = useState<MeResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		const storedTokens = loadStoredTokens();
		if (!storedTokens.accessToken || !storedTokens.refreshToken) {
			setIsLoading(false);
			return;
		}

		setAccessToken(storedTokens.accessToken);
		setRefreshToken(storedTokens.refreshToken);

		getMe(storedTokens.accessToken)
			.then((nextUser) => {
				setUser(nextUser);
				setErrorMessage(null);
			})
			.catch(() => {
				clearStoredTokens();
				setAccessToken(null);
				setRefreshToken(null);
				setUser(null);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	const applyTokens = async (nextAccessToken: string, nextRefreshToken: string) => {
		storeTokens(nextAccessToken, nextRefreshToken);
		setAccessToken(nextAccessToken);
		setRefreshToken(nextRefreshToken);
		const nextUser = await getMe(nextAccessToken);
		setUser(nextUser);
		setErrorMessage(null);
	};

	const signInWithId = async (payload: { username: string; password: string }) => {
		setIsLoading(true);
		try {
			const response = await signIn(payload);
			await applyTokens(response.accessToken, response.refreshToken);
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signUpWithId = async (payload: {
		username: string;
		password: string;
	}) => {
		setIsLoading(true);
		try {
			const response = await signUp(payload);
			await applyTokens(response.accessToken, response.refreshToken);
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signOutSession = async () => {
		if (refreshToken) {
			try {
				await signOut({ refreshToken }, accessToken ?? undefined);
			} catch {
				// Best effort sign out.
			}
		}

		clearStoredTokens();
		setAccessToken(null);
		setRefreshToken(null);
		setUser(null);
		setErrorMessage(null);
	};

	return (
		<AuthSessionContext.Provider
			value={{
				accessToken,
				refreshToken,
				user,
				isLoading,
				errorMessage,
				signInWithId,
				signUpWithId,
				signOutSession,
			}}
		>
			{children}
		</AuthSessionContext.Provider>
	);
};

const useAuthSession = () => {
	const context = useContext(AuthSessionContext);

	if (!context) {
		throw new Error('AuthSessionProvider is required');
	}

	return context;
};

export default useAuthSession;
