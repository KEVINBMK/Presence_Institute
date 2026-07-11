<?php

namespace App\EventSubscriber;

use App\Exception\MetierException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class ApiExceptionSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly bool $kernelDebug,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::EXCEPTION => ['onException', 10]];
    }

    public function onException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();
        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }

        $throwable = $event->getThrowable();

        if ($throwable instanceof MetierException) {
            $event->setResponse(new JsonResponse([
                'success' => false,
                'error' => $throwable->getMessage(),
            ], $throwable->getHttpStatus()));

            return;
        }

        $event->setResponse(new JsonResponse([
            'success' => false,
            'error' => 'Erreur serveur.',
            'detail' => $this->kernelDebug ? $throwable->getMessage() : null,
        ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR));
    }
}
