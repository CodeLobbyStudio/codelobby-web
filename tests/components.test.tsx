import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../src/shared/components/Button';
import { FormField } from '../src/shared/components/FormField';
import { Alert } from '../src/shared/components/Alert';
import { LoadingIndicator } from '../src/shared/components/LoadingIndicator';
import { EmptyState } from '../src/shared/components/EmptyState';
import { ErrorState } from '../src/shared/components/ErrorState';
import { ErrorBoundary } from '../src/app/ErrorBoundary';

describe('shared components', () => {
  it('does not submit a form unless explicitly requested', async () => {
    const submit = vi.fn((event: React.SubmitEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={submit}>
        <Button>Zapisz</Button>
      </form>,
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Zapisz' }));
    expect(submit).not.toHaveBeenCalled();
  });

  it('supports explicit submit buttons', async () => {
    const submit = vi.fn((event: React.SubmitEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={submit}>
        <Button type="submit">Wyślij</Button>
      </form>,
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Wyślij' }));
    expect(submit).toHaveBeenCalledOnce();
  });

  it.each([{ disabled: true }, { loading: true }])(
    'prevents interaction while %o',
    async (props) => {
      const action = vi.fn();
      render(
        <Button {...props} onClick={action}>
          Zapisz
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      await userEvent.setup().click(button);
      expect(action).not.toHaveBeenCalled();
    },
  );

  it('provides a loading label and busy state', () => {
    render(
      <Button loading loadingLabel="Zapisywanie…">
        Zapisz
      </Button>,
    );
    expect(
      screen.getByRole('button', { name: 'Zapisywanie…' }),
    ).toHaveAttribute('aria-busy', 'true');
  });

  it('connects the field label, hint, error and external description', async () => {
    render(
      <>
        <span id="external">Wymagane pole.</span>
        <FormField
          label="Email"
          hint="Użyj adresu kontaktowego."
          error="Podaj poprawny email."
          aria-describedby="external"
          type="email"
          required
        />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAccessibleDescription(
      'Wymagane pole. Użyj adresu kontaktowego. Podaj poprawny email.',
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    await userEvent.setup().type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });

  it('assigns independent IDs to repeated fields', () => {
    render(
      <>
        <FormField label="Pierwszy" />
        <FormField label="Drugi" id="custom-id" />
      </>,
    );
    expect(screen.getByLabelText('Drugi')).toHaveAttribute('id', 'custom-id');
    expect(screen.getByLabelText('Pierwszy').id).not.toBe('custom-id');
  });

  it('removes validation feedback when the error is cleared', () => {
    const { rerender } = render(
      <FormField label="Email" error="Niepoprawny adres." />,
    );
    rerender(<FormField label="Email" />);
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Email')).not.toHaveAttribute(
      'aria-describedby',
    );
    expect(screen.queryByText('Niepoprawny adres.')).not.toBeInTheDocument();
  });

  it('announces dynamic error alerts and loading status', () => {
    render(
      <>
        <Alert title="Nie udało się zapisać" variant="error" announce>
          Spróbuj ponownie.
        </Alert>
        <LoadingIndicator label="Pobieranie profilu…" />
      </>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Nie udało się zapisać',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Pobieranie profilu…');
  });

  it('does not make static information an unsolicited live announcement', () => {
    render(<Alert title="W przygotowaniu">Wróć później.</Alert>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('allows the caller to provide an empty-state action', async () => {
    const action = vi.fn();
    render(
      <EmptyState
        title="Brak wyników"
        description="Zmień filtry."
        action={<Button onClick={action}>Wyczyść filtry</Button>}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Brak wyników' }),
    ).toBeInTheDocument();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Wyczyść filtry' }));
    expect(action).toHaveBeenCalledOnce();
  });

  it('offers retry only when a recovery action is available', async () => {
    const retry = vi.fn();
    const { rerender } = render(<ErrorState onRetry={retry} />);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(retry).toHaveBeenCalledOnce();
    rerender(<ErrorState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('render error recovery', () => {
  it('hides technical errors and can recover after a transient failure', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    let shouldThrow = true;
    function Content() {
      if (shouldThrow) throw new Error('PRIVATE_INTERNAL_DETAILS');
      return <p>Widok działa.</p>;
    }
    try {
      render(
        <ErrorBoundary>
          <Content />
        </ErrorBoundary>,
      );
      expect(
        screen.getByRole('heading', { name: 'Coś poszło nie tak' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/PRIVATE_INTERNAL_DETAILS/),
      ).not.toBeInTheDocument();
      shouldThrow = false;
      await userEvent
        .setup()
        .click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
      expect(screen.getByText('Widok działa.')).toBeInTheDocument();
    } finally {
      consoleError.mockRestore();
    }
  });
});
