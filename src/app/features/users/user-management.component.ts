/**
 * @fileoverview Componente de Gestão de Usuários
 * @description Permite admins e supervisores gerenciarem usuários.
 *
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../shared/services/toast.service";
import {
  User,
  UserRole,
  UserStatus,
  AuthenticatedUser,
} from "../../core/models/user.model";
import { ConfirmModalComponent } from "../../shared/components/confirm-modal/confirm-modal.component";

@Component({
  selector: "app-user-management",
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            class="text-2xl font-bold text-slate-800 dark:text-white transition-colors"
          >
            Gestão de Usuários
          </h1>
          <p class="text-slate-500 dark:text-slate-400 transition-colors">
            Gerencie os usuários do sistema.
          </p>
        </div>

        <!-- Stats -->
        <div class="flex gap-3">
          <div
            class="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800"
          >
            <span class="font-bold">{{ pendingCount() }}</span> pendentes
          </div>
          <div
            class="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800"
          >
            <span class="font-bold">{{ activeCount() }}</span> ativos
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div
        class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4"
      >
        <!-- Search -->
        <div class="relative flex-grow">
          <div
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            [(ngModel)]="searchTerm"
            class="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        <!-- Status Filter -->
        <select
          [(ngModel)]="statusFilter"
          class="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-w-[140px]"
        >
          <option value="">Todos Status</option>
          <option *ngFor="let status of statuses" [value]="status">
            {{ status }}
          </option>
        </select>

        <!-- Role Filter -->
        <select
          [(ngModel)]="roleFilter"
          class="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-w-[140px]"
        >
          <option value="">Todos Perfis</option>
          <option *ngFor="let role of roles" [value]="role">
            {{ role }}
          </option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="space-y-4">
        <div
          *ngFor="let i of [1, 2, 3, 4, 5]"
          class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div
        *ngIf="!loading() && filteredUsers().length > 0"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead
              class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400"
            >
              <tr>
                <th class="px-6 py-4">Usuário</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Departamento</th>
                <th class="px-6 py-4">Perfil</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Cadastro</th>
                <th class="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr
                *ngFor="let user of filteredUsers()"
                class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <!-- User Info -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm"
                    >
                      {{ getInitials(user.name) }}
                    </div>
                    <span
                      class="font-medium text-slate-900 dark:text-white"
                      >{{ user.name }}</span
                    >
                  </div>
                </td>

                <!-- Email -->
                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {{ user.email }}
                </td>

                <!-- Department -->
                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {{ user.department || "-" }}
                </td>

                <!-- Role -->
                <td class="px-6 py-4">
                  <select
                    [value]="user.role"
                    (change)="onRoleChange($event, user.id)"
                    [disabled]="user.id === currentUser()?.id"
                    class="px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm disabled:opacity-50"
                    [class.cursor-not-allowed]="user.id === currentUser()?.id"
                  >
                    <option *ngFor="let role of roles" [value]="role">
                      {{ role }}
                    </option>
                  </select>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span
                    [class]="getStatusClass(user.status)"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    {{ user.status }}
                  </span>
                </td>

                <!-- Created At -->
                <td
                  class="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm"
                >
                  {{ user.createdAt | date : "dd/MM/yyyy" }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-1">
                    <!-- Approve -->
                    <button
                      *ngIf="user.status === 'Pendente'"
                      (click)="approveUser(user.id)"
                      class="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                      title="Aprovar usuário"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </button>

                    <!-- Block/Unblock -->
                    <button
                      *ngIf="
                        user.status !== 'Pendente' &&
                        user.id !== currentUser()?.id
                      "
                      (click)="toggleBlockUser(user)"
                      [class]="
                        user.status === 'Bloqueado'
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                          : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                      "
                      class="p-2 rounded-lg transition-colors"
                      [title]="
                        user.status === 'Bloqueado'
                          ? 'Desbloquear usuário'
                          : 'Bloquear usuário'
                      "
                    >
                      <svg
                        *ngIf="user.status !== 'Bloqueado'"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m4.9 4.9 14.2 14.2" />
                      </svg>
                      <svg
                        *ngIf="user.status === 'Bloqueado'"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </svg>
                    </button>

                    <!-- Delete -->
                    <button
                      *ngIf="user.id !== currentUser()?.id"
                      (click)="confirmDelete(user)"
                      class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Excluir usuário"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M3 6h18" />
                        <path
                          d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                        />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!loading() && filteredUsers().length === 0"
        class="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed"
      >
        <div
          class="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-slate-400"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-slate-800 dark:text-white">
          Nenhum usuário encontrado
        </h3>
        <p class="text-slate-500 dark:text-slate-400">
          Tente ajustar os filtros de busca.
        </p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <app-confirm-modal
      [isOpen]="showDeleteModal()"
      title="Excluir Usuário"
      [message]="
        'Tem certeza que deseja excluir o usuário ' +
        (userToDelete()?.name || '') +
        '? Esta ação não pode ser desfeita.'
      "
      confirmText="Excluir"
      cancelText="Cancelar"
      type="danger"
      (confirm)="deleteUser()"
      (cancel)="showDeleteModal.set(false)"
    ></app-confirm-modal>
  `,
})
export class UserManagementComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  users = signal<AuthenticatedUser[]>([]);
  loading = signal(true);
  searchTerm = "";
  statusFilter = "";
  roleFilter = "";

  showDeleteModal = signal(false);
  userToDelete = signal<AuthenticatedUser | null>(null);

  currentUser = this.authService.currentUser;

  statuses = Object.values(UserStatus);
  roles = Object.values(UserRole);

  pendingCount = signal(0);
  activeCount = signal(0);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.authService.getAllUsers().subscribe((users) => {
      this.users.set(users as AuthenticatedUser[]);
      this.pendingCount.set(
        users.filter((u) => u.status === UserStatus.PENDING).length
      );
      this.activeCount.set(
        users.filter((u) => u.status === UserStatus.ACTIVE).length
      );
      this.loading.set(false);
    });
  }

  filteredUsers(): AuthenticatedUser[] {
    return this.users().filter((user) => {
      const matchesSearch =
        !this.searchTerm ||
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        !this.statusFilter || user.status === this.statusFilter;

      const matchesRole = !this.roleFilter || user.role === this.roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  getStatusClass(status: UserStatus): string {
    const classes: Record<string, string> = {
      [UserStatus.PENDING]:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
      [UserStatus.ACTIVE]:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
      [UserStatus.INACTIVE]:
        "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
      [UserStatus.BLOCKED]:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    };
    return classes[status] || "";
  }

  onRoleChange(event: Event, userId: string): void {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value as UserRole;

    this.authService.updateUserRole(userId, newRole).subscribe((response) => {
      if (response.success) {
        this.toastService.success("Perfil atualizado com sucesso!");
        this.loadUsers();
      } else {
        this.toastService.error(response.message || "Erro ao atualizar perfil.");
      }
    });
  }

  approveUser(userId: string): void {
    this.authService
      .updateUserStatus(userId, UserStatus.ACTIVE)
      .subscribe((response) => {
        if (response.success) {
          this.toastService.success("Usuário aprovado com sucesso!");
          this.loadUsers();
        } else {
          this.toastService.error(response.message || "Erro ao aprovar usuário.");
        }
      });
  }

  toggleBlockUser(user: AuthenticatedUser): void {
    const newStatus =
      user.status === UserStatus.BLOCKED
        ? UserStatus.ACTIVE
        : UserStatus.BLOCKED;
    const action =
      newStatus === UserStatus.BLOCKED ? "bloqueado" : "desbloqueado";

    this.authService.updateUserStatus(user.id, newStatus).subscribe((response) => {
      if (response.success) {
        this.toastService.success(`Usuário ${action} com sucesso!`);
        this.loadUsers();
      } else {
        this.toastService.error(response.message || `Erro ao ${action.slice(0, -1)}ar usuário.`);
      }
    });
  }

  confirmDelete(user: AuthenticatedUser): void {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  deleteUser(): void {
    const user = this.userToDelete();
    if (user) {
      this.authService
        .updateUserStatus(user.id, UserStatus.INACTIVE)
        .subscribe((response) => {
          if (response.success) {
            this.toastService.success("Usuário excluído com sucesso!");
            this.loadUsers();
          } else {
            this.toastService.error(
              response.message || "Erro ao excluir usuário."
            );
          }
        });
    }
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }
}
