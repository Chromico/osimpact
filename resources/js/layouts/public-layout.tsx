import { Button } from '@/components/ui/button';
import { login, register, dashboard } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { type SharedData } from '@/types';

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="mr-4 hidden md:flex">
                        <Link
                            href="/"
                            className="mr-6 flex items-center space-x-2"
                        >
                            <span className="hidden font-normal text-2xl sm:inline-block">
                                Open Source Impact
                            </span>
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link
                                href="/scoreboard"
                                className="text-foreground/60 transition-colors hover:text-foreground/80"
                            >
                                Scoreboard
                            </Link>
                        </nav>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            {/* Search or other items */}
                        </div>
                        <nav className="flex items-center space-x-2">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Login</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={register()}>Get Started</Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
            <main>
                {children}
            </main>
            <footer className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="border-t border-border py-12 flex justify-center">
                    <p className="text-center text-sm/6 text-muted-foreground">
                        &copy; 2025 Open Source Impact. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
