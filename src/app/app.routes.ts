/**
 * @fileoverview Configuração de rotas da aplicação
 * @description Define todas as rotas disponíveis no sistema.
 *
 * ESTRUTURA DE ROTAS:
 * - Rotas públicas (sem layout): /login, /register
 * - Rotas protegidas (com layout): /, /tickets/*, /users
 * - Página 404
 *
 * @author Alexsander Barreto
 */

import { Routes } from "@angular/router";
import { authGuard, guestGuard, roleGuard } from "./core/guards/auth.guard";
import { UserRole } from "./core/models/user.model";

export const routes: Routes = [
  // ========================================
  // ROTAS PÚBLICAS (sem layout)
  // ========================================
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent
      ),
    canActivate: [guestGuard],
    title: "Login - ServiceDesk Pro",
  },
  {
    path: "register",
    loadComponent: () =>
      import("./features/auth/register/register.component").then(
        (m) => m.RegisterComponent
      ),
    canActivate: [guestGuard],
    title: "Cadastro - ServiceDesk Pro",
  },

  // ========================================
  // ROTAS PROTEGIDAS (com layout)
  // ========================================
  {
    path: "",
    loadComponent: () =>
      import("./layout/layout.component").then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: "",
        loadComponent: () =>
          import(
            "./features/tickets/components/ticket-list/ticket-list.component"
          ).then((m) => m.TicketListComponent),
        title: "Meus Chamados - ServiceDesk Pro",
      },
      {
        path: "tickets/new",
        loadComponent: () =>
          import(
            "./features/tickets/components/ticket-form/ticket-form.component"
          ).then((m) => m.TicketFormComponent),
        title: "Novo Chamado - ServiceDesk Pro",
      },
      {
        path: "tickets/:id/edit",
        loadComponent: () =>
          import(
            "./features/tickets/components/ticket-form/ticket-form.component"
          ).then((m) => m.TicketFormComponent),
        title: "Editar Chamado - ServiceDesk Pro",
      },
      {
        path: "users",
        loadComponent: () =>
          import("./features/users/user-management.component").then(
            (m) => m.UserManagementComponent
          ),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.SUPERVISOR] },
        title: "Gestão de Usuários - ServiceDesk Pro",
      },
    ],
  },

  // ========================================
  // PÁGINA 404
  // ========================================
  {
    path: "**",
    loadComponent: () =>
      import("./features/not-found/not-found.component").then(
        (m) => m.NotFoundComponent
      ),
    title: "Página não encontrada - ServiceDesk Pro",
  },
];
