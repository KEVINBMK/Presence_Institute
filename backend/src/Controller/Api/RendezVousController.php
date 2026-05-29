<?php

namespace App\Controller\Api;

use App\DTO\AnnulerRendezVousDto;
use App\DTO\CreateRendezVousDto;
use App\Presenter\ApiPresenter;
use App\Service\RendezVousService;
use App\Util\DtoMapper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/rendez-vous')]
class RendezVousController extends AbstractApiController
{
    public function __construct(
        private RendezVousService $rendezVousService,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'api_rdv_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $dto = DtoMapper::map($request, CreateRendezVousDto::class);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage());
        }

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrors($errors);
        }

        return $this->handle(function () use ($dto) {
            $rdv = $this->rendezVousService->creerDemande($dto);

            return $this->jsonOk(ApiPresenter::rendezVous($rdv), Response::HTTP_CREATED);
        });
    }

    #[Route('/reference/{reference}', name: 'api_rdv_by_ref', methods: ['GET'])]
    public function byReference(string $reference): JsonResponse
    {
        return $this->handle(function () use ($reference) {
            $rdv = $this->rendezVousService->findByReference($reference);

            return $this->jsonOk(ApiPresenter::rendezVous($rdv));
        });
    }

    #[Route('/{id}/annuler', name: 'api_rdv_annuler', methods: ['PATCH'])]
    public function annuler(int $id, Request $request): JsonResponse
    {
        try {
            $dto = DtoMapper::map($request, AnnulerRendezVousDto::class);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage());
        }

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrors($errors);
        }

        return $this->handle(function () use ($id, $dto) {
            $rdv = $this->rendezVousService->annuler($id, $dto->telephone);
            $this->em->flush();

            return $this->jsonOk(ApiPresenter::rendezVous($rdv));
        });
    }
}
