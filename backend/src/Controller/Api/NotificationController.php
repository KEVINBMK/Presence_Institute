<?php

namespace App\Controller\Api;

use App\Presenter\ApiPresenter;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class NotificationController extends AbstractApiController
{
    public function __construct(
        private NotificationService $notificationService,
        private EntityManagerInterface $em,
    ) {
    }

    #[Route('/api/reception/notifications', name: 'api_notifications_list', methods: ['GET'])]
    public function listReception(): JsonResponse
    {
        $items = array_map(
            fn ($n) => ApiPresenter::notification($n),
            $this->notificationService->listerPourReception(),
        );

        return $this->jsonOk($items);
    }

    #[Route('/api/notifications/{id}/lire', name: 'api_notifications_lire', methods: ['PATCH'])]
    public function lire(int $id): JsonResponse
    {
        return $this->handle(function () use ($id) {
            $notif = $this->notificationService->marquerLue($id);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::notification($notif));
        });
    }

    #[Route('/api/notifications/{id}/traiter', name: 'api_notifications_traiter', methods: ['PATCH'])]
    public function traiter(int $id): JsonResponse
    {
        return $this->handle(function () use ($id) {
            $notif = $this->notificationService->marquerTraitee($id);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::notification($notif));
        });
    }
}
