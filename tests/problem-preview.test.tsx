import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ProblemPreview } from '../src/app/components/ProblemPreview';

describe('lobby problem preview', () => {
  it('switches between the description, examples and public test cases', async () => {
    const user = userEvent.setup();
    render(<ProblemPreview interactive />);
    expect(screen.getByRole('tabpanel', { name: 'Opis' })).toHaveTextContent(
      'Najdłuższy podciąg',
    );
    await user.click(screen.getByRole('tab', { name: 'Przykłady' }));
    const examples = screen.getByRole('tabpanel', { name: 'Przykłady' });
    expect(examples).toHaveTextContent('[1, 2, 3, 1, 2]');
    expect(examples).toHaveTextContent('Równe liczby przerywają wzrost');
    await user.click(screen.getByRole('tab', { name: 'Testy' }));
    const tests = screen.getByRole('tabpanel', { name: 'Testy' });
    expect(within(tests).getAllByText(/Oczekiwany wynik/)).toHaveLength(3);
    expect(tests).toHaveTextContent('Test 4 (ukryty)');
    expect(tests).toHaveTextContent(
      'Dane wejściowe i oczekiwany wynik pozostają ukryte',
    );
    await user.click(screen.getByRole('tab', { name: 'Opis' }));
    expect(screen.getByRole('tabpanel', { name: 'Opis' })).toHaveTextContent(
      'Argument arr',
    );
  });

  it('supports arrow keys, Home and End with one tab stop', async () => {
    const user = userEvent.setup();
    render(<ProblemPreview interactive />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Opis' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Przykłady' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Przykłady' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Testy' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Opis' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}{Home}');
    expect(screen.getByRole('tab', { name: 'Opis' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('tabpanel', { name: 'Opis' })).toHaveFocus();
  });
});
