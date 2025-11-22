<?php

use App\Http\Controllers\Api\CodeExecutionController;
use App\Http\Controllers\Auth\GitHubController;
use App\Http\Controllers\ImpactScoreController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('home', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/scoreboard', [ImpactScoreController::class, 'index'])->name('scoreboard.index');
Route::get('/scoreboard/{id}', [ImpactScoreController::class, 'show'])->name('scoreboard.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/scoreboard', [ImpactScoreController::class, 'store'])->name('scoreboard.store');

    Route::get('dashboard', function () {
        $user = auth()->user();
        $hasToken = $user->github_token !== null;
        return Inertia::render('dashboard', [
            'githubConnected' => $hasToken,
            'githubUsername' => $user->github_username ?? config('services.github.username') ?? 'me',
            'githubAuthUrl' => route('github.redirect'),
        ]);
    })->name('dashboard');
    // GitHub OAuth
    Route::get('auth/github', [GitHubController::class, 'redirect'])->name('github.redirect');
    Route::get('auth/github/callback', [GitHubController::class, 'callback'])->name('github.callback');
    Route::post('auth/github/disconnect', [GitHubController::class, 'disconnect'])->name('github.disconnect');


    // E2B APIs
    Route::post('api/agent/run', [CodeExecutionController::class, 'runAgent'])->name('api.agent.run');
});

require __DIR__.'/settings.php';
