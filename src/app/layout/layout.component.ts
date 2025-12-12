/**
 * @fileoverview Layout Component
 * @description Componente de layout principal da aplicação.
 *
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

import { Component, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeService } from "../core/services/theme.service";
import { AuthService } from "../core/services/auth.service";
import { ToastComponent } from "../shared/components/toast/toast.component";
import { KeyboardHelpComponent } from "../shared/components/keyboard-help/keyboard-help.component";
import { UserRole } from "../core/models/user.model";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterLinkActive,
    ToastComponent,
    KeyboardHelpComponent,
  ],
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  currentYear = new Date().getFullYear();
  isDark$ = this.themeService.isDark$;

  // Usuário atual
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  permissions = this.authService.permissions;

  // Menu dropdown
  showUserMenu = signal(false);

  // Verificação de roles
  UserRole = UserRole;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleUserMenu(): void {
    this.showUserMenu.update((v) => !v);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      [UserRole.ADMIN]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      [UserRole.SUPERVISOR]: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      [UserRole.TECHNICIAN]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      [UserRole.USER]: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    };
    return colors[role] || colors[UserRole.USER];
  }

  canManageUsers(): boolean {
    return this.authService.hasPermission("canManageUsers") || 
           this.authService.hasRole(UserRole.ADMIN, UserRole.SUPERVISOR);
  }
}
