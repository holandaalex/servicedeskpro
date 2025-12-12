/**
 * @fileoverview Componente de Registro
 * @description Tela de cadastro de novos usuários com design responsivo.
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
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../shared/services/toast.service";
import { ToastComponent } from "../../../shared/components/toast/toast.component";
import {
  DEPARTMENTS,
  USER_VALIDATION_RULES,
} from "../../../core/models/user.model";

@Component({
  selector: "app-register",
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
          <div class="absolute top-20 left-20 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div class="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-slate-500/5 rounded-full blur-2xl"></div>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-400">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-1">Cadastro Simples</h3>
                <p class="text-slate-400">Preencha seus dados e aguarde a aprovação do administrador.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-1">Acesso Seguro</h3>
                <p class="text-slate-400">Suas credenciais são protegidas com criptografia avançada.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-400">
                  <rect x="3" y="3" width="7" height="9"/>
                  <rect x="14" y="3" width="7" height="5"/>
                  <rect x="14" y="12" width="7" height="9"/>
                  <rect x="3" y="16" width="7" height="5"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-1">Acompanhe Chamados</h3>
                <p class="text-slate-400">Crie e acompanhe suas solicitações de suporte em tempo real.</p>
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

      <!-- Right Side - Register Form -->
      <div class="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
        <div class="w-full max-w-md">
          <!-- Mobile Header -->
          <div class="lg:hidden text-center mb-6">
            <img
              src="assets/images/logo.png"
              alt="ServiceDesk Pro"
              class="w-14 h-14 rounded-2xl shadow-lg mx-auto mb-3"
            />
            <h1 class="text-xl font-bold text-slate-800 dark:text-white">ServiceDesk Pro</h1>
          </div>

          <!-- Form Card -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-slate-800 dark:text-white">
                Criar nova conta
              </h2>
              <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                Preencha os dados para se cadastrar
              </p>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Name Field -->
              <div>
                <label for="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome completo <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input
                    id="name"
                    type="text"
                    formControlName="name"
                    placeholder="Seu nome completo"
                    autocomplete="name"
                    class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                    [class.border-red-500]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
                  />
                </div>
              </div>

              <!-- Email Field -->
              <div>
                <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                    class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                    [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  />
                </div>
              </div>

              <!-- Department & Phone Row -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="department" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Departamento
                  </label>
                  <select
                    id="department"
                    formControlName="department"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm appearance-none"
                  >
                    <option value="">Selecione</option>
                    <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
                  </select>
                </div>
                <div>
                  <label for="phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    formControlName="phone"
                    placeholder="(11) 99999-9999"
                    autocomplete="tel"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <!-- Password Fields Row -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Senha <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="password"
                      [type]="showPassword() ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="Mín. 6 caracteres"
                      autocomplete="new-password"
                      class="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                      [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                    />
                    <button
                      type="button"
                      (click)="togglePassword()"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" x2="22" y1="2" y2="22"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirmar <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    placeholder="Repita a senha"
                    autocomplete="new-password"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                    [class.border-red-500]="registerForm.get('confirmPassword')?.hasError('mismatch') && registerForm.get('confirmPassword')?.touched"
                  />
                </div>
              </div>

              <!-- Info Box -->
              <div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div class="flex gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                  <p class="text-xs text-amber-700 dark:text-amber-300">
                    Após o cadastro, sua conta ficará pendente até a aprovação do administrador.
                  </p>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="registerForm.invalid || isLoading()"
                class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <span>{{ isLoading() ? "Cadastrando..." : "Criar conta" }}</span>
              </button>

              <!-- Login Link -->
              <p class="text-center text-sm text-slate-600 dark:text-slate-400">
                Já tem uma conta?
                <a
                  routerLink="/login"
                  class="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Fazer login
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <app-toast></app-toast>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  currentYear = new Date().getFullYear();
  showPassword = signal(false);
  isLoading = this.authService.isLoading;
  departments = DEPARTMENTS;

  registerForm: FormGroup = this.fb.group(
    {
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(USER_VALIDATION_RULES.NAME_MIN_LENGTH),
          Validators.maxLength(USER_VALIDATION_RULES.NAME_MAX_LENGTH),
        ],
      ],
      email: ["", [Validators.required, Validators.email]],
      department: [""],
      phone: [""],
      password: [
        "",
        [
          Validators.required,
          Validators.minLength(USER_VALIDATION_RULES.PASSWORD_MIN_LENGTH),
        ],
      ],
      confirmPassword: ["", [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService.register(this.registerForm.value).subscribe((response) => {
      if (response.success) {
        this.toastService.success(response.message || "Cadastro realizado!");
        this.router.navigate(["/login"]);
      } else {
        this.toastService.error(response.message || "Erro ao cadastrar.");
      }
    });
  }
}
