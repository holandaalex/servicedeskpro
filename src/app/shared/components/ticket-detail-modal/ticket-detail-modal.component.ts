import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  Ticket,
  TicketStatus,
  TicketHistory,
  TicketComment,
  TicketAction,
} from "../../../core/models/ticket.model";
import {
  UserRole,
  AuthenticatedUser,
} from "../../../core/models/user.model";
import { AuthService } from "../../../core/services/auth.service";
import { StatusColorPipe } from "../../pipes/status-color.pipe";
import { PriorityColorPipe } from "../../pipes/priority-color.pipe";

@Component({
  selector: "app-ticket-detail-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, StatusColorPipe, PriorityColorPipe],
  template: `
    <!-- Backdrop -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'ticket-title-' + ticket?.id"
    >
      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        (click)="close.emit()"
      ></div>

      <!-- Modal Panel -->
      <div class="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          class="w-screen max-w-2xl transform transition-transform duration-300 ease-out"
          [class.translate-x-0]="isOpen"
          [class.translate-x-full]="!isOpen"
        >
          <div
            class="flex h-full flex-col bg-white dark:bg-slate-900 shadow-2xl"
          >
            <!-- Header -->
            <div
              class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span
                      class="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                    >
                      #{{ ticket?.id?.substring(0, 8) }}
                    </span>
                    <span
                      *ngIf="ticket?.status"
                      [class]="
                        'px-2 py-1 rounded-full text-xs font-medium ' +
                        (ticket!.status | statusColor)
                      "
                    >
                      {{ ticket!.status }}
                    </span>
                    <span
                      *ngIf="ticket?.priority"
                      [class]="
                        'px-2 py-1 rounded-full text-xs font-medium ' +
                        (ticket!.priority | priorityColor)
                      "
                    >
                      {{ ticket!.priority }}
                    </span>
                  </div>
                  <h2
                    [id]="'ticket-title-' + ticket?.id"
                    class="text-xl font-bold text-slate-900 dark:text-white truncate"
                  >
                    {{ ticket?.title }}
                  </h2>
                </div>
                <button
                  (click)="close.emit()"
                  class="ml-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Fechar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto">
              <!-- Tabs -->
              <div
                class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                <nav class="flex px-6" aria-label="Tabs">
                  <button
                    (click)="activeTab.set('details')"
                    [class]="
                      activeTab() === 'details'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                    "
                    class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  >
                    Detalhes
                  </button>
                  <button
                    (click)="activeTab.set('comments')"
                    [class]="
                      activeTab() === 'comments'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                    "
                    class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
                  >
                    Comentários
                    <span
                      *ngIf="ticket?.comments?.length"
                      class="bg-accent text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      {{ ticket?.comments?.length }}
                    </span>
                  </button>
                  <button
                    (click)="activeTab.set('history')"
                    [class]="
                      activeTab() === 'history'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                    "
                    class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
                  >
                    Histórico
                    <span
                      *ngIf="ticket?.history?.length"
                      class="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full"
                    >
                      {{ ticket?.history?.length }}
                    </span>
                  </button>
                </nav>
              </div>

              <!-- Tab Content -->
              <div class="p-6">
                <!-- Details Tab -->
                <div *ngIf="activeTab() === 'details'" class="space-y-6">
                  <!-- Descrição -->
                  <div>
                    <h3
                      class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Descrição do Problema
                    </h3>
                    <div
                      class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-700"
                    >
                      {{ ticket?.description }}
                    </div>
                  </div>

                  <!-- Informações -->
                  <div class="grid grid-cols-2 gap-4">
                    <div
                      class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
                    >
                      <span class="text-xs text-slate-400 dark:text-slate-500 block mb-1">
                        Categoria
                      </span>
                      <span class="text-slate-700 dark:text-slate-200 font-medium">
                        {{ ticket?.category }}
                      </span>
                    </div>
                    <div
                      class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
                    >
                      <span class="text-xs text-slate-400 dark:text-slate-500 block mb-1">
                        Criado em
                      </span>
                      <span class="text-slate-700 dark:text-slate-200 font-medium">
                        {{ ticket?.createdAt | date : "dd/MM/yyyy 'às' HH:mm" }}
                      </span>
                    </div>
                  </div>

                  <!-- Envolvidos -->
                  <div class="space-y-3">
                    <h3
                      class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Envolvidos
                    </h3>
                    <div class="grid grid-cols-2 gap-3">
                      <div
                        class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700"
                      >
                        <div
                          class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
                        >
                          <span class="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                            {{ ticket?.createdByName?.charAt(0)?.toUpperCase() }}
                          </span>
                        </div>
                        <div>
                          <span class="text-xs text-slate-400 dark:text-slate-500 block">
                            Solicitante
                          </span>
                          <span class="text-slate-700 dark:text-slate-200 font-medium text-sm">
                            {{ ticket?.createdByName || "N/A" }}
                          </span>
                        </div>
                      </div>
                      <div
                        class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700"
                      >
                        <div
                          [class]="
                            ticket?.assignedToName
                              ? 'w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'
                              : 'w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center'
                          "
                        >
                          <span
                            *ngIf="ticket?.assignedToName"
                            class="text-emerald-600 dark:text-emerald-400 font-semibold text-sm"
                          >
                            {{ ticket?.assignedToName?.charAt(0)?.toUpperCase() }}
                          </span>
                          <svg
                            *ngIf="!ticket?.assignedToName"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            class="text-slate-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </div>
                        <div>
                          <span class="text-xs text-slate-400 dark:text-slate-500 block">
                            Técnico Responsável
                          </span>
                          <span
                            [class]="
                              ticket?.assignedToName
                                ? 'text-slate-700 dark:text-slate-200 font-medium text-sm'
                                : 'text-slate-400 dark:text-slate-500 text-sm italic'
                            "
                          >
                            {{ ticket?.assignedToName || "Não atribuído" }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Resolução (se houver) -->
                  <div *ngIf="ticket?.resolution">
                    <h3
                      class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        class="text-emerald-500"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Resolução
                    </h3>
                    <div
                      class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap border border-emerald-100 dark:border-emerald-800"
                    >
                      {{ ticket?.resolution }}
                    </div>
                    <p
                      *ngIf="ticket?.resolvedByName"
                      class="text-xs text-slate-400 dark:text-slate-500 mt-2"
                    >
                      Resolvido por {{ ticket?.resolvedByName }} em
                      {{ ticket?.resolvedAt | date : "dd/MM/yyyy 'às' HH:mm" }}
                    </p>
                  </div>

                  <!-- Rejeição (se houver) -->
                  <div *ngIf="ticket?.rejectionReason">
                    <h3
                      class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        class="text-red-500"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      Motivo da Rejeição
                    </h3>
                    <div
                      class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-red-700 dark:text-red-300 whitespace-pre-wrap border border-red-100 dark:border-red-800"
                    >
                      {{ ticket?.rejectionReason }}
                    </div>
                  </div>
                </div>

                <!-- Comments Tab -->
                <div *ngIf="activeTab() === 'comments'" class="space-y-4">
                  <!-- Add Comment -->
                  <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Adicionar Comentário
                    </label>
                    <textarea
                      [(ngModel)]="newComment"
                      rows="3"
                      class="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all"
                      placeholder="Descreva o que foi feito, observações, próximos passos..."
                    ></textarea>
                    <div class="flex items-center justify-between mt-3">
                      <div class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="internal"
                          [(ngModel)]="isInternalComment"
                          class="rounded border-slate-300 dark:border-slate-600 text-accent focus:ring-accent"
                        />
                        <label
                          for="internal"
                          class="text-xs text-slate-500 dark:text-slate-400"
                        >
                          Comentário interno (não visível ao solicitante)
                        </label>
                      </div>
                      <button
                        (click)="addComment()"
                        [disabled]="!newComment.trim()"
                        class="px-4 py-2 bg-accent hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>

                  <!-- Comments List -->
                  <div *ngIf="ticket?.comments?.length; else noComments" class="space-y-3">
                    <div
                      *ngFor="let comment of ticket?.comments"
                      class="relative"
                    >
                      <div
                        [class]="
                          comment.isInternal
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                        "
                        class="rounded-xl p-4 border"
                      >
                        <div class="flex items-start gap-3">
                          <div
                            class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0"
                          >
                            <span class="text-slate-600 dark:text-slate-300 font-medium text-xs">
                              {{ comment.userName?.charAt(0)?.toUpperCase() }}
                            </span>
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                              <span class="font-medium text-slate-900 dark:text-white text-sm">
                                {{ comment.userName }}
                              </span>
                              <span class="text-xs text-slate-400 dark:text-slate-500">
                                {{ comment.userRole }}
                              </span>
                              <span
                                *ngIf="comment.isInternal"
                                class="text-xs bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full"
                              >
                                Interno
                              </span>
                            </div>
                            <p class="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">
                              {{ comment.content }}
                            </p>
                            <span class="text-xs text-slate-400 dark:text-slate-500 mt-2 block">
                              {{ comment.createdAt | date : "dd/MM/yyyy 'às' HH:mm" }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ng-template #noComments>
                    <div class="text-center py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        class="mx-auto text-slate-300 dark:text-slate-600 mb-3"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <p class="text-slate-400 dark:text-slate-500">
                        Nenhum comentário ainda
                      </p>
                    </div>
                  </ng-template>
                </div>

                <!-- History Tab -->
                <div *ngIf="activeTab() === 'history'">
                  <div *ngIf="ticket?.history?.length; else noHistory" class="relative">
                    <!-- Timeline -->
                    <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

                    <div class="space-y-4">
                      <div
                        *ngFor="let entry of ticket?.history"
                        class="relative pl-10"
                      >
                        <!-- Timeline dot -->
                        <div
                          [class]="getHistoryDotClass(entry.action)"
                          class="absolute left-2 top-1 w-5 h-5 rounded-full flex items-center justify-center"
                        >
                          <svg
                            *ngIf="entry.action === TicketAction.CREATED"
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <svg
                            *ngIf="entry.action === TicketAction.STATUS_CHANGED"
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <polyline points="9 11 12 14 22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          </svg>
                          <svg
                            *ngIf="entry.action === TicketAction.ASSIGNED"
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <svg
                            *ngIf="entry.action === TicketAction.APPROVED"
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <svg
                            *ngIf="entry.action === TicketAction.REJECTED"
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          <svg
                            *ngIf="entry.action === TicketAction.COMMENTED"
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <svg
                            *ngIf="entry.action === TicketAction.UPDATED"
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </div>

                        <!-- Content -->
                        <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                          <div class="flex items-center justify-between mb-1">
                            <span class="font-medium text-slate-900 dark:text-white text-sm">
                              {{ entry.userName }}
                            </span>
                            <span class="text-xs text-slate-400 dark:text-slate-500">
                              {{ entry.createdAt | date : "dd/MM/yyyy 'às' HH:mm" }}
                            </span>
                          </div>
                          <p class="text-slate-600 dark:text-slate-300 text-sm">
                            {{ entry.description }}
                          </p>
                          <div
                            *ngIf="entry.previousStatus && entry.newStatus"
                            class="flex items-center gap-2 mt-2"
                          >
                            <span
                              [class]="
                                'px-2 py-0.5 rounded text-xs font-medium ' +
                                (entry.previousStatus | statusColor)
                              "
                            >
                              {{ entry.previousStatus }}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              class="text-slate-400"
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                            <span
                              [class]="
                                'px-2 py-0.5 rounded text-xs font-medium ' +
                                (entry.newStatus | statusColor)
                              "
                            >
                              {{ entry.newStatus }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ng-template #noHistory>
                    <div class="text-center py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        class="mx-auto text-slate-300 dark:text-slate-600 mb-3"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <p class="text-slate-400 dark:text-slate-500">
                        Nenhum histórico disponível
                      </p>
                    </div>
                  </ng-template>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div
              class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            >
              <div class="flex items-center justify-between">
                <!-- Status Quick Change -->
                <div *ngIf="canChangeStatus()" class="flex items-center gap-2">
                  <label class="text-sm text-slate-500 dark:text-slate-400">
                    Alterar Status:
                  </label>
                  <select
                    [value]="ticket?.status"
                    (change)="onStatusChange($event)"
                    class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-accent transition-all"
                  >
                    <option *ngFor="let status of availableStatuses" [value]="status">
                      {{ status }}
                    </option>
                  </select>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 ml-auto">
                  <!-- Assumir -->
                  <button
                    *ngIf="canTakeOwnership()"
                    (click)="onTakeOwnership()"
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    Assumir
                  </button>

                  <!-- Aprovar -->
                  <button
                    *ngIf="canApprove()"
                    (click)="onApprove()"
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Aprovar
                  </button>

                  <!-- Rejeitar -->
                  <button
                    *ngIf="canApprove()"
                    (click)="showRejectForm.set(true)"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Rejeitar
                  </button>

                  <!-- Confirmar Resolução (Usuário) -->
                  <button
                    *ngIf="canConfirmResolution()"
                    (click)="onConfirmResolution()"
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Confirmar Resolução
                  </button>

                  <!-- Reabrir (Usuário) -->
                  <button
                    *ngIf="canConfirmResolution()"
                    (click)="onReopen()"
                    class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    Reabrir
                  </button>
                </div>
              </div>

              <!-- Reject Form (inline) -->
              <div
                *ngIf="showRejectForm()"
                class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600"
              >
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Motivo da Rejeição
                </label>
                <textarea
                  [(ngModel)]="rejectReason"
                  rows="2"
                  class="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all"
                  placeholder="Informe o motivo..."
                ></textarea>
                <div class="flex justify-end gap-2 mt-3">
                  <button
                    (click)="showRejectForm.set(false)"
                    class="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    (click)="onReject()"
                    [disabled]="!rejectReason.trim()"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    Confirmar Rejeição
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailModalComponent implements OnChanges {
  private authService = inject(AuthService);

  @Input() isOpen = false;
  @Input() ticket: Ticket | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<{ ticketId: string; status: TicketStatus }>();
  @Output() takeOwnership = new EventEmitter<string>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<{ ticketId: string; reason: string }>();
  @Output() confirmResolution = new EventEmitter<string>();
  @Output() reopen = new EventEmitter<string>();
  @Output() addCommentEvent = new EventEmitter<{
    ticketId: string;
    content: string;
    isInternal: boolean;
  }>();

  activeTab = signal<"details" | "comments" | "history">("details");
  showRejectForm = signal(false);

  newComment = "";
  isInternalComment = false;
  rejectReason = "";

  TicketStatus = TicketStatus;
  TicketAction = TicketAction;
  availableStatuses = Object.values(TicketStatus);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && this.isOpen) {
      this.activeTab.set("details");
      this.showRejectForm.set(false);
      this.newComment = "";
      this.rejectReason = "";
    }
  }

  get currentUser(): AuthenticatedUser | null {
    return this.authService.currentUser();
  }

  canChangeStatus(): boolean {
    const user = this.currentUser;
    if (!user || !this.ticket) return false;

    return (
      user.role === UserRole.TECHNICIAN ||
      user.role === UserRole.SUPERVISOR ||
      user.role === UserRole.ADMIN
    );
  }

  canTakeOwnership(): boolean {
    const user = this.currentUser;
    if (!user || !this.ticket) return false;

    const canTake =
      user.role === UserRole.TECHNICIAN ||
      user.role === UserRole.SUPERVISOR ||
      user.role === UserRole.ADMIN;

    return (
      canTake &&
      this.ticket.status === TicketStatus.OPEN &&
      !this.ticket.assignedTo
    );
  }

  canApprove(): boolean {
    const user = this.currentUser;
    if (!user || !this.ticket) return false;

    return (
      (user.role === UserRole.SUPERVISOR || user.role === UserRole.ADMIN) &&
      this.ticket.status === TicketStatus.PENDING_APPROVAL
    );
  }

  canConfirmResolution(): boolean {
    const user = this.currentUser;
    if (!user || !this.ticket) return false;

    return (
      this.ticket.createdBy === user.id &&
      this.ticket.status === TicketStatus.RESOLVED
    );
  }

  onStatusChange(event: Event): void {
    if (!this.ticket) return;
    const select = event.target as HTMLSelectElement;
    this.statusChange.emit({
      ticketId: this.ticket.id,
      status: select.value as TicketStatus,
    });
  }

  onTakeOwnership(): void {
    if (this.ticket) {
      this.takeOwnership.emit(this.ticket.id);
    }
  }

  onApprove(): void {
    if (this.ticket) {
      this.approve.emit(this.ticket.id);
    }
  }

  onReject(): void {
    if (this.ticket && this.rejectReason.trim()) {
      this.reject.emit({
        ticketId: this.ticket.id,
        reason: this.rejectReason,
      });
      this.showRejectForm.set(false);
      this.rejectReason = "";
    }
  }

  onConfirmResolution(): void {
    if (this.ticket) {
      this.confirmResolution.emit(this.ticket.id);
    }
  }

  onReopen(): void {
    if (this.ticket) {
      this.reopen.emit(this.ticket.id);
    }
  }

  addComment(): void {
    if (!this.ticket || !this.newComment.trim()) return;

    this.addCommentEvent.emit({
      ticketId: this.ticket.id,
      content: this.newComment,
      isInternal: this.isInternalComment,
    });

    this.newComment = "";
    this.isInternalComment = false;
  }

  getHistoryDotClass(action: TicketAction): string {
    const baseClass = "border-2 ";
    switch (action) {
      case TicketAction.CREATED:
        return baseClass + "bg-blue-100 border-blue-500 text-blue-600";
      case TicketAction.STATUS_CHANGED:
        return baseClass + "bg-purple-100 border-purple-500 text-purple-600";
      case TicketAction.ASSIGNED:
        return baseClass + "bg-emerald-100 border-emerald-500 text-emerald-600";
      case TicketAction.APPROVED:
        return baseClass + "bg-green-100 border-green-500 text-green-600";
      case TicketAction.REJECTED:
        return baseClass + "bg-red-100 border-red-500 text-red-600";
      case TicketAction.COMMENTED:
        return baseClass + "bg-amber-100 border-amber-500 text-amber-600";
      default:
        return baseClass + "bg-slate-100 border-slate-400 text-slate-600";
    }
  }
}

