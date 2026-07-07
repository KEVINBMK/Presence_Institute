import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreferencePeriodePicker } from './PreferencePeriodePicker';

afterEach(cleanup);

describe('PreferencePeriodePicker', () => {
  it('signale l’option sélectionnée avec aria-pressed', () => {
    render(<PreferencePeriodePicker value="MATIN" onChange={() => {}} />);

    const matin = screen.getByRole('button', { pressed: true });
    expect(matin.textContent).toContain('Matin');
  });

  it('remonte la période choisie', async () => {
    const onChange = vi.fn();
    render(<PreferencePeriodePicker value={null} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /Après-midi/ }));
    expect(onChange).toHaveBeenCalledWith('APRES_MIDI');
  });
});
