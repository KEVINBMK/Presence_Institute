<?php

namespace App\Service;

use App\Entity\CompteInterneDemo;
use App\Enum\DemoRole;
use App\Exception\MetierException;
use App\Repository\CompteInterneDemoRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;

class DemoAuthService
{
    private const SESSION_COMPTE_ID = 'demo_auth_compte_id';
    private const SESSION_ROLE = 'demo_auth_role';
    private const SESSION_PERSONNEL_ID = 'demo_auth_personnel_id';

    public function __construct(
        private CompteInterneDemoRepository $compteRepository,
        private RequestStack $requestStack,
    ) {
    }

    public function login(string $identifiant, string $code): CompteInterneDemo
    {
        $compte = $this->compteRepository->findOneByIdentifiant(trim($identifiant));
        if (!$compte || !$compte->isActif()) {
            throw new MetierException('Identifiant ou code incorrect.');
        }

        if (!password_verify($code, $compte->getCodeHash())) {
            throw new MetierException('Identifiant ou code incorrect.');
        }

        $session = $this->getSession();
        $session->set(self::SESSION_COMPTE_ID, $compte->getId());
        $session->set(self::SESSION_ROLE, $compte->getRole()->value);
        $session->set(
            self::SESSION_PERSONNEL_ID,
            $compte->getPersonnel()?->getId(),
        );

        return $compte;
    }

    public function logout(): void
    {
        $session = $this->getSession(false);
        if ($session) {
            $session->invalidate();
        }
    }

    public function getCompteConnecte(): ?CompteInterneDemo
    {
        $session = $this->getSession(false);
        if (!$session) {
            return null;
        }

        $compteId = $session->get(self::SESSION_COMPTE_ID);
        if (!$compteId) {
            return null;
        }

        $compte = $this->compteRepository->findOneWithRelations((int) $compteId);
        if (!$compte || !$compte->isActif()) {
            $this->logout();

            return null;
        }

        return $compte;
    }

    public function getRole(): ?DemoRole
    {
        $session = $this->getSession(false);
        if (!$session) {
            return null;
        }

        $role = $session->get(self::SESSION_ROLE);
        if (!$role) {
            return null;
        }

        return DemoRole::from($role);
    }

    public function getPersonnelId(): ?int
    {
        $session = $this->getSession(false);
        if (!$session) {
            return null;
        }

        $id = $session->get(self::SESSION_PERSONNEL_ID);

        return $id !== null ? (int) $id : null;
    }

    public function requireRole(DemoRole $role): CompteInterneDemo
    {
        $compte = $this->getCompteConnecte();
        if (!$compte) {
            throw new MetierException('Authentification requise.', Response::HTTP_UNAUTHORIZED);
        }

        if ($compte->getRole() !== $role) {
            throw new MetierException('Accès non autorisé pour ce rôle.', Response::HTTP_FORBIDDEN);
        }

        return $compte;
    }

    public function requirePersonnelId(): int
    {
        $compte = $this->requireRole(DemoRole::PERSONNEL);
        $personnelId = $compte->getPersonnel()?->getId();
        if (!$personnelId) {
            throw new MetierException('Compte personnel incomplet.', Response::HTTP_FORBIDDEN);
        }

        return (int) $personnelId;
    }

    /** @return array<string, mixed>|null */
    public function sessionPayload(?CompteInterneDemo $compte = null): ?array
    {
        $compte ??= $this->getCompteConnecte();
        if (!$compte) {
            return null;
        }

        $payload = [
            'id' => $compte->getId(),
            'identifiant' => $compte->getIdentifiant(),
            'nomComplet' => $compte->getNomComplet(),
            'role' => $compte->getRole()->value,
            'personnelId' => $compte->getPersonnel()?->getId(),
            'fonction' => $compte->getPersonnel()?->getFonction(),
            'bureau' => $compte->getPersonnel()?->getBureau()?->getNom(),
        ];

        return $payload;
    }

    private function getSession(bool $required = true): ?\Symfony\Component\HttpFoundation\Session\SessionInterface
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            if ($required) {
                throw new MetierException('Session indisponible.');
            }

            return null;
        }

        if (!$request->hasSession()) {
            if ($required) {
                throw new MetierException('Session indisponible.');
            }

            return null;
        }

        $session = $request->getSession();
        // Toujours démarrer : sinon le cookie PHPSESSID n'est pas lu / écrit de façon fiable.
        if (!$session->isStarted()) {
            $session->start();
        }

        return $session;
    }
}
