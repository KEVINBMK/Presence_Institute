<?php

namespace App\Controller\Api;

use App\DTO\DisponibilitePersonnelDto;
use App\Presenter\ApiPresenter;
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
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'api_personnel_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $items = array_map(
            fn ($p) => ApiPresenter::personnelListe($p),
            $this->personnelService->listActifs(),
        );

        return $this->jsonOk($items);
    }

    #[Route('/{id}/rendez-vous', name: 'api_personnel_rdv', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function rendezVous(int $id): JsonResponse
    {
        return $this->handle(function () use ($id) {
            return $this->jsonOk($this->rendezVousList($this->personnelService->getRendezVousAssignes($id)));
        });
    }

    #[Route('/{id}/disponibilite', name: 'api_personnel_dispo', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function disponibilite(int $id, Request $request): JsonResponse
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

        return $this->handle(function () use ($id, $dto) {
            $personnel = $this->personnelService->changerDisponibilite($id, $dto);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::personnel($personnel));
        });
    }

    #[Route('/{personnelId}/rendez-vous/{id}/demarrer', name: 'api_personnel_demarrer', methods: ['PATCH'])]
    public function demarrer(int $personnelId, int $id): JsonResponse
    {
        return $this->handle(function () use ($personnelId, $id) {
            $rdv = $this->personnelService->demarrerPriseEnCharge($personnelId, $id);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::rendezVous($rdv));
        });
    }

    #[Route('/{personnelId}/rendez-vous/{id}/cloturer', name: 'api_personnel_cloturer', methods: ['PATCH'])]
    public function cloturer(int $personnelId, int $id): JsonResponse
    {
        return $this->handle(function () use ($personnelId, $id) {
            $rdv = $this->personnelService->cloturerPriseEnCharge($personnelId, $id);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::rendezVous($rdv));
        });
    }

    /** Compatibilité anciennes routes Postman (personnelId requis en query). */
    #[Route('/rendez-vous/{id}/demarrer', name: 'api_personnel_demarrer_legacy', methods: ['PATCH'])]
    public function demarrerLegacy(int $id, Request $request): JsonResponse
    {
        $personnelId = (int) $request->query->get('personnelId', 0);
        if ($personnelId <= 0) {
            return $this->jsonError('Paramètre personnelId requis (?personnelId=1).');
        }

        return $this->demarrer($personnelId, $id);
    }

    #[Route('/rendez-vous/{id}/cloturer', name: 'api_personnel_cloturer_legacy', methods: ['PATCH'])]
    public function cloturerLegacy(int $id, Request $request): JsonResponse
    {
        $personnelId = (int) $request->query->get('personnelId', 0);
        if ($personnelId <= 0) {
            return $this->jsonError('Paramètre personnelId requis (?personnelId=1).');
        }

        return $this->cloturer($personnelId, $id);
    }
}
