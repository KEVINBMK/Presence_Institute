import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Notification } from '../../types/api';
import { NotificationPanel } from './NotificationPanel';

const baseNotif: Notification = {
  id: 1,
  type: 'FIN_PRISE_EN_CHARGE',
  message: 'Prise en charge terminée pour RDV-2026-000001.',
  statut: 'ENVOYEE',
  emetteurType: 'PERSONNEL',
  destinataireType: 'RECEPTION',
  rendezVousId: 1,
  visiteId: 1,
  createdAt: '2026-07-07T09:00:00+00:00',
  readAt: null,
  treatedAt: null,
};

afterEach(cleanup);

describe('NotificationPanel', () => {
  it('affiche un état vide clair', () => {
    render(<NotificationPanel items={[]} />);
    expect(screen.getByText('Aucun message en attente.')).toBeTruthy();
  });

  it('déclenche les actions « lu » et « traité »', async () => {
    const onLue = vi.fn();
    const onTraitee = vi.fn();
    render(
      <NotificationPanel items={[baseNotif]} onMarquerLue={onLue} onMarquerTraitee={onTraitee} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Marquer comme lu' }));
    await userEvent.click(screen.getByRole('button', { name: 'Marquer comme traité' }));

    expect(onLue).toHaveBeenCalledWith(1);
    expect(onTraitee).toHaveBeenCalledWith(1);
  });

  it('masque « Marquer comme lu » quand la notification est déjà lue', () => {
    render(
      <NotificationPanel
        items={[{ ...baseNotif, readAt: '2026-07-07T09:05:00+00:00' }]}
        onMarquerLue={vi.fn()}
        onMarquerTraitee={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Marquer comme lu' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Marquer comme traité' })).toBeTruthy();
  });

  it('désactive les boutons pendant une action en cours', () => {
    render(
      <NotificationPanel
        items={[baseNotif]}
        actionLoadingId={1}
        onMarquerLue={vi.fn()}
        onMarquerTraitee={vi.fn()}
      />,
    );

    const bouton = screen.getByRole('button', { name: 'Marquer comme traité' });
    expect((bouton as HTMLButtonElement).disabled).toBe(true);
  });
});
