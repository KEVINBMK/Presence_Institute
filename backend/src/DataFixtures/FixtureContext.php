<?php

namespace App\DataFixtures;

use App\DataFixtures\Support\SlotRegistry;
use App\Entity\Bureau;
use App\Entity\Personnel;
use App\Entity\Reception;
use App\Entity\RendezVous;
use App\Entity\UsagerVisiteur;
use App\Entity\Visite;
use Doctrine\ORM\EntityManagerInterface;
use Faker\Generator;

final class FixtureContext
{
    public int $rdvSeq = 0;
    public int $visSeq = 0;
    public int $persistCount = 0;
    public int $historiqueCount = 0;
    public int $notificationCount = 0;

    public readonly SlotRegistry $slots;

    /** @var array<string, string> clés Postman → références fixes démo */
    public array $demoRefs = [];

    /** @var array<string, true> usagerId|dateYmd → visite ouverte enregistrée */
    public array $openVisiteKeys = [];

    /** @var Reception[] */
    public array $receptions = [];

    /** @var Bureau[] */
    public array $bureaux = [];

    /** @var Personnel[] */
    public array $personnels = [];

    /** @var array<int, Personnel[]> */
    public array $personnelsByBureauId = [];

    /** @var array<string, Personnel> clés démo (ex. marie_ilunga) */
    public array $demoPersonnelsByKey = [];

    /** @var UsagerVisiteur[] */
    public array $usagers = [];

    /** @var RendezVous[] */
    public array $rendezVous = [];

    /** @var Visite[] */
    public array $visites = [];

    public function __construct(
        public readonly EntityManagerInterface $em,
        public readonly Generator $faker,
    ) {
        $this->slots = new SlotRegistry();
    }

    public function openVisiteKey(string $telephone, string $dateYmd): string
    {
        return $telephone . '|' . $dateYmd;
    }

    public function hasOpenVisite(UsagerVisiteur $usager, string $dateYmd): bool
    {
        return isset($this->openVisiteKeys[$this->openVisiteKey($usager->getTelephone(), $dateYmd)]);
    }

    public function registerOpenVisite(Visite $visite, string $dateYmd): void
    {
        $this->openVisiteKeys[$this->openVisiteKey($visite->getUsager()->getTelephone(), $dateYmd)] = true;
    }

    public function flushBatch(int $every = 150): void
    {
        ++$this->persistCount;
        if ($this->persistCount % $every === 0) {
            $this->em->flush();
        }
    }

    public function finalFlush(): void
    {
        $this->em->flush();
    }
}
