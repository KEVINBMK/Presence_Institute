<?php

namespace App\Controller\Api;

use App\DTO\LoginDemoDto;
use App\Presenter\ApiPresenter;
use App\Service\DemoAuthService;
use App\Util\DtoMapper;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/auth')]
class AuthController extends AbstractApiController
{
    public function __construct(
        private DemoAuthService $demoAuth,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        try {
            $dto = DtoMapper::map($request, LoginDemoDto::class);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage());
        }

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationErrors($errors);
        }

        return $this->handle(function () use ($dto) {
            $compte = $this->demoAuth->login($dto->identifiant, $dto->code);

            return $this->jsonOk(ApiPresenter::compteDemo($compte));
        });
    }

    #[Route('/me', name: 'api_auth_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        return $this->handle(function () {
            return $this->jsonOk($this->demoAuth->sessionPayload());
        });
    }

    #[Route('/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        $this->demoAuth->logout();

        return $this->jsonOk(['message' => 'Déconnecté.']);
    }
}
