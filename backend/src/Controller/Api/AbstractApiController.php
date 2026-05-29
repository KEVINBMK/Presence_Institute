<?php

namespace App\Controller\Api;

use App\Entity\RendezVous;
use App\Exception\MetierException;
use App\Presenter\ApiPresenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\ConstraintViolationListInterface;

abstract class AbstractApiController extends AbstractController
{
    protected function jsonOk(mixed $data, int $status = Response::HTTP_OK): JsonResponse
    {
        return $this->json(['success' => true, 'data' => $data], $status);
    }

    protected function jsonError(string $message, int $status = Response::HTTP_BAD_REQUEST): JsonResponse
    {
        return $this->json(['success' => false, 'error' => $message], $status);
    }

    protected function handle(callable $fn): JsonResponse
    {
        try {
            return $fn();
        } catch (MetierException $e) {
            return $this->jsonError($e->getMessage());
        }
    }

    protected function validationErrors(ConstraintViolationListInterface $errors): JsonResponse
    {
        $messages = [];
        foreach ($errors as $error) {
            $messages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
        }

        return $this->jsonError(implode(' | ', $messages));
    }

    /** @param RendezVous[] $items */
    protected function rendezVousList(array $items): array
    {
        return array_map(fn ($r) => ApiPresenter::rendezVous($r), $items);
    }
}
