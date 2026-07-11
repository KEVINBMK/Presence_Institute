<?php

namespace App\DataFixtures;

/**
 * Orchestration : structure → DEMO (A–F) → volume.
 */
final class MvpFixtureLoader
{
    public function load(FixtureContext $ctx, bool $withVolume = true): void
    {
        (new BaseStructureFixtureLoader())->load($ctx);
        (new DemoComptesFixtureLoader())->load($ctx);
        (new DemoFixtureLoader())->load($ctx);

        if ($withVolume) {
            (new VolumeFixtureLoader())->load($ctx);
        }

        $ctx->finalFlush();
    }
}
