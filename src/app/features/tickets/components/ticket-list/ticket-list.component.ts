import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  DestroyRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, Subject } from "rxjs";
import { TicketService } from "../../../../core/services/ticket.service";
import { AuthService } from "../../../../core/services/auth.service";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from "../../../../core/models/ticket.model";
import { UserRole, AuthenticatedUser } from "../../../../core/models/user.model";
import { StatusColorPipe } from "../../../../shared/pipes/status-color.pipe";
import { PriorityColorPipe } from "../../../../shared/pipes/priority-color.pipe";
import { ToastService } from "../../../../shared/services/toast.service";
import { ConfirmModalComponent } from "../../../../shared/components/confirm-modal/confirm-modal.component";
import { KeyboardShortcutsService } from "../../../../shared/services/keyboard-shortcuts.service";
import { StatsCardsComponent } from "../../../../shared/components/stats-cards/stats-cards.component";
import { TicketDetailModalComponent } from "../../../../shared/components/ticket-detail-modal/ticket-detail-modal.component";
import { ExportService } from "../../../../shared/services/export.service";

@Component({
  selector: "app-ticket-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StatusColorPipe,
    PriorityColorPipe,
    ConfirmModalComponent,
    StatsCardsComponent,
    TicketDetailModalComponent,
  ],
  templateUrl: "./ticket-list.component.html",
  styleUrls: ["./ticket-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketListComponent implements OnInit, AfterViewInit {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService);
  private keyboardService = inject(KeyboardShortcutsService);
  private exportService = inject(ExportService);

  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  paginatedTickets: Ticket[] = [];
  loading = true;
  error: string | null = null;

  // Usuário atual e permissões
  currentUser = this.authService.currentUser;
  UserRole = UserRole;
  TicketStatus = TicketStatus;

  // Filtros
  searchTerm = "";
  statusFilter: TicketStatus | "" = "";
  priorityFilter: TicketPriority | "" = "";
  categoryFilter: TicketCategory | "" = "";

  // Debounce para busca
  private searchSubject = new Subject<string>();

  // Opções de filtro
  statuses = Object.values(TicketStatus);
  priorities = Object.values(TicketPriority);
  categories = Object.values(TicketCategory);

  // Paginação
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Modais
  showDeleteModal = false;
  ticketToDelete: string | null = null;

  showRejectModal = signal(false);
  ticketToReject = signal<string | null>(null);
  rejectReason = "";

  showAssignModal = signal(false);
  ticketToAssign = signal<string | null>(null);
  technicians = signal<{ id: string; name: string }[]>([]);
  selectedTechnician = "";

  // Modal de detalhes
  showDetailModal = signal(false);
  selectedTicket = signal<Ticket | null>(null);

  // Ordenação
  sortColumn: string = "createdAt";
  sortDirection: "asc" | "desc" = "desc";

  // Expor Math para o template
  Math = Math;

  ngOnInit(): void {
    this.loadTickets();
    this.loadTechnicians();
    this.setupSearchDebounce();
    this.setupKeyboardShortcuts();
  }

  ngAfterViewInit(): void {}

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private setupKeyboardShortcuts(): void {
    this.keyboardService.onFocusSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.focusSearch();
      });
  }

  private loadTechnicians(): void {
    this.ticketService.getTechnicians().subscribe((techs) => {
      this.technicians.set(techs);
    });
  }

  // ==================== VERIFICAÇÕES DE PERMISSÃO ====================

  /**
   * Verifica se o usuário pode assumir um chamado
   */
  canTakeOwnership(ticket: Ticket): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Técnicos, Supervisores e Admins podem assumir
    const canTake =
      user.role === UserRole.TECHNICIAN ||
      user.role === UserRole.SUPERVISOR ||
      user.role === UserRole.ADMIN;

    // Só pode assumir chamados abertos sem atribuição
    const isAvailable =
      ticket.status === TicketStatus.OPEN && !ticket.assignedTo;

    return canTake && isAvailable;
  }

  /**
   * Verifica se o usuário pode aprovar/rejeitar um chamado
   */
  canApprove(ticket: Ticket): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Apenas Supervisores e Admins podem aprovar
    const canApprove =
      user.role === UserRole.SUPERVISOR || user.role === UserRole.ADMIN;

    // Só pode aprovar chamados aguardando aprovação
    return canApprove && ticket.status === TicketStatus.PENDING_APPROVAL;
  }

  /**
   * Verifica se o usuário pode atribuir um chamado
   */
  canAssign(ticket: Ticket): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Apenas Supervisores e Admins podem atribuir
    const canAssign =
      user.role === UserRole.SUPERVISOR || user.role === UserRole.ADMIN;

    // Pode atribuir chamados abertos ou reatribuir em andamento
    const canBeAssigned =
      ticket.status === TicketStatus.OPEN ||
      ticket.status === TicketStatus.IN_PROGRESS;

    return canAssign && canBeAssigned;
  }

  /**
   * Verifica se o usuário pode alterar o status
   */
  canChangeStatus(ticket: Ticket): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Usuários comuns não podem alterar status diretamente
    if (user.role === UserRole.USER) {
      // Exceto confirmar resolução (fechar) de seus próprios chamados
      return (
        ticket.createdBy === user.id &&
        ticket.status === TicketStatus.RESOLVED
      );
    }

    return true;
  }

  /**
   * Verifica se é o chamado do próprio usuário
   */
  isOwnTicket(ticket: Ticket): boolean {
    const user = this.currentUser();
    return user ? ticket.createdBy === user.id : false;
  }

  // ==================== AÇÕES ====================

  /**
   * Técnico assume um chamado
   */
  takeOwnership(ticketId: string): void {
    this.ticketService
      .takeOwnership(ticketId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success(response.message || "Chamado assumido!");
            this.loadTickets();
          } else {
            this.toastService.error(response.message || "Erro ao assumir chamado.");
          }
        },
        error: () => {
          this.toastService.error("Erro ao assumir chamado.");
        },
      });
  }

  /**
   * Aprovar chamado urgente
   */
  approveTicket(ticketId: string): void {
    this.ticketService
      .approve(ticketId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success(response.message || "Chamado aprovado!");
            this.loadTickets();
          } else {
            this.toastService.error(response.message || "Erro ao aprovar.");
          }
        },
        error: () => {
          this.toastService.error("Erro ao aprovar chamado.");
        },
      });
  }

  /**
   * Abrir modal de rejeição
   */
  openRejectModal(ticketId: string): void {
    this.ticketToReject.set(ticketId);
    this.rejectReason = "";
    this.showRejectModal.set(true);
  }

  /**
   * Confirmar rejeição
   */
  confirmReject(): void {
    const ticketId = this.ticketToReject();
    if (!ticketId || !this.rejectReason.trim()) {
      this.toastService.warning("Informe o motivo da rejeição.");
      return;
    }

    this.ticketService
      .reject(ticketId, this.rejectReason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success("Chamado rejeitado.");
            this.showRejectModal.set(false);
            this.loadTickets();
          } else {
            this.toastService.error(response.message || "Erro ao rejeitar.");
          }
        },
        error: () => {
          this.toastService.error("Erro ao rejeitar chamado.");
        },
      });
  }

  /**
   * Abrir modal de atribuição
   */
  openAssignModal(ticketId: string): void {
    this.ticketToAssign.set(ticketId);
    this.selectedTechnician = "";
    this.showAssignModal.set(true);
  }

  /**
   * Confirmar atribuição
   */
  confirmAssign(): void {
    const ticketId = this.ticketToAssign();
    if (!ticketId || !this.selectedTechnician) {
      this.toastService.warning("Selecione um técnico.");
      return;
    }

    const tech = this.technicians().find((t) => t.id === this.selectedTechnician);
    if (!tech) return;

    this.ticketService
      .assign(ticketId, tech.id, tech.name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success(response.message || "Chamado atribuído!");
            this.showAssignModal.set(false);
            this.loadTickets();
          } else {
            this.toastService.error(response.message || "Erro ao atribuir.");
          }
        },
        error: () => {
          this.toastService.error("Erro ao atribuir chamado.");
        },
      });
  }

  /**
   * Confirmar resolução (usuário fecha o chamado)
   */
  confirmResolution(ticketId: string): void {
    this.ticketService
      .update(ticketId, { status: TicketStatus.CLOSED })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success("Chamado fechado. Obrigado!");
            this.loadTickets();
          } else {
            this.toastService.error(response.message || "Erro ao fechar.");
          }
        },
        error: () => {
          this.toastService.error("Erro ao fechar chamado.");
        },
      });
  }

  /**
   * Handler para rejeição via modal de detalhes
   */
  onModalReject(event: { ticketId: string; reason: string }): void {
    this.ticketService
      .reject(event.ticketId, event.reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success("Chamado rejeitado.");
            this.closeDetailModal();
            this.loadTickets();
          } else {
            this.toastService.error(response.message || "Erro ao rejeitar.");
          }
        },
        error: () => {
          this.toastService.error("Erro ao rejeitar chamado.");
        },
      });
  }

  /**
   * Reabrir chamado (usuário diz que não foi resolvido)
   */
  reopenTicket(ticketId: string): void {
    this.ticketService
      .update(ticketId, { status: TicketStatus.IN_PROGRESS })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.info("Chamado reaberto para reanálise.");
            this.loadTickets();
          } else {
            this.toastService.error(response.message || "Erro ao reabrir.");
          }
        },
        error: () => {
          this.toastService.error("Erro ao reabrir chamado.");
        },
      });
  }

  // ==================== MODAL DE DETALHES ====================

  /**
   * Abre o modal de detalhes de um chamado
   */
  openDetailModal(ticketId: string): void {
    this.ticketService
      .getById(ticketId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.selectedTicket.set(response.data);
            this.showDetailModal.set(true);
            this.cdr.markForCheck();
          } else {
            this.toastService.error(response.message || "Erro ao carregar chamado.");
          }
        },
        error: () => {
          this.toastService.error("Erro ao carregar chamado.");
        },
      });
  }

  /**
   * Fecha o modal de detalhes
   */
  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedTicket.set(null);
  }

  /**
   * Handler para alteração de status via modal
   */
  onModalStatusChange(event: { ticketId: string; status: TicketStatus }): void {
    this.updateStatus(event.ticketId, event.status);
    this.closeDetailModal();
  }

  /**
   * Handler para adicionar comentário
   */
  onAddComment(event: { ticketId: string; content: string; isInternal: boolean }): void {
    this.ticketService
      .addComment(event.ticketId, event.content, event.isInternal)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success("Comentário adicionado!");
            // Recarrega o ticket para atualizar comentários
            this.refreshSelectedTicket();
          } else {
            this.toastService.error(response.message || "Erro ao adicionar comentário.");
          }
        },
        error: () => {
          this.toastService.error("Erro ao adicionar comentário.");
        },
      });
  }

  /**
   * Recarrega o ticket selecionado (para atualizar histórico/comentários)
   */
  private refreshSelectedTicket(): void {
    const currentTicket = this.selectedTicket();
    if (currentTicket) {
      this.ticketService
        .getById(currentTicket.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              this.selectedTicket.set(response.data);
              this.cdr.markForCheck();
            }
          },
        });
    }
  }

  // ==================== MÉTODOS EXISTENTES ====================

  focusSearch(): void {
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.focus();
      this.searchInput.nativeElement.select();
    }
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  exportToCSV(): void {
    if (this.filteredTickets.length === 0) {
      this.toastService.warning("Nenhum chamado para exportar.");
      return;
    }

    this.exportService.exportToCSV(this.filteredTickets, "chamados");
    this.toastService.success(
      `${this.filteredTickets.length} chamados exportados com sucesso!`
    );
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection = "asc";
    }
    this.applyFilters();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return "none";
    return this.sortDirection;
  }

  loadTickets(): void {
    this.loading = true;
    this.error = null;
    this.ticketService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.tickets = response.data;
            this.applyFilters();
          } else {
            this.error = response.message || "Erro desconhecido";
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = "Falha ao conectar com o serviço.";
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  applyFilters(): void {
    let result = this.tickets;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term) ||
          t.id.includes(term) ||
          t.createdByName?.toLowerCase().includes(term) ||
          t.assignedToName?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      result = result.filter((t) => t.status === this.statusFilter);
    }

    if (this.priorityFilter) {
      result = result.filter((t) => t.priority === this.priorityFilter);
    }

    if (this.categoryFilter) {
      result = result.filter((t) => t.category === this.categoryFilter);
    }

    result = this.sortTickets(result);
    this.filteredTickets = result;
    this.updatePagination();
    this.cdr.markForCheck();
  }

  private sortTickets(tickets: Ticket[]): Ticket[] {
    return [...tickets].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (this.sortColumn) {
        case "title":
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case "status":
          valueA = a.status;
          valueB = b.status;
          break;
        case "priority":
          const priorityOrder = { Urgente: 4, Alta: 3, Média: 2, Baixa: 1 };
          valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "category":
          valueA = a.category;
          valueB = b.category;
          break;
        case "createdAt":
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }

      if (valueA < valueB) return this.sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTickets.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedTickets = this.filteredTickets.slice(
      start,
      start + this.pageSize
    );
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = "";
    this.statusFilter = "";
    this.priorityFilter = "";
    this.categoryFilter = "";
    this.currentPage = 1;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.statusFilter ||
      this.priorityFilter ||
      this.categoryFilter
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  confirmDelete(id: string, event: Event): void {
    event.preventDefault();
    this.ticketToDelete = id;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  onDeleteConfirm(): void {
    if (!this.ticketToDelete) return;

    const id = this.ticketToDelete;
    this.showDeleteModal = false;
    this.ticketToDelete = null;

    this.ticketService
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.tickets = this.tickets.filter((t) => t.id !== id);
            this.applyFilters();
            this.toastService.success("Chamado deletado com sucesso!");
          } else {
            this.toastService.error(response.message || "Erro ao deletar");
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastService.error("Falha ao deletar o chamado.");
          this.cdr.markForCheck();
        },
      });
  }

  onDeleteCancel(): void {
    this.showDeleteModal = false;
    this.ticketToDelete = null;
    this.cdr.markForCheck();
  }

  onStatusChange(event: Event, id: string): void {
    const select = event.target as HTMLSelectElement;
    this.updateStatus(id, select.value as TicketStatus);
  }

  updateStatus(id: string, newStatus: TicketStatus): void {
    this.ticketService
      .update(id, { status: newStatus })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const ticket = this.tickets.find((t) => t.id === id);
            if (ticket) {
              ticket.status = newStatus;
              this.applyFilters();
            }
            this.toastService.success("Status atualizado com sucesso!");
          } else {
            this.toastService.error(
              response.message || "Erro ao atualizar status"
            );
            this.loadTickets(); // Recarrega para reverter
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastService.error("Erro ao atualizar status.");
          this.loadTickets();
          this.cdr.markForCheck();
        },
      });
  }
}
