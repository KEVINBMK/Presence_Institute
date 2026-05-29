<?php

namespace App\Controller\Api;

use App\DTO\DecisionVisiteDto;
use App\DTO\OrienterVisiteDto;
use App\DTO\OuvrirVisiteDto;
use App\Presenter\ApiPresenter;
use App\Service\ReceptionService;
use App\Service\VisiteService;
use App\Util\DtoMapper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/reception')]
class ReceptionController extends AbstractApiController
{
    public function __construct(
        private ReceptionService $receptionService,
        private VisiteService $visiteService,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('/rendez-vous-du-jour', name: 'api_reception_rdv_jour', methods: ['GET'])]
    public function rendezVousDuJour(): JsonResponse
    {
        return $this->jsonOk($this->rendezVousList($this->receptionService->getRendezVousDuJour()));
    }

    #[Route('/recherche', name: 'api_reception_recherche', methods: ['GET'])]
    public function recherche(Request $request): JsonResponse
    {
        $query = trim((string) $request->query->get('query', ''));
        if ($query === '') {
            return $this->jsonError('Paramètre query requis.');
        }

        return $this->jsonOk($this->rendezVousList($this->receptionService->rechercher($query)));
    }

    #[Route('/visites/active', name: 'api_reception_visite_active', methods: ['GET'])]
    public function visiteActive(Request $request): JsonResponse
    {
        return $this->handle(function () use ($request) {
            $query = trim((string) $request->query->get('query', ''));
            if ($query === '') {
                return $this->jsonError('Paramètre query requis.');
            }

            $visite = $this->receptionService->findVisiteActiveAujourdhui($query);
            if (!$visite) {
                return $this->jsonOk(null);
            }

            return $this->jsonOk(ApiPresenter::visite($visite));
        });
    }

    #[Route('/rendez-vous/{id}/arrivee', name: 'api_reception_arrivee', methods: ['POST'])]
    public function arrivee(int $id): JsonResponse
    {
        return $this->handle(function () use ($id) {
            $rdv = $this->receptionService->enregistrerArrivee($id);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::rendezVous($rdv));
        });
    }

    #[Route('/visites', name: 'api_reception_visite_open', methods: ['POST'])]
    public function ouvrirVisite(Request $request): JsonResponse
    {
        try {
            $dto = DtoMapper::map($request, OuvrirVisiteDto::class);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage());
        }

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrors($errors);
        }

        return $this->handle(function () use ($dto) {
            $visite = $this->receptionService->ouvrirVisite($dto);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::visite($visite), Response::HTTP_CREATED);
        });
    }

    #[Route('/visites/{id}', name: 'api_reception_visite_detail', methods: ['GET'])]
    public function detailVisite(int $id): JsonResponse
    {
        return $this->handle(function () use ($id) {
            $visite = $this->visiteService->getOrFail($id);

            return $this->jsonOk(ApiPresenter::visite($visite));
        });
    }

    #[Route('/visites/{id}/orienter', name: 'api_reception_orienter', methods: ['PATCH'])]
    public function orienter(int $id, Request $request): JsonResponse
    {
        try {
            $dto = DtoMapper::map($request, OrienterVisiteDto::class);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage());
        }

        return $this->handle(function () use ($id, $dto) {
            $visite = $this->receptionService->orienterUsager($id, $dto);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::visite($this->visiteService->getOrFail((int) $visite->getId())));
        });
    }

    #[Route('/visites/{id}/decision', name: 'api_reception_decision', methods: ['PATCH'])]
    public function decision(int $id, Request $request): JsonResponse
    {
        try {
            $dto = DtoMapper::map($request, DecisionVisiteDto::class);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage());
        }

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrors($errors);
        }

        return $this->handle(function () use ($id, $dto) {
            $visite = $this->receptionService->deciderSuiteVisite($id, $dto);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::visite($this->visiteService->getOrFail((int) $visite->getId())));
        });
    }

    #[Route('/visites/{id}/cloturer', name: 'api_reception_cloturer', methods: ['PATCH'])]
    public function cloturer(int $id): JsonResponse
    {
        return $this->handle(function () use ($id) {
            $visite = $this->receptionService->cloturerVisite($id);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::visite($this->visiteService->getOrFail((int) $visite->getId())));
        });
    }
}
