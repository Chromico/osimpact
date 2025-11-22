import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { login, register } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import {
    BrainCircuit,
    Calendar,
    CloudUpload,
    Fingerprint,
    Lock,
    RefreshCw,
    Server,
    Settings,
    Shield,
    User,
} from 'lucide-react';

const primaryFeatures = [
    {
        name: 'Secure AI Analysis',
        description:
            'Our AI uses a secure isolated virtual environment powered by E2B to analyze your work on GitHub.',
        href: '#',
        icon: Shield,
    },
    {
        name: 'Intelligent AI Models',
        description:
            'Powered by intelligent & high performance AI models from OpenAI for a more accurate analysis',
        href: '#',
        icon: BrainCircuit,
    },
    {
        name: 'Easy Dashboard',
        description:
            'Conduct your open source impact analysis easily from our intuitive dashboard.',
        href: '#',
        icon: User,
    },
];
const secondaryFeatures = [
    {
        name: 'Push to deploy.',
        description:
            'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
        icon: CloudUpload,
    },
    {
        name: 'SSL certificates.',
        description:
            'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
        icon: Lock,
    },
    {
        name: 'Simple queues.',
        description:
            'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.',
        icon: RefreshCw,
    },
    {
        name: 'Advanced security.',
        description:
            'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
        icon: Fingerprint,
    },
    {
        name: 'Powerful API.',
        description:
            'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
        icon: Settings,
    },
    {
        name: 'Database backups.',
        description:
            'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.',
        icon: Server,
    },
];
const stats = [
    { id: 1, name: 'Developers on the platform', value: '8,000+' },
    { id: 2, name: 'Daily requests', value: '900m+' },
    { id: 3, name: 'Uptime guarantee', value: '99.9%' },
    { id: 4, name: 'Projects deployed', value: '12m' },
];

export default function Home() {
    return (
        <div className="bg-background text-foreground">
            <Head title="Welcome" />
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
                            <AppearanceToggleDropdown className="mr-2" />
                            <Button variant="ghost" asChild>
                                <Link href={login()}>Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href={register()}>Get Started</Link>
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>
            <main>
                {/* Hero section */}
                <div className="relative isolate overflow-hidden bg-background">
                    <svg
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-border"
                    >
                        <defs>
                            <pattern
                                x="50%"
                                y={-1}
                                id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
                                width={200}
                                height={200}
                                patternUnits="userSpaceOnUse"
                            >
                                <path d="M.5 200V.5H200" fill="none" />
                            </pattern>
                        </defs>
                        <svg
                            x="50%"
                            y={-1}
                            className="overflow-visible fill-muted/50"
                        >
                            <path
                                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                                strokeWidth={0}
                            />
                        </svg>
                        <rect
                            fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)"
                            width="100%"
                            height="100%"
                            strokeWidth={0}
                        />
                    </svg>
                    <div
                        aria-hidden="true"
                        className="absolute top-10 left-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:top-[calc(50%-30rem)] lg:left-48 xl:left-[calc(50%-24rem)]"
                    >
                        <div
                            style={{
                                clipPath:
                                    'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
                            }}
                            className="aspect-1108/632 w-277 bg-linear-to-r from-primary to-secondary opacity-20"
                        />
                    </div>
                    <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                        <div className="mx-auto max-w-2xl shrink-0 lg:mx-0 lg:pt-12">
                            <h1 className="mt-10 text-5xl font-semibold tracking-tight text-pretty text-foreground sm:text-7xl">
                                Know your Open Source Impact
                            </h1>
                            <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
                                Stop underestimating your open source contributions or projects.
                            </p>
                            <div className="mt-10 flex items-center gap-x-6">
                                <Button asChild>
                                    <Link href={register()}>Get started</Link>
                                </Button>
                                {/* <Button variant="link" asChild>
                                    <Link href={login()}>
                                        Learn more{' '}
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </Button> */}
                            </div>
                        </div>
                        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:mt-0 lg:mr-0 lg:ml-10 lg:max-w-none lg:flex-none xl:ml-32">
                            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                                <img
                                    alt="App screenshot"
                                    src="/images/dashboard-osimpact.png"
                                    width={2432}
                                    height={1442}
                                    className="w-304 rounded-md bg-muted/50 shadow-xl ring-1 ring-border"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logo cloud */}
                {/* <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:px-8">
                    <h2 className="text-center text-lg/8 font-semibold text-foreground">
                        The world’s most innovative companies use our app Secured 
                    </h2>
                    <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                        <img
                            alt="Transistor"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
                            width={158}
                            height={48}
                            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
                        />
                        <img
                            alt="Transistor"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-white.svg"
                            width={158}
                            height={48}
                            className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
                        />

                        <img
                            alt="Reform"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
                            width={158}
                            height={48}
                            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
                        />
                        <img
                            alt="Reform"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-white.svg"
                            width={158}
                            height={48}
                            className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
                        />

                        <img
                            alt="Tuple"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
                            width={158}
                            height={48}
                            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:hidden"
                        />
                        <img
                            alt="Tuple"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-white.svg"
                            width={158}
                            height={48}
                            className="col-span-2 max-h-12 w-full object-contain not-dark:hidden lg:col-span-1"
                        />

                        <img
                            alt="SavvyCal"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
                            width={158}
                            height={48}
                            className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 dark:hidden"
                        />
                        <img
                            alt="SavvyCal"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-white.svg"
                            width={158}
                            height={48}
                            className="col-span-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-2 lg:col-span-1"
                        />

                        <img
                            alt="Statamic"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
                            width={158}
                            height={48}
                            className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 dark:hidden"
                        />
                        <img
                            alt="Statamic"
                            src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-white.svg"
                            width={158}
                            height={48}
                            className="col-span-2 col-start-2 max-h-12 w-full object-contain not-dark:hidden sm:col-start-auto lg:col-span-1"
                        />
                    </div>
                </div> */}

                {/* Feature section */}
                <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base/7 font-semibold text-primary">
                            Powered by AI
                        </h2>
                        <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl lg:text-balance">
                            Get an in depth analysis of your open source contributions
                        </p>
                        <p className="mt-6 text-lg/8 text-muted-foreground">
                            Know your impact in the open source world and show others why it matters.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {primaryFeatures.map((feature) => (
                                <div
                                    key={feature.name}
                                    className="flex flex-col"
                                >
                                    <dt className="text-base/7 font-semibold text-foreground">
                                        <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-primary">
                                            <feature.icon
                                                aria-hidden="true"
                                                className="size-6 text-primary-foreground"
                                            />
                                        </div>
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-1 flex flex-auto flex-col text-base/7 text-muted-foreground">
                                        <p className="flex-auto">
                                            {feature.description}
                                        </p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>


                {/* CTA section */}
                <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
                    <svg
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-border"
                    >
                        <defs>
                            <pattern
                                x="50%"
                                y={0}
                                id="1d4240dd-898f-445f-932d-e2872fd12de3"
                                width={200}
                                height={200}
                                patternUnits="userSpaceOnUse"
                            >
                                <path d="M.5 200V.5H200" fill="none" />
                            </pattern>
                        </defs>
                        <svg
                            x="50%"
                            y={0}
                            className="overflow-visible fill-muted/50"
                        >
                            <path
                                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                                strokeWidth={0}
                            />
                        </svg>
                        <rect
                            fill="url(#1d4240dd-898f-445f-932d-e2872fd12de3)"
                            width="100%"
                            height="100%"
                            strokeWidth={0}
                        />
                    </svg>
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 top-10 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
                    >
                        <div
                            style={{
                                clipPath:
                                    'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
                            }}
                            className="aspect-1108/632 w-277 flex-none bg-linear-to-r from-primary to-secondary opacity-20"
                        />
                    </div>
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                            Measure your impact today.
                        </h2>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Button asChild>
                                <Link href={register()}>Get started</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="border-t border-border py-25 flex justify-center">
                    <p className="text-center text-sm/6 text-muted-foreground">
                        &copy; 2025 Open Source Impact. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
