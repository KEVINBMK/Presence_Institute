<?php

namespace App\Controller\Api;

use App\Presenter\ApiPresenter;
use App\Repository\BureauRepository;
use App\Service\CreneauService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/bureaux')]
class BureauController extends AbstractApiController
{
    public function __construct(
        private BureauRepository $bureauRepository,
        private CreneauService $creneauService,
    ) {
    }

    #[Route('', name: 'api_bureaux_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $bureaux = array_map(
            fn ($b) => ApiPresenter::bureau($b),
            $this->bureauRepository->findActifs(),
        );

        return $this->jsonOk($bureaux);
    }

    #[Route('/{id}/creneaux', name: 'api_bureaux_creneaux', methods: ['GET'])]
    public function creneaux(int $id, Request $request): JsonResponse
    {
        return $this->handle(function () use ($id, $request) {
            $bureau = $this->bureauRepository->find($id);
            if (!$bureau || !$bureau->isActif()) {
                throw new \App\Exception\MetierException('Bureau introuvable.');
            }

            $dateStr = $request->query->get('date', date('Y-m-d'));
            $date = new \DateTimeImmutable($dateStr);
            $creneaux = $this->creneauService->getCreneauxDisponibles($bureau, $date);
            $data = array_map(
                fn ($c) => ApiPresenter::creneau($c['heureDebut'], $c['heureFin'], $c['disponible'], $c['personnelId']),
                $creneaux,
            );

            return $this->jsonOk(['date' => $date->format('Y-m-d'), 'bureauId' => $id, 'creneaux' => $data]);
        });
    }
}
