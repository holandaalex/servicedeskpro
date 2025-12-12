/**
 * @fileoverview Componente de Login
 * @description Tela de autenticação do sistema com design responsivo.
 *
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../shared/services/toast.service";
import { ToastComponent } from "../../../shared/components/toast/toast.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastComponent],
  template: `
    <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <!-- Left Side - Branding (Desktop only) -->
      <div
        class="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden"
      >
        <!-- Background Pattern -->
        <div class="absolute inset-0">
          <div
            class="absolute top-20 left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"
          ></div>
          <div
            class="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl"
          ></div>
          <div
            class="absolute top-1/2 left-1/3 w-64 h-64 bg-slate-500/5 rounded-full blur-2xl"
          ></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          <!-- Logo -->
          <div class="flex items-center gap-4 mb-12">
            <img
              src="assets/images/logo.png"
              alt="ServiceDesk Pro"
              class="w-16 h-16 rounded-2xl shadow-lg"
            />
            <div>
              <h1 class="text-3xl font-bold text-white">ServiceDesk Pro</h1>
              <p class="text-slate-400">Sistema de Gerenciamento de Chamados</p>
            </div>
          </div>

          <!-- Features -->
          <div class="space-y-8">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-1">Segurança Corporativa</h3>
                <p class="text-slate-400">Controle de acesso por perfis e hierarquias de aprovação.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-400">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-1">Gestão de Equipes</h3>
                <p class="text-slate-400">Atribuição inteligente de chamados e acompanhamento em tempo real.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-400">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-1">Relatórios e Métricas</h3>
                <p class="text-slate-400">Dashboard com KPIs e exportação de dados em CSV.</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-16 pt-8 border-t border-slate-700/50">
            <p class="text-slate-500 text-sm">
              © {{ currentYear }} ServiceDesk Pro. Desenvolvido por
              <a href="https://alexholanda.com.br" target="_blank" class="text-slate-300 hover:text-white hover:underline transition-colors">
                Alexsander Barreto
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div class="w-full max-w-md">
          <!-- Mobile Header -->
          <div class="lg:hidden text-center mb-8">
            <img
              src="assets/images/logo.png"
              alt="ServiceDesk Pro"
              class="w-16 h-16 rounded-2xl shadow-lg mx-auto mb-4"
            />
            <h1 class="text-2xl font-bold text-slate-800 dark:text-white">ServiceDesk Pro</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">
              Sistema de Gerenciamento de Chamados
            </p>
          </div>

          <!-- Form Card -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-slate-800 dark:text-white">
                Bem-vindo de volta
              </h2>
              <p class="text-slate-500 dark:text-slate-400 mt-2">
                Digite suas credenciais para acessar
              </p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
              <!-- Email Field -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Email
                </label>
                <div class="relative">
                  <div
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    placeholder="seu@email.com"
                    autocomplete="email"
                    class="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  />
                </div>
                <p
                  *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  class="mt-2 text-sm text-red-500"
                >
                  Por favor, insira um email válido.
                </p>
              </div>

              <!-- Password Field -->
              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Senha
                </label>
                <div class="relative">
                  <div
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    class="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  />
                  <button
                    type="button"
                    (click)="togglePassword()"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                  >
                    <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" x2="22" y1="2" y2="22"/>
                    </svg>
                  </button>
                </div>
                <p
                  *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  class="mt-2 text-sm text-red-500"
                >
                  A senha é obrigatória.
                </p>
              </div>

              <!-- Remember Me -->
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="rememberMe"
                    class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-slate-600 dark:text-slate-400">
                    Lembrar de mim
                  </span>
                </label>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading()"
                class="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  *ngIf="isLoading()"
                  class="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isLoading() ? "Entrando..." : "Entrar" }}</span>
              </button>

              <!-- Register Link -->
              <p class="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
                Não tem uma conta?
                <a
                  routerLink="/register"
                  class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline"
                >
                  Cadastre-se
                </a>
              </p>
            </form>
          </div>

          <!-- Demo Credentials -->
          <div class="mt-6 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
              Credenciais de demonstração:
            </p>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                (click)="fillCredentials('admin@servicedesk.com', 'admin123')"
                class="text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <span class="block text-xs font-semibold text-red-600 dark:text-red-400">Admin</span>
                <span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">admin&#64;servicedesk.com</span>
              </button>
              <button
                type="button"
                (click)="fillCredentials('supervisor@servicedesk.com', 'super123')"
                class="text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <span class="block text-xs font-semibold text-purple-600 dark:text-purple-400">Supervisor</span>
                <span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">supervisor&#64;servicedesk.com</span>
              </button>
              <button
                type="button"
                (click)="fillCredentials('tecnico@servicedesk.com', 'tecnico123')"
                class="text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <span class="block text-xs font-semibold text-blue-600 dark:text-blue-400">Técnico</span>
                <span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">tecnico&#64;servicedesk.com</span>
              </button>
              <button
                type="button"
                (click)="fillCredentials('joao@empresa.com', 'user123')"
                class="text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <span class="block text-xs font-semibold text-slate-600 dark:text-slate-400">Usuário</span>
                <span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">joao&#64;empresa.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <app-toast></app-toast>
    </div>
  `,
  styles: [
    `
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  currentYear = new Date().getFullYear();
  showPassword = signal(false);
  isLoading = this.authService.isLoading;

  loginForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
    rememberMe: [false],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  fillCredentials(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe((response) => {
      if (response.success) {
        this.toastService.success(response.message || "Login realizado!");
        this.router.navigate(["/"]);
      } else {
        this.toastService.error(response.message || "Erro ao fazer login.");
      }
    });
  }
}
