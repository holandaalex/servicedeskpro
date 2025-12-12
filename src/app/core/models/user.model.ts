/**
 * @fileoverview Modelos de dados para o sistema de usuários
 * @description Este arquivo contém todas as interfaces, enums e tipos
 * utilizados no gerenciamento de usuários e autenticação.
 *
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

/**
 * Enum de perfis/roles de usuário
 * @description Define os níveis de acesso no sistema.
 * Cada perfil possui permissões específicas.
 */
export enum UserRole {
  USER = "Usuário",           // Cria e visualiza próprios chamados
  TECHNICIAN = "Técnico",     // Atende chamados, visualiza todos
  SUPERVISOR = "Supervisor",  // Aprova chamados, gerencia equipe
  ADMIN = "Administrador",    // Acesso total ao sistema
}

/**
 * Enum de status do usuário
 * @description Define o estado da conta do usuário.
 */
export enum UserStatus {
  PENDING = "Pendente",       // Aguardando aprovação do admin
  ACTIVE = "Ativo",           // Conta ativa e funcional
  INACTIVE = "Inativo",       // Conta desativada
  BLOCKED = "Bloqueado",      // Conta bloqueada por segurança
}

/**
 * Interface principal do Usuário
 * @description Representa um usuário completo no sistema.
 */
export interface User {
  id: string;                   // Identificador único (UUID v4)
  name: string;                 // Nome completo do usuário
  email: string;                // Email (usado para login)
  password?: string;            // Senha (hash) - não retornada em consultas
  role: UserRole;               // Perfil/nível de acesso
  status: UserStatus;           // Status da conta
  department?: string;          // Departamento/setor
  phone?: string;               // Telefone para contato
  avatar?: string;              // URL da foto de perfil
  createdAt: string;            // Data/hora de criação (ISO 8601)
  updatedAt: string;            // Data/hora da última atualização
  lastLogin?: string;           // Data/hora do último login
}

/**
 * Interface do usuário autenticado (sem senha)
 * @description Versão segura do usuário para uso no frontend.
 */
export type AuthenticatedUser = Omit<User, "password">;

/**
 * DTO para login
 * @description Dados necessários para autenticação.
 */
export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * DTO para registro de novos usuários
 * @description Dados necessários para criar uma nova conta.
 */
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
  phone?: string;
}

/**
 * Resposta de autenticação
 * @description Dados retornados após login bem-sucedido.
 */
export interface AuthResponse {
  success: boolean;
  user?: AuthenticatedUser;
  token?: string;               // Token JWT (mock)
  message?: string;
}

/**
 * Permissões por perfil
 * @description Define o que cada perfil pode fazer no sistema.
 */
export const ROLE_PERMISSIONS = {
  [UserRole.USER]: {
    canCreateTicket: true,
    canViewOwnTickets: true,
    canViewAllTickets: false,
    canEditOwnTickets: true,
    canEditAllTickets: false,
    canDeleteOwnTickets: true,
    canDeleteAllTickets: false,
    canChangeTicketStatus: false,
    canAssignTickets: false,
    canApproveTickets: false,
    canManageUsers: false,
    canViewReports: false,
    canAccessSettings: false,
  },
  [UserRole.TECHNICIAN]: {
    canCreateTicket: true,
    canViewOwnTickets: true,
    canViewAllTickets: true,
    canEditOwnTickets: true,
    canEditAllTickets: true,
    canDeleteOwnTickets: true,
    canDeleteAllTickets: false,
    canChangeTicketStatus: true,
    canAssignTickets: false,
    canApproveTickets: false,
    canManageUsers: false,
    canViewReports: true,
    canAccessSettings: false,
  },
  [UserRole.SUPERVISOR]: {
    canCreateTicket: true,
    canViewOwnTickets: true,
    canViewAllTickets: true,
    canEditOwnTickets: true,
    canEditAllTickets: true,
    canDeleteOwnTickets: true,
    canDeleteAllTickets: true,
    canChangeTicketStatus: true,
    canAssignTickets: true,
    canApproveTickets: true,
    canManageUsers: false,
    canViewReports: true,
    canAccessSettings: false,
  },
  [UserRole.ADMIN]: {
    canCreateTicket: true,
    canViewOwnTickets: true,
    canViewAllTickets: true,
    canEditOwnTickets: true,
    canEditAllTickets: true,
    canDeleteOwnTickets: true,
    canDeleteAllTickets: true,
    canChangeTicketStatus: true,
    canAssignTickets: true,
    canApproveTickets: true,
    canManageUsers: true,
    canViewReports: true,
    canAccessSettings: true,
  },
};

/**
 * Tipo das permissões
 */
export type Permissions = typeof ROLE_PERMISSIONS[UserRole];

/**
 * Constantes de validação para usuários
 */
export const USER_VALIDATION_RULES = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_PATTERN: /^[\d\s\-\(\)]+$/,
};

/**
 * Lista de departamentos disponíveis
 */
export const DEPARTMENTS = [
  "TI",
  "Recursos Humanos",
  "Financeiro",
  "Comercial",
  "Marketing",
  "Operações",
  "Jurídico",
  "Administrativo",
  "Diretoria",
  "Outros",
];

