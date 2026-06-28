import request from '@/shared/api/http';
import type { AuthTokenResponse, MeResponse } from '@/shared/types/remote.types';

export const signIn = (payload: { username: string; password: string }) =>
	request<AuthTokenResponse>('/api/auth/sign-in', {
		method: 'POST',
		body: JSON.stringify(payload),
	});

export const signUp = (payload: { username: string; password: string }) =>
	request<AuthTokenResponse>('/api/auth/sign-up', {
		method: 'POST',
		body: JSON.stringify(payload),
	});

export const signOut = (payload: { refreshToken: string }, accessToken?: string) =>
	request<void>('/api/auth/sign-out', {
		method: 'POST',
		body: JSON.stringify(payload),
		accessToken,
	});

export const getMe = (accessToken: string) =>
	request<MeResponse>('/api/me', {
		method: 'GET',
		accessToken,
	});
