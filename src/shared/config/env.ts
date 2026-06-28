const env = {
	serverUrl: import.meta.env.VITE_SERVER_URL?.trim() || 'http://localhost:8080',
};

export default env;
