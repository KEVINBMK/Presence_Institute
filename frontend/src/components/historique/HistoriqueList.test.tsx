import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HistoriqueList } from './HistoriqueList';

afterEach(cleanup);

describe('HistoriqueList', () => {
  it('affiche un état vide clair sans action enregistrée', () => {
    render(<HistoriqueList items={[]} />);
    expect(
      screen.getByText('Aucune action enregistrée pour cette visite pour le moment.'),
    ).toBeTruthy();
  });

  it('affiche les actions de la visite', () => {
    render(
      <HistoriqueList
        items={[
          {
            id: 1,
            typeAction: 'OUVERTURE_VISITE',
            description: 'Visite ouverte par la réception.',
            auteurType: 'RECEPTION',
            auteurId: 1,
            rendezVousId: null,
            visiteId: 1,
            createdAt: '2026-07-07T09:00:00+00:00',
          },
        ]}
      />,
    );
    expect(screen.getByText('Visite ouverte par la réception.')).toBeTruthy();
  });
});
