import type { NextFunction, Request, Response } from 'express';
import { authController } from '../../src/controllers/auth.controller';
import { userStore } from '../../src/system/user-store';
import { AuthenticationService } from '../../src/system/authentication-service';
import { authenticationMiddleware } from '../../src/middleware/authentication.middleware';

const response = () => {
  const res = { status: jest.fn(), json: jest.fn() } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  beforeEach(() => userStore.clear());

  it('registers, authenticates and refreshes a real session', async () => {
    const registerResponse = response();
    await authController.register({
      body: { name: 'João', email: 'JOAO@ORUS.DEV', password: 'Orus#2026Seguro' },
    } as Request, registerResponse, jest.fn());

    expect(registerResponse.status).toHaveBeenCalledWith(201);
    const registered = (registerResponse.json as jest.Mock).mock.calls[0][0].data;
    expect(registered.user.email).toBe('joao@orus.dev');
    expect(registered.user.passwordHash).toBeUndefined();

    const verification = await AuthenticationService.getInstance().verifyToken(registered.token);
    expect(verification.valid).toBe(true);
    expect(verification.payload?.username).toBe('João');

    const loginResponse = response();
    await authController.login({
      body: { email: 'joao@orus.dev', password: 'Orus#2026Seguro' },
    } as Request, loginResponse, jest.fn());
    expect(loginResponse.status).toHaveBeenCalledWith(200);

    const refreshAsAccess = await AuthenticationService.getInstance().verifyToken(registered.refreshToken);
    expect(refreshAsAccess).toMatchObject({ valid: false });
    const refreshVerification = await AuthenticationService.getInstance().verifyToken(registered.refreshToken, 'refresh');
    expect(refreshVerification).toMatchObject({ valid: true });

    const refreshRequest = {
      headers: { authorization: `Bearer ${registered.refreshToken}` },
      path: '/protected',
    } as Request;
    const refreshAuthResponse = response();
    await authenticationMiddleware.authenticate(refreshRequest, refreshAuthResponse, jest.fn());
    expect(refreshAuthResponse.status).toHaveBeenCalledWith(401);
    const refreshResponse = response();
    await authController.refreshToken({ body: { refreshToken: registered.refreshToken } } as Request, refreshResponse, jest.fn());
    expect((refreshResponse.json as jest.Mock).mock.calls[0][0]).toMatchObject({ success: true });
    expect((refreshResponse.json as jest.Mock).mock.calls[0][0].data.user.email).toBe('joao@orus.dev');
  });

  it('updates profile and changes the stored password', async () => {
    const registerResponse = response();
    await authController.register({
      body: { name: 'Usuário', email: 'user@orus.dev', password: 'Orus#2026Seguro' },
    } as Request, registerResponse, jest.fn());
    const userId = (registerResponse.json as jest.Mock).mock.calls[0][0].data.user.id;

    const profile = await authController.updateProfile(userId, {
      name: 'Usuário Atualizado',
      bio: 'Construindo com ORUS',
    });
    expect(profile.name).toBe('Usuário Atualizado');
    expect(profile.bio).toBe('Construindo com ORUS');

    await authController.changePassword(userId, 'Orus#2026Seguro', 'Novo#Orus2026');
    const loginResponse = response();
    await authController.login({
      body: { email: 'user@orus.dev', password: 'Novo#Orus2026' },
    } as Request, loginResponse, jest.fn());
    expect(loginResponse.status).toHaveBeenCalledWith(200);
  });

  it('rejects duplicate accounts and invalid credentials', async () => {
    const request = {
      body: { name: 'Usuário', email: 'duplicate@orus.dev', password: 'Orus#2026Seguro' },
    } as Request;
    await authController.register(request, response(), jest.fn());

    const duplicateResponse = response();
    await authController.register(request, duplicateResponse, jest.fn());
    expect(duplicateResponse.status).toHaveBeenCalledWith(409);

    const loginResponse = response();
    await authController.login({
      body: { email: 'duplicate@orus.dev', password: 'senha-incorreta' },
    } as Request, loginResponse, jest.fn() as NextFunction);
    expect(loginResponse.status).toHaveBeenCalledWith(401);
  });

  it('revokes the access token on logout', async () => {
    const registerResponse = response();
    await authController.register({
      body: { name: 'Logout', email: 'logout@orus.dev', password: 'Orus#2026Seguro' },
    } as Request, registerResponse, jest.fn());
    const token = (registerResponse.json as jest.Mock).mock.calls[0][0].data.token;
    const refreshToken = (registerResponse.json as jest.Mock).mock.calls[0][0].data.refreshToken;
    const user = (registerResponse.json as jest.Mock).mock.calls[0][0].data.user;
    const request = {
      headers: { authorization: `Bearer ${token}` },
      body: { refreshToken },
      path: '/protected',
      user: { userId: user.id },
    } as Request;

    const authenticated = response();
    const next = jest.fn();
    await authenticationMiddleware.authenticate(request, authenticated, next);
    expect(next).toHaveBeenCalledTimes(1);

    await authController.logout(request, response(), jest.fn());
    const revoked = response();
    await authenticationMiddleware.authenticate(request, revoked, jest.fn());
    expect(revoked.status).toHaveBeenCalledWith(401);
    expect(await AuthenticationService.getInstance().verifyToken(refreshToken, 'refresh')).toMatchObject({ valid: false });
  });
});
