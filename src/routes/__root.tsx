import { Outlet, createRootRoute } from '@tanstack/react-router';
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanStackDevtools } from '@tanstack/react-devtools'
import { AuthSessionProvider } from '@/features/auth/model/auth-session-context';

import '../styles.css';

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<AuthSessionProvider>
			<Outlet />
		</AuthSessionProvider>
	);
}
