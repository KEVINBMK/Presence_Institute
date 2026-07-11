<?php

namespace App\EventSubscriber;

use App\Enum\DemoRole;
use App\Exception\MetierException;
use App\Service\DemoAuthService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Protection minimale par rôle pour les routes internes de démonstration.
 */
class RequireDemoRoleSubscriber implements EventSubscriberInterface
{
    /** @var list<string> */
    private const PUBLIC_PREFIXES = [
        '/api/auth/login',
        '/api/bureaux',
        '/api/rendez-vous',
    ];

    public function __construct(private DemoAuthService $demoAuth)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::CONTROLLER => ['onKernelController', 10]];
    }

    public function onKernelController(ControllerEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $path = $event->getRequest()->getPathInfo();
        if (!str_starts_with($path, '/api')) {
            return;
        }

        if ($this->isPublicRoute($path, $event->getRequest()->getMethod())) {
            return;
        }

        if ($path === '/api/auth/me' || $path === '/api/auth/logout') {
            return;
        }

        try {
            if (str_starts_with($path, '/api/reception') || $path === '/api/reception/notifications') {
                $this->demoAuth->requireRole(DemoRole::RECEPTION);

                return;
            }

            if (str_starts_with($path, '/api/notifications/')) {
                $this->demoAuth->requireRole(DemoRole::RECEPTION);

                return;
            }

            if (str_starts_with($path, '/api/personnel/me')) {
                $this->demoAuth->requireRole(DemoRole::PERSONNEL);

                return;
            }

            if (str_starts_with($path, '/api/personnel')) {
                throw new MetierException(
                    'Route personnel obsolète. Utilisez /api/personnel/me.',
                    Response::HTTP_GONE,
                );
            }

            if (str_starts_with($path, '/api/visites')) {
                $this->demoAuth->requireRole(DemoRole::RECEPTION);

                return;
            }

            if (preg_match('#^/api/rendez-vous/reference/#', $path)) {
                $this->demoAuth->requireRole(DemoRole::RECEPTION);
            }
        } catch (MetierException $e) {
            throw $e;
        }
    }

    private function isPublicRoute(string $path, string $method): bool
    {
        if ($path === '/api/rendez-vous' && $method === 'POST') {
            return true;
        }

        if ($path === '/api/rendez-vous/suivi' && $method === 'POST') {
            return true;
        }

        if ($path === '/api/rendez-vous/retrouver-reference' && $method === 'POST') {
            return true;
        }

        foreach (self::PUBLIC_PREFIXES as $prefix) {
            if ($prefix === '/api/rendez-vous') {
                continue;
            }
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }

        if (str_starts_with($path, '/api/bureaux')) {
            return true;
        }

        return false;
    }
}
