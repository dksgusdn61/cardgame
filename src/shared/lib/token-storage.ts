const ACCESS_TOKEN_KEY = 'cardgame.accessToken';
const REFRESH_TOKEN_KEY = 'cardgame.refreshToken';

export const loadStoredTokens = () => {
	if (typeof window === 'undefined') {
		return {
			accessToken: null,
			refreshToken: null,
		};
	}

	return {
		accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
		refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
	};
};

export const storeTokens = (accessToken: string, refreshToken: string) => {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearStoredTokens = () => {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.removeItem(ACCESS_TOKEN_KEY);
	window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};
