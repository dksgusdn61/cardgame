import env from '@/shared/config/env';

interface RequestOptions extends RequestInit {
	accessToken?: string;
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
	const { accessToken, headers, ...restOptions } = options;
	const response = await fetch(`${env.serverUrl}${path}`, {
		...restOptions,
		headers: {
			'Content-Type': 'application/json',
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
			...headers,
		},
	});

	if (!response.ok) {
		const errorBody = await response.json().catch(() => null);
		throw new Error(errorBody?.error?.message ?? '서버 요청에 실패했습니다.');
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
};

export default request;
