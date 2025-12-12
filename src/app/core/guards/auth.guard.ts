/**
 * @fileoverview Guards de Autenticação e Autorização
 * @description Protege rotas baseado em autenticação e permissões do usuário.
 *
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

import { inject } from "@angular/core";
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
} from "@angular/router";
import { AuthService } from "../services/auth.service";
import { UserRole } from "../models/user.model";
import { ToastService } from "../../shared/services/toast.service";

/**
 * Guard que verifica se o usuário está autenticado
 * Redireciona para login se não estiver
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isAuthenticated()) {
    return true;
  }

  toastService.warning("Você precisa estar logado para acessar esta página.");
  router.navigate(["/login"]);
  return false;
};

/**
 * Guard que verifica se o usuário NÃO está autenticado
 * Usado para páginas de login/registro (redireciona para home se já logado)
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(["/"]);
  return false;
};

/**
 * Guard que verifica se o usuário tem um dos roles permitidos
 * Uso: data: { roles: [UserRole.ADMIN, UserRole.SUPERVISOR] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Primeiro verifica autenticação
  if (!authService.isAuthenticated()) {
    toastService.warning("Você precisa estar logado para acessar esta página.");
    router.navigate(["/login"]);
    return false;
  }

  // Obtém os roles permitidos da rota
  const allowedRoles = route.data?.["roles"] as UserRole[] | undefined;

  // Se não há roles definidos, permite acesso
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Verifica se o usuário tem um dos roles permitidos
  if (authService.hasRole(...allowedRoles)) {
    return true;
  }

  toastService.error("Você não tem permissão para acessar esta página.");
  router.navigate(["/"]);
  return false;
};

/**
 * Guard que verifica permissão específica
 * Uso: data: { permission: 'canManageUsers' }
 */
export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Primeiro verifica autenticação
  if (!authService.isAuthenticated()) {
    toastService.warning("Você precisa estar logado para acessar esta página.");
    router.navigate(["/login"]);
    return false;
  }

  // Obtém a permissão necessária da rota
  const requiredPermission = route.data?.["permission"] as string | undefined;

  // Se não há permissão definida, permite acesso
  if (!requiredPermission) {
    return true;
  }

  // Verifica se o usuário tem a permissão
  if (authService.hasPermission(requiredPermission as any)) {
    return true;
  }

  toastService.error("Você não tem permissão para acessar esta página.");
  router.navigate(["/"]);
  return false;
};

