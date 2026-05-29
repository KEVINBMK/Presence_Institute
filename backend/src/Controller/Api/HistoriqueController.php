<?php

namespace App\Controller\Api;

use App\Presenter\ApiPresenter;
use App\Service\HistoriqueService;
use App\Service\VisiteService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class HistoriqueController extends AbstractApiController
{
    public function __construct(
        private VisiteService $visiteService,
        private HistoriqueService $historiqueService,
    ) {
    }

    #[Route('/api/visites/{id}/historique', name: 'api_visite_historique', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function parVisite(int $id): JsonResponse
    {
        return $this->handle(function () use ($id) {
            $visite = $this->visiteService->getOrFail($id);

            return $this->jsonOk($this->historiqueListe($visite));
        });
    }

    #[Route('/api/visites/reference/{reference}/historique', name: 'api_visite_historique_ref', methods: ['GET'])]
    public function parReference(string $reference): JsonResponse
    {
        return $this->handle(function () use ($reference) {
            $visite = $this->visiteService->findByReference($reference)
                ?? throw new \App\Exception\MetierException('Visite introuvable.');

            return $this->jsonOk($this->historiqueListe($visite));
        });
    }

    private function historiqueListe(\App\Entity\Visite $visite): array
    {
        return array_map(
            fn ($h) => ApiPresenter::historique($h),
            $this->historiqueService->getParVisite($visite),
        );
    }
}
