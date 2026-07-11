import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider, useToast } from './ToastProvider';

function Demo() {
  const { showToast } = useToast();
  return (
    <div>
      <button type="button" onClick={() => showToast('Arrivée enregistrée.', 'success')}>
        succès
      </button>
      <button type="button" onClick={() => showToast('Action impossible.', 'error')}>
        erreur
      </button>
    </div>
  );
}

afterEach(cleanup);

describe('ToastProvider', () => {
  it('affiche un toast de succès avec role="status"', async () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'succès' }));

    const toast = screen.getByRole('status');
    expect(toast.textContent).toContain('Arrivée enregistrée.');
  });

  it('affiche un toast d’erreur avec role="alert"', async () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'erreur' }));

    const toast = screen.getByRole('alert');
    expect(toast.textContent).toContain('Action impossible.');
  });

  it('permet de fermer un toast manuellement', async () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'succès' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fermer le message' }));

    expect(screen.queryByRole('status')).toBeNull();
  });
});
