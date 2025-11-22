<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('renders the hero heading on home page', function () {
    $response = $this->get('/');
    $response->assertOk()->assertSee('Build AI-Powered Automation Safely');
});
