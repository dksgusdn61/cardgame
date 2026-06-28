import request from '@/shared/api/http';
import type { RemoteUserCard } from '@/shared/types/remote.types';

export const getMyCards = (accessToken: string) =>
	request<RemoteUserCard[]>('/api/me/cards', {
		method: 'GET',
		accessToken,
	});
