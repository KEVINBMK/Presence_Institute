<?php

namespace App\Controller\Api;

use App\DTO\DisponibilitePersonnelDto;
use App\Presenter\ApiPresenter;
use App\Service\DemoAuthService;
use App\Service\PersonnelService;
use App\Util\DtoMapper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/personnel')]
class PersonnelController extends AbstractApiController
{
    public function __construct(
        private PersonnelService $personnelService,
        private DemoAuthService $demoAuth,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('/me', name: 'api_personnel_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        return $this->handle(function () {
            $personnelId = $this->demoAuth->requirePersonnelId();
            $personnel = $this->personnelService->getOrFail($personnelId);

            return $this->jsonOk(ApiPresenter::personnelListe($personnel));
        });
    }

    #[Route('/me/rendez-vous', name: 'api_personnel_me_rdv', methods: ['GET'])]
    public function mesRendezVous(): JsonResponse
    {
        return $this->handle(function () {
            $personnelId = $this->demoAuth->requirePersonnelId();

            return $this->jsonOk(
                $this->rendezVousList($this->personnelService->getRendezVousAssignes($personnelId)),
            );
        });
    }

    #[Route('/me/disponibilite', name: 'api_personnel_me_dispo', methods: ['PATCH'])]
    public function maDisponibilite(Request $request): JsonResponse
    {
        try {
            $dto = DtoMapper::map($request, DisponibilitePersonnelDto::class);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage());
        }

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrors($errors);
        }

        return $this->handle(function () use ($dto) {
            $personnelId = $this->demoAuth->requirePersonnelId();
            $personnel = $this->personnelService->changerDisponibilite($personnelId, $dto);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::personnel($personnel));
        });
    }

    #[Route('/me/rendez-vous/{id}/demarrer', name: 'api_personnel_me_demarrer', methods: ['PATCH'])]
    public function demarrer(int $id): JsonResponse
    {
        return $this->handle(function () use ($id) {
            $personnelId = $this->demoAuth->requirePersonnelId();
            $rdv = $this->personnelService->demarrerPriseEnCharge($personnelId, $id);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::rendezVous($rdv));
        });
    }

    #[Route('/me/rendez-vous/{id}/cloturer', name: 'api_personnel_me_cloturer', methods: ['PATCH'])]
    public function cloturer(int $id): JsonResponse
    {
        return $this->handle(function () use ($id) {
            $personnelId = $this->demoAuth->requirePersonnelId();
            $rdv = $this->personnelService->cloturerPriseEnCharge($personnelId, $id);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::rendezVous($rdv));
        });
    }
}
