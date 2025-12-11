/**
 * @fileoverview Serviço de gerenciamento de chamados (tickets)
 * @description Este serviço implementa todas as operações CRUD para chamados.
 * Simula uma API utilizando localStorage para persistência local.
 * 
 * PADRÕES UTILIZADOS:
 * - Repository Pattern: Abstrai a camada de dados
 * - Observable Pattern: Retorna Observables para consistência com APIs reais
 * - DTO Pattern: Usa DTOs para separar dados de entrada/saída
 * 
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";
import { StorageService } from "./storage.service";
import {
  Ticket,
  CreateTicketDTO,
  UpdateTicketDTO,
  TicketStatus,
  TicketCategory,
  TicketPriority,
  ApiResponse,
} from "../models/ticket.model";
import { environment } from "../../../environments/environment";

// Chave utilizada para armazenamento no localStorage
const STORAGE_KEY = "tickets";

// Delay para simular latência de rede (0ms em produção, 400ms em desenvolvimento)
const DELAY_MS = environment.networkDelay;

/**
 * Dados iniciais de exemplo
 * @description Chamados pré-cadastrados para demonstração.
 * São inseridos automaticamente se o storage estiver vazio.
 */
const INITIAL_DATA: Ticket[] = [
  {
    id: uuidv4(),
    title: "Monitor não liga",
    description:
      "O monitor do setor financeiro parou de funcionar após queda de energia.",
    category: TicketCategory.HARDWARE,
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "Erro no ERP SAP",
    description: "Não consigo gerar relatórios de vendas mensais.",
    category: TicketCategory.SOFTWARE,
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.URGENT,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "Internet lenta no 3º andar",
    description: "Conexão caindo intermitentemente na sala de reuniões.",
    category: TicketCategory.NETWORK,
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.MEDIUM,
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 dias atrás
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

/**
 * Serviço de Tickets
 * @description Gerencia todas as operações relacionadas a chamados.
 * Utiliza injeção de dependência para acessar o StorageService.
 * 
 * NOTA: Em uma aplicação real, este serviço faria chamadas HTTP
 * para uma API backend. O localStorage é usado aqui apenas para
 * simular persistência sem necessidade de servidor.
 */
@Injectable({ providedIn: "root" })
export class TicketService {
  /**
   * Construtor do serviço
   * @param storageService - Serviço de armazenamento injetado via DI
   */
  constructor(private storageService: StorageService) {
    // Inicializa o storage com dados de exemplo se necessário
    this.initStore();
  }

  /**
   * Inicializa o armazenamento
   * @description Verifica se existem dados salvos. Se não, insere dados iniciais.
   * Isso garante que a aplicação sempre tenha dados para demonstração.
   */
  private initStore(): void {
    const stored = this.storageService.get<Ticket[]>(STORAGE_KEY);
    if (!stored || stored.length === 0) {
      this.storageService.set(STORAGE_KEY, INITIAL_DATA);
    }
  }

  /**
   * Retorna todos os tickets
   * @description Busca todos os chamados e ordena por data de criação (mais recente primeiro).
   * @returns Observable com a lista de tickets
   * 
   * EXEMPLO DE USO:
   * ```typescript
   * this.ticketService.getAll().subscribe(response => {
   *   if (response.success) {
   *     this.tickets = response.data;
   *   }
   * });
   * ```
   */
  getAll(): Observable<ApiResponse<Ticket[]>> {
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];

    // Ordena por data (mais recente primeiro)
    const sorted = tickets.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Retorna com delay simulado para comportar-se como API real
    return of({ success: true, data: sorted }).pipe(delay(DELAY_MS));
  }

  /**
   * Retorna um ticket específico por ID
   * @param id - UUID do ticket a ser buscado
   * @returns Observable com o ticket ou erro se não encontrado
   */
  getById(id: string): Observable<ApiResponse<Ticket | null>> {
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const ticket = tickets.find((t) => t.id === id);

    if (!ticket) {
      return of({
        success: false,
        message: "Ticket não encontrado",
      }).pipe(delay(DELAY_MS));
    }

    return of({ success: true, data: ticket }).pipe(delay(DELAY_MS));
  }

  /**
   * Cria um novo ticket
   * @description Valida os dados, gera ID único e persiste no storage.
   * @param dto - Dados do novo ticket
   * @returns Observable com o ticket criado ou erro de validação
   * 
   * VALIDAÇÕES REALIZADAS:
   * 1. Título e descrição não podem estar vazios
   * 2. Título deve ter entre 3 e 100 caracteres
   * 3. Descrição deve ter entre 10 e 5000 caracteres
   * 4. Categoria deve ser válida (pertencer ao enum)
   * 5. Prioridade deve ser válida (pertencer ao enum)
   */
  create(dto: CreateTicketDTO): Observable<ApiResponse<Ticket>> {
    // Validação: campos obrigatórios
    if (!dto.title?.trim() || !dto.description?.trim()) {
      return of({
        success: false,
        message: "Título e descrição são obrigatórios.",
      }).pipe(delay(DELAY_MS));
    }

    // Validação: tamanho do título
    if (dto.title.length < 3 || dto.title.length > 100) {
      return of({
        success: false,
        message: "Título deve ter entre 3 e 100 caracteres.",
      }).pipe(delay(DELAY_MS));
    }

    // Validação: tamanho da descrição
    if (dto.description.length < 10 || dto.description.length > 5000) {
      return of({
        success: false,
        message: "Descrição deve ter entre 10 e 5000 caracteres.",
      }).pipe(delay(DELAY_MS));
    }

    // Validação: categoria válida
    if (!Object.values(TicketCategory).includes(dto.category)) {
      return of({
        success: false,
        message: "Categoria inválida.",
      }).pipe(delay(DELAY_MS));
    }

    // Validação: prioridade válida
    if (dto.priority && !Object.values(TicketPriority).includes(dto.priority)) {
      return of({
        success: false,
        message: "Prioridade inválida.",
      }).pipe(delay(DELAY_MS));
    }

    // Busca tickets existentes
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const now = new Date().toISOString();

    // Cria novo ticket com ID único (UUID v4)
    const newTicket: Ticket = {
      id: uuidv4(),
      title: dto.title.trim(),
      description: dto.description.trim(),
      category: dto.category,
      status: TicketStatus.OPEN, // Novo ticket sempre começa como "Aberto"
      priority: dto.priority || TicketPriority.MEDIUM,
      createdAt: now,
      updatedAt: now,
    };

    // Adiciona no início da lista (mais recente primeiro)
    const updated = [newTicket, ...tickets];

    // Tenta salvar no storage
    if (!this.storageService.set(STORAGE_KEY, updated)) {
      return of({
        success: false,
        message: "Erro ao salvar. Armazenamento cheio.",
      }).pipe(delay(DELAY_MS));
    }

    return of({
      success: true,
      data: newTicket,
      message: "Chamado criado com sucesso!",
    }).pipe(delay(DELAY_MS));
  }

  /**
   * Atualiza um ticket existente
   * @description Atualiza apenas os campos fornecidos no DTO.
   * @param id - ID do ticket a ser atualizado
   * @param dto - Campos a serem atualizados
   * @returns Observable com o ticket atualizado ou erro
   */
  update(id: string, dto: UpdateTicketDTO): Observable<ApiResponse<Ticket>> {
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const ticketIndex = tickets.findIndex((t) => t.id === id);

    // Verifica se o ticket existe
    if (ticketIndex === -1) {
      return of({
        success: false,
        message: "Ticket não encontrado.",
      }).pipe(delay(DELAY_MS));
    }

    const ticket = tickets[ticketIndex];

    // Atualiza título se fornecido
    if (dto.title !== undefined) {
      if (dto.title.length < 3 || dto.title.length > 100) {
        return of({
          success: false,
          message: "Título deve ter entre 3 e 100 caracteres.",
        }).pipe(delay(DELAY_MS));
      }
      ticket.title = dto.title.trim();
    }

    // Atualiza descrição se fornecida
    if (dto.description !== undefined) {
      if (dto.description.length < 10 || dto.description.length > 5000) {
        return of({
          success: false,
          message: "Descrição deve ter entre 10 e 5000 caracteres.",
        }).pipe(delay(DELAY_MS));
      }
      ticket.description = dto.description.trim();
    }

    // Atualiza categoria se fornecida
    if (dto.category !== undefined) {
      if (!Object.values(TicketCategory).includes(dto.category)) {
        return of({
          success: false,
          message: "Categoria inválida.",
        }).pipe(delay(DELAY_MS));
      }
      ticket.category = dto.category;
    }

    // Atualiza status se fornecido
    if (dto.status !== undefined) {
      if (!Object.values(TicketStatus).includes(dto.status)) {
        return of({
          success: false,
          message: "Status inválido.",
        }).pipe(delay(DELAY_MS));
      }
      ticket.status = dto.status;
    }

    // Atualiza timestamp
    ticket.updatedAt = new Date().toISOString();
    tickets[ticketIndex] = ticket;

    // Persiste alterações
    if (!this.storageService.set(STORAGE_KEY, tickets)) {
      return of({
        success: false,
        message: "Erro ao atualizar. Armazenamento cheio.",
      }).pipe(delay(DELAY_MS));
    }

    return of({
      success: true,
      data: ticket,
      message: "Chamado atualizado com sucesso!",
    }).pipe(delay(DELAY_MS));
  }

  /**
   * Deleta um ticket
   * @description Remove permanentemente um chamado do sistema.
   * @param id - ID do ticket a ser deletado
   * @returns Observable indicando sucesso ou erro
   */
  delete(id: string): Observable<ApiResponse<void>> {
    const tickets = this.storageService.get<Ticket[]>(STORAGE_KEY, []) || [];
    const ticketIndex = tickets.findIndex((t) => t.id === id);

    // Verifica se o ticket existe
    if (ticketIndex === -1) {
      return of({
        success: false,
        message: "Ticket não encontrado.",
      }).pipe(delay(DELAY_MS));
    }

    // Remove o ticket da lista
    tickets.splice(ticketIndex, 1);

    // Persiste alterações
    if (!this.storageService.set(STORAGE_KEY, tickets)) {
      return of({
        success: false,
        message: "Erro ao deletar. Armazenamento cheio.",
      }).pipe(delay(DELAY_MS));
    }

    return of({
      success: true,
      message: "Chamado deletado com sucesso!",
    }).pipe(delay(DELAY_MS));
  }

  /**
   * Busca tickets por termo
   * @description Filtra tickets que contenham o termo no título, descrição, categoria ou ID.
   * @param term - Termo de busca
   * @returns Observable com tickets filtrados
   * 
   * NOTA: A busca é case-insensitive (não diferencia maiúsculas/minúsculas)
   */
  search(term: string): Observable<ApiResponse<Ticket[]>> {
    return this.getAll().pipe(
      map((response) => {
        if (!response.success || !response.data) {
          return response;
        }

        const lowerTerm = term.toLowerCase();
        const filtered = response.data.filter(
          (ticket) =>
            ticket.title.toLowerCase().includes(lowerTerm) ||
            ticket.description.toLowerCase().includes(lowerTerm) ||
            ticket.category.toLowerCase().includes(lowerTerm) ||
            ticket.id.includes(lowerTerm)
        );

        return { ...response, data: filtered };
      })
    );
  }
}
