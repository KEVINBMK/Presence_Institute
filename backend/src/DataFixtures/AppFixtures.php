<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

/**
 * Fixtures DEMO — structure institutionnelle + scénarios A–F.
 *
 * Groupe : demo
 * Combiner avec VolumeFixtures pour le jeu complet.
 */
class AppFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['demo'];
    }

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');
        $faker->seed(2026);

        $ctx = new FixtureContext(self::entityManager($manager), $faker);
        (new MvpFixtureLoader())->load($ctx, withVolume: false);
    }

    private static function entityManager(ObjectManager $manager): EntityManagerInterface
    {
        if (!$manager instanceof EntityManagerInterface) {
            throw new \LogicException('Doctrine ORM EntityManager requis pour les fixtures.');
        }

        return $manager;
    }
}
