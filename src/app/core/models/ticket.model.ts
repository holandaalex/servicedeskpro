/**
 * @fileoverview Modelos de dados para o sistema de chamados
 * @description Este arquivo contém todas as interfaces, enums e tipos
 * utilizados no gerenciamento de chamados (tickets).
 * 
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

/**
 * Enum de categorias de chamados
 * @description Define as categorias disponíveis para classificação dos chamados.
 * Cada categoria representa um tipo específico de problema ou solicitação.
 */
export enum TicketCategory {
  HARDWARE = "Hardware",      // Problemas com equipamentos físicos
  SOFTWARE = "Software",      // Problemas com programas e sistemas
  NETWORK = "Rede",           // Problemas de conectividade
  ACCESS = "Acesso/Login",    // Problemas de acesso e credenciais
  OTHER = "Outros",           // Outros tipos de solicitações
}

/**
 * Enum de status de chamados
 * @description Define os possíveis estados do ciclo de vida de um chamado.
 * O fluxo típico é: Aberto → Em Andamento → Resolvido → Fechado
 */
export enum TicketStatus {
  OPEN = "Aberto",              // Chamado recém criado, aguardando atendimento
  IN_PROGRESS = "Em Andamento", // Chamado sendo analisado/resolvido
  RESOLVED = "Resolvido",       // Solução aplicada, aguardando confirmação
  CLOSED = "Fechado",           // Chamado finalizado
}

/**
 * Enum de prioridade do chamado
 * @description Define o nível de urgência da solicitação.
 * A prioridade influencia na ordem de atendimento dos chamados.
 */
export enum TicketPriority {
  LOW = "Baixa",       // Pode aguardar, sem impacto crítico
  MEDIUM = "Média",    // Impacto moderado, resolver em breve
  HIGH = "Alta",       // Impacto significativo, priorizar
  URGENT = "Urgente",  // Impacto crítico, atender imediatamente
}

/**
 * Interface principal do Ticket
 * @description Representa um chamado completo no sistema.
 * Contém todos os dados necessários para exibição e manipulação.
 */
export interface Ticket {
  id: string;                   // Identificador único (UUID v4)
  title: string;                // Título resumido do problema
  description: string;          // Descrição detalhada da solicitação
  category: TicketCategory;     // Categoria do chamado
  status: TicketStatus;         // Status atual do chamado
  priority: TicketPriority;     // Nível de prioridade
  createdAt: string;            // Data/hora de criação (ISO 8601)
  updatedAt: string;            // Data/hora da última atualização
}

/**
 * DTO para criação de novos tickets
 * @description Data Transfer Object usado ao criar um novo chamado.
 * Contém apenas os campos que o usuário pode definir na criação.
 * O ID e datas são gerados automaticamente pelo sistema.
 */
export interface CreateTicketDTO {
  title: string;                // Título obrigatório
  description: string;          // Descrição obrigatória
  category: TicketCategory;     // Categoria obrigatória
  priority: TicketPriority;     // Prioridade obrigatória
}

/**
 * DTO para atualização de tickets
 * @description Data Transfer Object usado ao atualizar um chamado.
 * Todos os campos são opcionais - apenas os enviados serão atualizados.
 */
export interface UpdateTicketDTO {
  title?: string;               // Novo título (opcional)
  description?: string;         // Nova descrição (opcional)
  category?: TicketCategory;    // Nova categoria (opcional)
  status?: TicketStatus;        // Novo status (opcional)
  priority?: TicketPriority;    // Nova prioridade (opcional)
}

/**
 * Interface de resposta da API
 * @description Padroniza todas as respostas do serviço.
 * Facilita o tratamento de sucesso/erro de forma consistente.
 * @template T - Tipo dos dados retornados
 */
export interface ApiResponse<T> {
  success: boolean;             // Indica se a operação foi bem-sucedida
  data?: T;                     // Dados retornados (quando sucesso)
  message?: string;             // Mensagem informativa ou de erro
}

/**
 * Constantes de validação
 * @description Regras de validação centralizadas.
 * Manter em um só lugar facilita manutenção e consistência
 * entre frontend e backend (service).
 */
export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 3,          // Mínimo de caracteres no título
  TITLE_MAX_LENGTH: 100,        // Máximo de caracteres no título
  DESCRIPTION_MIN_LENGTH: 10,   // Mínimo de caracteres na descrição
  DESCRIPTION_MAX_LENGTH: 5000, // Máximo de caracteres na descrição
};
