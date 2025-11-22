<?php

namespace App\Http\Controllers;

use App\Models\ImpactScore;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ImpactScoreController extends Controller
{
    public function index()
    {
        $scores = ImpactScore::with('user')
            ->orderByDesc('score')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('scoreboard/index', [
            'scores' => $scores,
        ]);
    }

    public function show($id)
    {
        $score = ImpactScore::with('user')->findOrFail($id);

        return Inertia::render('scoreboard/show', [
            'score' => $score,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:100',
            'rank' => 'required|string',
            'analysis' => 'required|string',
            'strengths' => 'required|array',
            'recommendations' => 'required|array',
            'top_repos' => 'nullable|array',
        ]);

        $user = $request->user();

        $impactScore = ImpactScore::create([
            'user_id' => $user->id,
            'github_username' => $user->github_username ?? 'Anonymous',
            ...$validated,
        ]);

        return redirect()->route('scoreboard.show', $impactScore->id);
    }
}
