/**
 * @fileoverview Configuração de rotas da aplicação
 * @description Define todas as rotas disponíveis no sistema.
 * Utiliza lazy loading implícito com Standalone Components.
 * 
 * ESTRUTURA DE ROTAS:
 * - "/" → Lista de chamados (página inicial)
 * - "/tickets/new" → Formulário de novo chamado
 * - "/tickets/:id/edit" → Formulário de edição
 * - "/**" → Página 404 (rota não encontrada)
 * 
 * @author Alexsander Barreto
 */

import { Routes } from "@angular/router";
import { TicketListComponent } from "./features/tickets/components/ticket-list/ticket-list.component";
import { TicketFormComponent } from "./features/tickets/components/ticket-form/ticket-form.component";
import { NotFoundComponent } from "./features/not-found/not-found.component";

export const routes: Routes = [
  {
    path: "",
    component: TicketListComponent,
    title: "Meus Chamados - ServiceDesk Pro", // SEO: título da página
  },
  {
    path: "tickets/new",
    component: TicketFormComponent,
    title: "Novo Chamado - ServiceDesk Pro",
  },
  {
    path: "tickets/:id/edit",
    component: TicketFormComponent,
    title: "Editar Chamado - ServiceDesk Pro",
  },
  {
    path: "**", // Wildcard: captura todas as rotas não definidas
    component: NotFoundComponent,
    title: "Página não encontrada - ServiceDesk Pro",
  },
];
