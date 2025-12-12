/**
 * @fileoverview Serviço de gerenciamento de chamados (tickets)
 * @description Implementa CRUD com lógica de hierarquia e permissões.
 *
 * FLUXO DE TRABALHO:
 * ==================
 * 1. USUÁRIO cria chamado → Status: ABERTO (ou AGUARDANDO APROVAÇÃO se urgente)
 * 2. SUPERVISOR aprova chamados urgentes
 * 3. SUPERVISOR/ADMIN atribui técnico responsável
 * 4. TÉCNICO trabalha → Status: EM ANDAMENTO
 * 5. TÉCNICO resolve → Status: RESOLVIDO
 * 6. USUÁRIO confirma → Status: FECHADO (ou reabre)
 *
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

import { Injectable, inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";
import { StorageService } from "./storage.service";
import { AuthService } from "./auth.service";
import {
  Ticket,
  CreateTicketDTO,
  UpdateTicketDTO,
  TicketStatus,
  TicketCategory,
  TicketPriority,
  ApiResponse,
  TicketHistory,
  TicketAction,
  TicketComment,
  STATUS_TRANSITIONS,
} from "../models/ticket.model";
import { UserRole } from "../models/user.model";
import { environment } from "../../../environments/environment";

const STORAGE_KEY = "tickets";
const HISTORY_KEY = "ticket_history";
const COMMENTS_KEY = "ticket_comments";
const DELAY_MS = environment.networkDelay;

@Injectable({ providedIn: "root" })
export class TicketService {
  private authService = inject(AuthService);

  constructor(private storageService: StorageService) {
    this.initStore();
  }

  private initStore(): void {
    const stored = this.storageService.get<Ticket[]>(STORAGE_KEY);
    if (!stored) {
      this.storageService.set(STORAGE_KEY, []);
    }
    if (!this.storageService.get(HISTORY_KEY)) {
      this.storageService.set(HISTORY_KEY, []);
    }
    if (!this.storageService.get(COMMENTS_KEY)) {
      this.storageService.set(COMMENTS_KEY, []);
    }
  }

  /**
   * Retorna tickets baseado no perfil do usuário
   * - USER: Apenas próprios chamados
   * - TECHNICIAN: Chamados atribuídos a ele + não atribuídos
   * - SUPERVISOR/ADMIN: Todos os chamados
   */
  getAll(): Observable<ApiResponse<Ticket[]>> {
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const currentUser = this.authService.currentUser();

    let filteredTickets = tickets;

    if (currentUser) {
      switch (currentUser.role) {
        case UserRole.USER:
          // Usuário vê apenas seus próprios chamados
          filteredTickets = tickets.filter((t) => t.createdBy === currentUser.id);
          break;
        case UserRole.TECHNICIAN:
          // Técnico vê chamados atribuídos a ele + abertos sem atribuição
          filteredTickets = tickets.filter(
            (t) =>
              t.assignedTo === currentUser.id ||
              (!t.assignedTo && t.status === TicketStatus.OPEN)
          );
          break;
        // SUPERVISOR e ADMIN veem todos
      }
    }

    // Ordena por prioridade e data
    const priorityOrder = {
      [TicketPriority.URGENT]: 0,
      [TicketPriority.HIGH]: 1,
      [TicketPriority.MEDIUM]: 2,
      [TicketPriority.LOW]: 3,
    };

    const sorted = filteredTickets.sort((a, b) => {
      // Primeiro por prioridade
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      // Depois por data (mais recente primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return of({ success: true, data: sorted }).pipe(delay(DELAY_MS));
  }

  /**
   * Retorna chamados pendentes de aprovação (apenas SUPERVISOR/ADMIN)
   */
  getPendingApproval(): Observable<ApiResponse<Ticket[]>> {
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const pending = tickets.filter(
      (t) => t.status === TicketStatus.PENDING_APPROVAL
    );
    return of({ success: true, data: pending }).pipe(delay(DELAY_MS));
  }

  /**
   * Retorna um ticket por ID
   */
  getById(id: string): Observable<ApiResponse<Ticket | null>> {
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const ticket = tickets.find((t) => t.id === id);
    const currentUser = this.authService.currentUser();

    if (!ticket) {
      return of({ success: false, message: "Chamado não encontrado." }).pipe(
        delay(DELAY_MS)
      );
    }

    // Verifica permissão de visualização
    if (currentUser && currentUser.role === UserRole.USER) {
      if (ticket.createdBy !== currentUser.id) {
        return of({
          success: false,
          message: "Você não tem permissão para visualizar este chamado.",
        }).pipe(delay(DELAY_MS));
      }
    }

    // Carrega histórico e comentários
    const history = this.getTicketHistory(id);
    ticket.history = history;

    const comments = this.getTicketComments(id, currentUser);
    ticket.comments = comments;

    return of({ success: true, data: ticket }).pipe(delay(DELAY_MS));
  }

  /**
   * Cria um novo chamado
   * - Chamados URGENTES requerem aprovação do supervisor
   */
  create(dto: CreateTicketDTO): Observable<ApiResponse<Ticket>> {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return of({
        success: false,
        message: "Você precisa estar logado para criar um chamado.",
      }).pipe(delay(DELAY_MS));
    }

    // Validações
    if (!dto.title?.trim() || !dto.description?.trim()) {
      return of({
        success: false,
        message: "Título e descrição são obrigatórios.",
      }).pipe(delay(DELAY_MS));
    }

    if (dto.title.length < 3 || dto.title.length > 100) {
      return of({
        success: false,
        message: "Título deve ter entre 3 e 100 caracteres.",
      }).pipe(delay(DELAY_MS));
    }

    if (dto.description.length < 10 || dto.description.length > 5000) {
      return of({
        success: false,
        message: "Descrição deve ter entre 10 e 5000 caracteres.",
      }).pipe(delay(DELAY_MS));
    }

    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const now = new Date().toISOString();

    // Chamados URGENTES de USUÁRIOS requerem aprovação
    const requiresApproval =
      dto.priority === TicketPriority.URGENT &&
      currentUser.role === UserRole.USER;

    const newTicket: Ticket = {
      id: uuidv4(),
      title: dto.title.trim(),
      description: dto.description.trim(),
      category: dto.category,
      status: requiresApproval ? TicketStatus.PENDING_APPROVAL : TicketStatus.OPEN,
      priority: dto.priority || TicketPriority.MEDIUM,
      createdAt: now,
      updatedAt: now,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdByDepartment: currentUser.department,
      requiresApproval,
    };

    tickets.unshift(newTicket);
    this.storageService.set(STORAGE_KEY, tickets);

    // Registra no histórico
    this.addHistory(newTicket.id, TicketAction.CREATED, "Chamado criado");

    const message = requiresApproval
      ? "Chamado criado! Aguardando aprovação do supervisor."
      : "Chamado criado com sucesso!";

    return of({ success: true, data: newTicket, message }).pipe(delay(DELAY_MS));
  }

  /**
   * Atualiza um chamado
   */
  update(id: string, dto: UpdateTicketDTO): Observable<ApiResponse<Ticket>> {
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const ticketIndex = tickets.findIndex((t) => t.id === id);
    const currentUser = this.authService.currentUser();

    if (ticketIndex === -1) {
      return of({ success: false, message: "Chamado não encontrado." }).pipe(
        delay(DELAY_MS)
      );
    }

    const ticket = { ...tickets[ticketIndex] };
    const previousStatus = ticket.status;

    // Verifica permissões
    if (currentUser) {
      if (currentUser.role === UserRole.USER) {
        // Usuário só pode editar chamados próprios que estão abertos
        if (ticket.createdBy !== currentUser.id) {
          return of({
            success: false,
            message: "Você não tem permissão para editar este chamado.",
          }).pipe(delay(DELAY_MS));
        }
        if (
          ticket.status !== TicketStatus.OPEN &&
          ticket.status !== TicketStatus.PENDING_APPROVAL
        ) {
          return of({
            success: false,
            message: "Não é possível editar um chamado em andamento.",
          }).pipe(delay(DELAY_MS));
        }
      }
    }

    // Valida transição de status
    if (dto.status && dto.status !== ticket.status) {
      const validation = this.validateStatusTransition(
        ticket.status,
        dto.status,
        currentUser?.role
      );
      if (!validation.valid) {
        return of({ success: false, message: validation.message }).pipe(
          delay(DELAY_MS)
        );
      }
    }

    // Atualiza campos
    if (dto.title) ticket.title = dto.title.trim();
    if (dto.description) ticket.description = dto.description.trim();
    if (dto.category) ticket.category = dto.category;
    if (dto.priority) ticket.priority = dto.priority;
    if (dto.status) ticket.status = dto.status;
    if (dto.resolution) ticket.resolution = dto.resolution;

    // Marca resolução
    if (dto.status === TicketStatus.RESOLVED && currentUser) {
      ticket.resolvedAt = new Date().toISOString();
      ticket.resolvedBy = currentUser.id;
      ticket.resolvedByName = currentUser.name;
    }

    // Marca fechamento
    if (dto.status === TicketStatus.CLOSED && currentUser) {
      ticket.closedAt = new Date().toISOString();
      ticket.closedBy = currentUser.id;
      ticket.closedByName = currentUser.name;
      if (dto.satisfactionRating) {
        ticket.satisfactionRating = dto.satisfactionRating;
      }
    }

    ticket.updatedAt = new Date().toISOString();
    tickets[ticketIndex] = ticket;
    this.storageService.set(STORAGE_KEY, tickets);

    // Registra no histórico
    if (dto.status && dto.status !== previousStatus) {
      this.addHistory(
        id,
        TicketAction.STATUS_CHANGED,
        `Status alterado de "${previousStatus}" para "${dto.status}"`,
        previousStatus,
        dto.status
      );
    } else {
      this.addHistory(id, TicketAction.UPDATED, "Chamado atualizado");
    }

    return of({
      success: true,
      data: ticket,
      message: "Chamado atualizado com sucesso!",
    }).pipe(delay(DELAY_MS));
  }

  /**
   * Aprova um chamado urgente (apenas SUPERVISOR/ADMIN)
   */
  approve(ticketId: string): Observable<ApiResponse<Ticket>> {
    const currentUser = this.authService.currentUser();

    if (
      !currentUser ||
      (currentUser.role !== UserRole.SUPERVISOR &&
        currentUser.role !== UserRole.ADMIN)
    ) {
      return of({
        success: false,
        message: "Apenas supervisores podem aprovar chamados.",
      }).pipe(delay(DELAY_MS));
    }

    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId);

    if (ticketIndex === -1) {
      return of({ success: false, message: "Chamado não encontrado." }).pipe(
        delay(DELAY_MS)
      );
    }

    const ticket = tickets[ticketIndex];

    if (ticket.status !== TicketStatus.PENDING_APPROVAL) {
      return of({
        success: false,
        message: "Este chamado não está aguardando aprovação.",
      }).pipe(delay(DELAY_MS));
    }

    ticket.status = TicketStatus.OPEN;
    ticket.approvedBy = currentUser.id;
    ticket.approvedByName = currentUser.name;
    ticket.approvedAt = new Date().toISOString();
    ticket.updatedAt = new Date().toISOString();

    tickets[ticketIndex] = ticket;
    this.storageService.set(STORAGE_KEY, tickets);

    this.addHistory(
      ticketId,
      TicketAction.APPROVED,
      `Chamado aprovado por ${currentUser.name}`,
      TicketStatus.PENDING_APPROVAL,
      TicketStatus.OPEN
    );

    return of({
      success: true,
      data: ticket,
      message: "Chamado aprovado com sucesso!",
    }).pipe(delay(DELAY_MS));
  }

  /**
   * Rejeita um chamado urgente (apenas SUPERVISOR/ADMIN)
   */
  reject(ticketId: string, reason: string): Observable<ApiResponse<Ticket>> {
    const currentUser = this.authService.currentUser();

    if (
      !currentUser ||
      (currentUser.role !== UserRole.SUPERVISOR &&
        currentUser.role !== UserRole.ADMIN)
    ) {
      return of({
        success: false,
        message: "Apenas supervisores podem rejeitar chamados.",
      }).pipe(delay(DELAY_MS));
    }

    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId);

    if (ticketIndex === -1) {
      return of({ success: false, message: "Chamado não encontrado." }).pipe(
        delay(DELAY_MS)
      );
    }

    const ticket = tickets[ticketIndex];
    ticket.status = TicketStatus.CANCELLED;
    ticket.rejectionReason = reason;
    ticket.updatedAt = new Date().toISOString();

    tickets[ticketIndex] = ticket;
    this.storageService.set(STORAGE_KEY, tickets);

    this.addHistory(
      ticketId,
      TicketAction.REJECTED,
      `Chamado rejeitado: ${reason}`,
      TicketStatus.PENDING_APPROVAL,
      TicketStatus.CANCELLED
    );

    return of({
      success: true,
      data: ticket,
      message: "Chamado rejeitado.",
    }).pipe(delay(DELAY_MS));
  }

  /**
   * Atribui um técnico ao chamado (apenas SUPERVISOR/ADMIN)
   */
  assign(
    ticketId: string,
    technicianId: string,
    technicianName: string
  ): Observable<ApiResponse<Ticket>> {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return of({ success: false, message: "Não autenticado." }).pipe(
        delay(DELAY_MS)
      );
    }

    // Técnico pode assumir chamados para si mesmo
    const canAssign =
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.SUPERVISOR ||
      (currentUser.role === UserRole.TECHNICIAN &&
        technicianId === currentUser.id);

    if (!canAssign) {
      return of({
        success: false,
        message: "Você não tem permissão para atribuir chamados.",
      }).pipe(delay(DELAY_MS));
    }

    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId);

    if (ticketIndex === -1) {
      return of({ success: false, message: "Chamado não encontrado." }).pipe(
        delay(DELAY_MS)
      );
    }

    const ticket = tickets[ticketIndex];
    const previousAssigned = ticket.assignedToName;

    ticket.assignedTo = technicianId;
    ticket.assignedToName = technicianName;
    ticket.status = TicketStatus.IN_PROGRESS;
    ticket.updatedAt = new Date().toISOString();

    tickets[ticketIndex] = ticket;
    this.storageService.set(STORAGE_KEY, tickets);

    this.addHistory(
      ticketId,
      TicketAction.ASSIGNED,
      `Chamado atribuído a ${technicianName}${
        previousAssigned ? ` (anteriormente: ${previousAssigned})` : ""
      }`,
      ticket.status,
      TicketStatus.IN_PROGRESS
    );

    return of({
      success: true,
      data: ticket,
      message: `Chamado atribuído a ${technicianName}.`,
    }).pipe(delay(DELAY_MS));
  }

  /**
   * Técnico assume um chamado para si mesmo
   */
  takeOwnership(ticketId: string): Observable<ApiResponse<Ticket>> {
    const currentUser = this.authService.currentUser();

    if (!currentUser || currentUser.role === UserRole.USER) {
      return of({
        success: false,
        message: "Apenas técnicos podem assumir chamados.",
      }).pipe(delay(DELAY_MS));
    }

    return this.assign(ticketId, currentUser.id, currentUser.name);
  }

  /**
   * Deleta um chamado
   */
  delete(id: string): Observable<ApiResponse<void>> {
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const ticketIndex = tickets.findIndex((t) => t.id === id);
    const currentUser = this.authService.currentUser();

    if (ticketIndex === -1) {
      return of({ success: false, message: "Chamado não encontrado." }).pipe(
        delay(DELAY_MS)
      );
    }

    const ticket = tickets[ticketIndex];

    // Verifica permissão
    if (currentUser) {
      const canDelete =
        currentUser.role === UserRole.ADMIN ||
        currentUser.role === UserRole.SUPERVISOR ||
        (ticket.createdBy === currentUser.id &&
          (ticket.status === TicketStatus.OPEN ||
            ticket.status === TicketStatus.PENDING_APPROVAL));

      if (!canDelete) {
        return of({
          success: false,
          message: "Você não tem permissão para deletar este chamado.",
        }).pipe(delay(DELAY_MS));
      }
    }

    tickets.splice(ticketIndex, 1);
    this.storageService.set(STORAGE_KEY, tickets);

    return of({ success: true, message: "Chamado deletado com sucesso!" }).pipe(
      delay(DELAY_MS)
    );
  }

  /**
   * Busca tickets por termo
   */
  search(term: string): Observable<ApiResponse<Ticket[]>> {
    return this.getAll().pipe(
      map((response) => {
        if (!response.success || !response.data) return response;

        const lowerTerm = term.toLowerCase();
        const filtered = response.data.filter(
          (ticket) =>
            ticket.title.toLowerCase().includes(lowerTerm) ||
            ticket.description.toLowerCase().includes(lowerTerm) ||
            ticket.category.toLowerCase().includes(lowerTerm) ||
            ticket.id.includes(lowerTerm) ||
            ticket.createdByName?.toLowerCase().includes(lowerTerm) ||
            ticket.assignedToName?.toLowerCase().includes(lowerTerm)
        );

        return { ...response, data: filtered };
      })
    );
  }

  // ==================== Métodos Auxiliares ====================

  /**
   * Valida se uma transição de status é permitida
   */
  private validateStatusTransition(
    from: TicketStatus,
    to: TicketStatus,
    userRole?: UserRole
  ): { valid: boolean; message?: string } {
    const transition = STATUS_TRANSITIONS[from];

    if (!transition.to.includes(to)) {
      return {
        valid: false,
        message: `Não é possível alterar o status de "${from}" para "${to}".`,
      };
    }

    if (userRole && !transition.allowedRoles.includes(userRole)) {
      return {
        valid: false,
        message: `Seu perfil não permite alterar o status de "${from}" para "${to}".`,
      };
    }

    return { valid: true };
  }

  /**
   * Adiciona entrada no histórico do chamado
   */
  private addHistory(
    ticketId: string,
    action: TicketAction,
    description: string,
    previousStatus?: TicketStatus,
    newStatus?: TicketStatus
  ): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const history = this.storageService.get<TicketHistory[]>(HISTORY_KEY, []) || [];

    const entry: TicketHistory = {
      id: uuidv4(),
      ticketId,
      action,
      description,
      previousStatus,
      newStatus,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };

    history.unshift(entry);
    this.storageService.set(HISTORY_KEY, history);
  }

  /**
   * Retorna histórico de um chamado
   */
  private getTicketHistory(ticketId: string): TicketHistory[] {
    const history = this.storageService.get<TicketHistory[]>(HISTORY_KEY, []) || [];
    return history.filter((h) => h.ticketId === ticketId);
  }

  /**
   * Retorna comentários de um chamado
   * Comentários internos só são visíveis para técnicos, supervisores e admins
   */
  private getTicketComments(
    ticketId: string,
    user: { role: string } | null
  ): TicketComment[] {
    const comments =
      this.storageService.get<TicketComment[]>(COMMENTS_KEY, []) || [];
    const ticketComments = comments.filter((c) => c.ticketId === ticketId);

    // Usuários comuns não veem comentários internos
    if (user && user.role === UserRole.USER) {
      return ticketComments.filter((c) => !c.isInternal);
    }

    return ticketComments;
  }

  /**
   * Adiciona um comentário ao chamado
   */
  addComment(
    ticketId: string,
    content: string,
    isInternal: boolean
  ): Observable<ApiResponse<TicketComment>> {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return of({
        success: false,
        message: "Você precisa estar logado para comentar.",
      }).pipe(delay(DELAY_MS));
    }

    if (!content.trim()) {
      return of({
        success: false,
        message: "O comentário não pode estar vazio.",
      }).pipe(delay(DELAY_MS));
    }

    // Usuários comuns não podem adicionar comentários internos
    if (isInternal && currentUser.role === UserRole.USER) {
      isInternal = false;
    }

    const comments =
      this.storageService.get<TicketComment[]>(COMMENTS_KEY, []) || [];

    const newComment: TicketComment = {
      id: uuidv4(),
      ticketId,
      content: content.trim(),
      isInternal,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };

    comments.unshift(newComment);
    this.storageService.set(COMMENTS_KEY, comments);

    // Registra no histórico
    this.addHistory(
      ticketId,
      TicketAction.COMMENTED,
      `${isInternal ? "[Interno] " : ""}Comentário adicionado por ${currentUser.name}`
    );

    return of({
      success: true,
      data: newComment,
      message: "Comentário adicionado com sucesso!",
    }).pipe(delay(DELAY_MS));
  }

  /**
   * Retorna lista de técnicos disponíveis
   */
  getTechnicians(): Observable<{ id: string; name: string }[]> {
    // Em um sistema real, isso viria do AuthService
    return this.authService.getAllUsers().pipe(
      map((users) =>
        users
          .filter(
            (u) =>
              u.role === UserRole.TECHNICIAN ||
              u.role === UserRole.SUPERVISOR ||
              u.role === UserRole.ADMIN
          )
          .map((u) => ({ id: u.id, name: u.name }))
      )
    );
  }
}
