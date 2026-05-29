<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

/**
 * Fixtures volume — à charger après AppFixtures (groupe demo).
 *
 * Groupe : volume
 */
class VolumeFixtures extends Fixture implements DependentFixtureInterface, FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['volume'];
    }

    public function getDependencies(): array
    {
        return [AppFixtures::class];
    }

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');
        $faker->seed(2026);

        if (!$manager instanceof EntityManagerInterface) {
            throw new \LogicException('Doctrine ORM EntityManager requis pour les fixtures.');
        }

        $ctx = new FixtureContext($manager, $faker);
        FixtureContextHydrator::hydrate($ctx);

        (new VolumeFixtureLoader())->load($ctx);
        $ctx->finalFlush();
    }
}
