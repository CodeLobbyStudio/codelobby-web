import { ApiError, isRecord, postJson } from '../../../shared/api/http';

export type RegisterRequest = { email: string; password: string };
export type LoginRequest = { email: string; password: string };
export type RegisterResponse = { id: number; email: string; createdAt: string };
export type LoginResponse = { accessToken: string; tokenType: 'Bearer' };

export const authApi = {
  async register(
    request: RegisterRequest,
    signal?: AbortSignal,
  ): Promise<RegisterResponse> {
    const data = await postJson('/auth/register', request, signal);
    if (
      !isRecord(data) ||
      !Number.isSafeInteger(data.id) ||
      (data.id as number) <= 0 ||
      typeof data.email !== 'string' ||
      typeof data.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(data.createdAt))
    )
      throw new ApiError('INVALID_RESPONSE');
    return data as RegisterResponse;
  },
  async login(
    request: LoginRequest,
    signal?: AbortSignal,
  ): Promise<LoginResponse> {
    const data = await postJson('/auth/login', request, signal);
    if (
      !isRecord(data) ||
      typeof data.accessToken !== 'string' ||
      !data.accessToken.trim() ||
      data.tokenType !== 'Bearer'
    )
      throw new ApiError('INVALID_RESPONSE');
    return { accessToken: data.accessToken, tokenType: 'Bearer' };
  },
};
