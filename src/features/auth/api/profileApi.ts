import { ApiError, getJson, isRecord } from '../../../shared/api/http';

export type UserProfile = { id: number; email: string; createdAt: string };

export async function getProfile(
  token: string,
  signal: AbortSignal,
): Promise<UserProfile> {
  const data = await getJson('/users/me', token, signal);
  if (
    !isRecord(data) ||
    typeof data.id !== 'number' ||
    !Number.isSafeInteger(data.id) ||
    data.id <= 0 ||
    typeof data.email !== 'string' ||
    !data.email.trim() ||
    typeof data.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(data.createdAt))
  ) {
    throw new ApiError('INVALID_RESPONSE');
  }
  return { id: data.id, email: data.email, createdAt: data.createdAt };
}
