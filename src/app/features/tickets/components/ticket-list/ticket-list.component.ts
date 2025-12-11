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
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, Subject } from "rxjs";
import { TicketService } from "../../../../core/services/ticket.service";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from "../../../../core/models/ticket.model";
import { StatusColorPipe } from "../../../../shared/pipes/status-color.pipe";
import { PriorityColorPipe } from "../../../../shared/pipes/priority-color.pipe";
import { ToastService } from "../../../../shared/services/toast.service";
import { ConfirmModalComponent } from "../../../../shared/components/confirm-modal/confirm-modal.component";
import { KeyboardShortcutsService } from "../../../../shared/services/keyboard-shortcuts.service";
import { StatsCardsComponent } from "../../../../shared/components/stats-cards/stats-cards.component";
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
  ],
  templateUrl: "./ticket-list.component.html",
  styleUrls: ["./ticket-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketListComponent implements OnInit, AfterViewInit {
  private ticketService = inject(TicketService);
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

  // Modal de confirmação
  showDeleteModal = false;
  ticketToDelete: string | null = null;

  // Ordenação
  sortColumn: string = "createdAt";
  sortDirection: "asc" | "desc" = "desc";

  // Expor Math para o template
  Math = Math;

  ngOnInit(): void {
    this.loadTickets();
    this.setupSearchDebounce();
    this.setupKeyboardShortcuts();
  }

  ngAfterViewInit(): void {
    // ViewChild disponível após a view ser inicializada
  }

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

  focusSearch(): void {
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.focus();
      this.searchInput.nativeElement.select();
    }
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // Exportar para CSV
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

  // Ordenação
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Alternar direção
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

    // Filtro de busca por texto
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term) ||
          t.id.includes(term)
      );
    }

    // Filtro por status
    if (this.statusFilter) {
      result = result.filter((t) => t.status === this.statusFilter);
    }

    // Filtro por prioridade
    if (this.priorityFilter) {
      result = result.filter((t) => t.priority === this.priorityFilter);
    }

    // Filtro por categoria
    if (this.categoryFilter) {
      result = result.filter((t) => t.category === this.categoryFilter);
    }

    // Aplicar ordenação
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
          // Ordenar por peso da prioridade
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

  // Paginação
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

  // Delete com modal
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

  /**
   * Handler para mudança de status via select
   */
  onStatusChange(event: Event, id: string): void {
    const select = event.target as HTMLSelectElement;
    this.updateStatus(id, select.value as TicketStatus);
  }

  /**
   * Atualiza o status de um chamado
   */
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
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastService.error("Erro ao atualizar status.");
          this.cdr.markForCheck();
        },
      });
  }
}
