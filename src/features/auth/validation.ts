export function validateCredentials(
  email: string,
  password: string,
  register: boolean,
) {
  const errors: { email?: string; password?: string } = {};
  const normalizedEmail = email.trim();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
    errors.email = 'Podaj prawidłowy adres email.';
  else if (register && normalizedEmail.length > 230)
    errors.email = 'Adres email może mieć maksymalnie 230 znaków.';
  if (!password.trim()) errors.password = 'Podaj hasło.';
  else if (register && password.length < 8)
    errors.password = 'Hasło musi mieć co najmniej 8 znaków.';
  else if (
    register &&
    (password.length > 72 || new TextEncoder().encode(password).length > 72)
  )
    errors.password =
      'Hasło może mieć maksymalnie 72 bajty UTF-8. Polskie znaki i emoji zajmują więcej niż jeden bajt.';
  return errors;
}
