<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GitHubController extends Controller
{
    /**
     * Redirect to GitHub for authentication.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * Handle GitHub callback.
     */
    public function callback(): RedirectResponse
    {
        try {
            $githubUser = Socialite::driver('github')->user();

            /** @var User $user */
            $user = Auth::user();

            // Update the authenticated user with GitHub information
            $user->update([
                'github_id' => $githubUser->getId(),
                'github_token' => $githubUser->token ?? null,
                'github_refresh_token' => $githubUser->refreshToken ?? null,
                'github_username' => $githubUser->getNickname(),
            ]);

            return redirect()->route('dashboard')->with('success', 'GitHub account connected successfully!');
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', 'Failed to connect GitHub account: '.$e->getMessage());
        }
    }

    /**
     * Disconnect GitHub account.
     */
    public function disconnect(): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $user->update([
            'github_id' => null,
            'github_token' => null,
            'github_refresh_token' => null,
            'github_username' => null,
        ]);

        return redirect()->route('dashboard')->with('success', 'GitHub account disconnected successfully!');
    }
}
