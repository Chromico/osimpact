<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImpactScore extends Model
{
    protected $fillable = [
        'user_id',
        'github_username',
        'score',
        'rank',
        'analysis',
        'strengths',
        'recommendations',
        'top_repos',
    ];

    protected $casts = [
        'strengths' => 'array',
        'recommendations' => 'array',
        'top_repos' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
