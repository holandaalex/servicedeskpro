import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
} from "../../../core/models/ticket.model";

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
  percentage?: number;
}

@Component({
  selector: "app-stats-cards",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      @for (stat of stats(); track stat.label) {
      <div
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm dark:shadow-slate-950/20 transition-all hover:shadow-md dark:hover:shadow-slate-950/30 card-hover"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1"
            >
              {{ stat.label }}
            </p>
            <p
              class="text-2xl font-bold text-slate-900 dark:text-white"
            >
              {{ stat.value }}
            </p>
            @if (stat.percentage !== undefined && totalTickets() > 0) {
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {{ stat.percentage | number : "1.0-0" }}% do total
            </p>
            }
          </div>
          <div
            class="p-2.5 rounded-xl"
            [class]="stat.bgColor"
          >
            @switch (stat.icon) {
              @case ('total') {
                <svg
                  class="w-5 h-5"
                  [class]="stat.color"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
              }
              @case ('open') {
                <svg
                  class="w-5 h-5"
                  [class]="stat.color"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              }
              @case ('progress') {
                <svg
                  class="w-5 h-5"
                  [class]="stat.color"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              }
              @case ('urgent') {
                <svg
                  class="w-5 h-5"
                  [class]="stat.color"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              }
            }
          </div>
        </div>
      </div>
      }
    </div>

    <!-- Progress Bar por Status -->
    <div
      class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm dark:shadow-slate-950/20 mb-6"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">
          Distribuição por Status
        </h3>
        <span class="text-xs text-slate-400 dark:text-slate-500">
          {{ totalTickets() }} chamados
        </span>
      </div>

      <!-- Stacked Progress Bar -->
      <div
        class="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex"
      >
        @if (totalTickets() > 0) {
          <div
            class="h-full bg-emerald-500 transition-all duration-500"
            [style.width.%]="getStatusPercentage('Aberto')"
            title="Abertos: {{ getStatusCount('Aberto') }}"
          ></div>
          <div
            class="h-full bg-amber-500 transition-all duration-500"
            [style.width.%]="getStatusPercentage('Em Andamento')"
            title="Em Andamento: {{ getStatusCount('Em Andamento') }}"
          ></div>
          <div
            class="h-full bg-blue-500 transition-all duration-500"
            [style.width.%]="getStatusPercentage('Resolvido')"
            title="Resolvidos: {{ getStatusCount('Resolvido') }}"
          ></div>
          <div
            class="h-full bg-slate-400 transition-all duration-500"
            [style.width.%]="getStatusPercentage('Fechado')"
            title="Fechados: {{ getStatusCount('Fechado') }}"
          ></div>
        }
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 mt-3">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span class="text-xs text-slate-600 dark:text-slate-400"
            >Aberto ({{ getStatusCount('Aberto') }})</span
          >
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-amber-500"></div>
          <span class="text-xs text-slate-600 dark:text-slate-400"
            >Em Andamento ({{ getStatusCount('Em Andamento') }})</span
          >
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-xs text-slate-600 dark:text-slate-400"
            >Resolvido ({{ getStatusCount('Resolvido') }})</span
          >
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-slate-400"></div>
          <span class="text-xs text-slate-600 dark:text-slate-400"
            >Fechado ({{ getStatusCount('Fechado') }})</span
          >
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card-hover {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .card-hover:hover {
        transform: translateY(-2px);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsCardsComponent {
  private _tickets = signal<Ticket[]>([]);

  @Input()
  set tickets(value: Ticket[]) {
    this._tickets.set(value);
  }

  totalTickets = computed(() => this._tickets().length);

  stats = computed<StatCard[]>(() => {
    const tickets = this._tickets();
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === TicketStatus.OPEN).length;
    const inProgress = tickets.filter(
      (t) => t.status === TicketStatus.IN_PROGRESS
    ).length;
    const urgent = tickets.filter(
      (t) => t.priority === TicketPriority.URGENT
    ).length;

    return [
      {
        label: "Total de Chamados",
        value: total,
        icon: "total",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
      },
      {
        label: "Abertos",
        value: open,
        icon: "open",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        percentage: total > 0 ? (open / total) * 100 : 0,
      },
      {
        label: "Em Andamento",
        value: inProgress,
        icon: "progress",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
        percentage: total > 0 ? (inProgress / total) * 100 : 0,
      },
      {
        label: "Urgentes",
        value: urgent,
        icon: "urgent",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        percentage: total > 0 ? (urgent / total) * 100 : 0,
      },
    ];
  });

  getStatusCount(status: string): number {
    return this._tickets().filter((t) => t.status === status).length;
  }

  getStatusPercentage(status: string): number {
    const total = this.totalTickets();
    if (total === 0) return 0;
    return (this.getStatusCount(status) / total) * 100;
  }
}

