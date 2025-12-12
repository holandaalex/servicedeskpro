/**
 * @fileoverview Modelos de dados para o sistema de chamados
 * @description Este arquivo contém todas as interfaces, enums e tipos
 * utilizados no gerenciamento de chamados (tickets).
 *
 * HIERARQUIA DE FLUXO:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  USUÁRIO cria chamado → Status: ABERTO                         │
 * │     ↓                                                           │
 * │  Se prioridade URGENTE → Requer aprovação do SUPERVISOR        │
 * │     ↓                                                           │
 * │  SUPERVISOR/ADMIN atribui a um TÉCNICO                         │
 * │     ↓                                                           │
 * │  TÉCNICO assume → Status: EM ANDAMENTO                         │
 * │     ↓                                                           │
 * │  TÉCNICO resolve → Status: RESOLVIDO                           │
 * │     ↓                                                           │
 * │  USUÁRIO confirma ou reabre → Status: FECHADO ou EM ANDAMENTO  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

/**
 * Enum de categorias de chamados
 */
export enum TicketCategory {
  HARDWARE = "Hardware",
  SOFTWARE = "Software",
  NETWORK = "Rede",
  ACCESS = "Acesso/Login",
  OTHER = "Outros",
}

/**
 * Enum de status de chamados
 * @description Ciclo de vida do chamado com regras de transição
 */
export enum TicketStatus {
  OPEN = "Aberto",                    // Recém criado, aguardando atendimento
  PENDING_APPROVAL = "Aguardando Aprovação", // Chamados urgentes aguardando supervisor
  IN_PROGRESS = "Em Andamento",       // Técnico trabalhando na solução
  ON_HOLD = "Em Espera",              // Aguardando usuário/terceiros
  RESOLVED = "Resolvido",             // Solução aplicada, aguardando confirmação
  CLOSED = "Fechado",                 // Chamado finalizado
  CANCELLED = "Cancelado",            // Chamado cancelado
}

/**
 * Enum de prioridade do chamado
 */
export enum TicketPriority {
  LOW = "Baixa",
  MEDIUM = "Média",
  HIGH = "Alta",
  URGENT = "Urgente",   // Requer aprovação do supervisor
}

/**
 * Interface de histórico de ações do chamado
 */
export interface TicketHistory {
  id: string;
  ticketId: string;
  action: TicketAction;
  description: string;
  previousStatus?: TicketStatus;
  newStatus?: TicketStatus;
  userId: string;
  userName: string;
  userRole: string;
  createdAt: string;
}

/**
 * Enum de ações possíveis no chamado
 */
export enum TicketAction {
  CREATED = "Chamado criado",
  UPDATED = "Chamado atualizado",
  STATUS_CHANGED = "Status alterado",
  ASSIGNED = "Chamado atribuído",
  UNASSIGNED = "Atribuição removida",
  APPROVED = "Chamado aprovado",
  REJECTED = "Chamado rejeitado",
  COMMENTED = "Comentário adicionado",
  REOPENED = "Chamado reaberto",
  CLOSED = "Chamado fechado",
  CANCELLED = "Chamado cancelado",
}

/**
 * Interface de comentários do chamado
 */
export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean; // Comentário interno (não visível ao solicitante)
  userId: string;
  userName: string;
  userRole: string;
  createdAt: string;
}

/**
 * Interface principal do Ticket
 */
export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;

  // Usuário solicitante
  createdBy: string;
  createdByName?: string;
  createdByDepartment?: string;

  // Técnico responsável
  assignedTo?: string;
  assignedToName?: string;

  // Aprovação (para chamados urgentes)
  requiresApproval: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;

  // Resolução
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;

  // Fechamento
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
  satisfactionRating?: number; // 1-5

  // Histórico
  history?: TicketHistory[];

  // Comentários
  comments?: TicketComment[];
}

/**
 * DTO para criação de novos tickets
 */
export interface CreateTicketDTO {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

/**
 * DTO para atualização de tickets
 */
export interface UpdateTicketDTO {
  title?: string;
  description?: string;
  category?: TicketCategory;
  status?: TicketStatus;
  priority?: TicketPriority;
  resolution?: string;
  rejectionReason?: string;
  satisfactionRating?: number;
}

/**
 * Interface de resposta da API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Constantes de validação
 */
export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 5000,
};

/**
 * REGRAS DE TRANSIÇÃO DE STATUS
 * Define quais transições são permitidas e por quem
 */
export const STATUS_TRANSITIONS: Record<
  TicketStatus,
  { to: TicketStatus[]; allowedRoles: string[] }
> = {
  [TicketStatus.OPEN]: {
    to: [
      TicketStatus.PENDING_APPROVAL,
      TicketStatus.IN_PROGRESS,
      TicketStatus.CANCELLED,
    ],
    allowedRoles: ["Técnico", "Supervisor", "Administrador"],
  },
  [TicketStatus.PENDING_APPROVAL]: {
    to: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
    allowedRoles: ["Supervisor", "Administrador"],
  },
  [TicketStatus.IN_PROGRESS]: {
    to: [TicketStatus.ON_HOLD, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
    allowedRoles: ["Técnico", "Supervisor", "Administrador"],
  },
  [TicketStatus.ON_HOLD]: {
    to: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
    allowedRoles: ["Técnico", "Supervisor", "Administrador"],
  },
  [TicketStatus.RESOLVED]: {
    to: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
    allowedRoles: ["Usuário", "Técnico", "Supervisor", "Administrador"],
  },
  [TicketStatus.CLOSED]: {
    to: [TicketStatus.IN_PROGRESS], // Reabrir
    allowedRoles: ["Supervisor", "Administrador"],
  },
  [TicketStatus.CANCELLED]: {
    to: [TicketStatus.OPEN], // Reativar
    allowedRoles: ["Supervisor", "Administrador"],
  },
};

/**
 * SLA por prioridade (em horas)
 */
export const SLA_HOURS: Record<TicketPriority, { response: number; resolution: number }> = {
  [TicketPriority.LOW]: { response: 48, resolution: 120 },      // 2 dias / 5 dias
  [TicketPriority.MEDIUM]: { response: 24, resolution: 72 },    // 1 dia / 3 dias
  [TicketPriority.HIGH]: { response: 8, resolution: 24 },       // 8 horas / 1 dia
  [TicketPriority.URGENT]: { response: 2, resolution: 8 },      // 2 horas / 8 horas
};
