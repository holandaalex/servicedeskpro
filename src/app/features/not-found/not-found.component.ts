/**
 * @fileoverview Componente de página não encontrada (404)
 * @description Exibe uma página amigável quando o usuário acessa uma rota inexistente.
 * Oferece opções para voltar à página anterior ou ir para a home.
 * 
 * @author Alexsander Barreto
 */

import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-[60vh] flex items-center justify-center px-4">
      <div class="text-center">
        <!-- Ícone 404 animado -->
        <div class="mb-8">
          <div
            class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30"
          >
            <svg
              class="w-16 h-16 text-accent animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>

        <!-- Código de erro -->
        <h1
          class="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 mb-4"
        >
          404
        </h1>

        <!-- Título -->
        <h2
          class="text-2xl font-semibold text-slate-800 dark:text-white mb-2 transition-colors"
        >
          Página não encontrada
        </h2>

        <!-- Descrição -->
        <p
          class="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto transition-colors"
        >
          Ops! A página que você está procurando não existe ou foi movida.
          Verifique o endereço ou volte para a página inicial.
        </p>

        <!-- Botões de ação -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            (click)="goBack()"
            class="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Voltar
          </button>
          <a
            routerLink="/"
            class="px-6 py-3 rounded-xl bg-accent hover:bg-blue-600 text-white font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
            Ir para Home
          </a>
        </div>

        <!-- Dica adicional -->
        <p class="mt-8 text-sm text-slate-400 dark:text-slate-500 transition-colors">
          Precisa de ajuda?
          <a
            href="https://alexholanda.com.br"
            target="_blank"
            rel="noopener noreferrer"
            class="text-accent hover:underline"
          >
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  constructor(private location: Location) {}

  /**
   * Navega para a página anterior no histórico
   */
  goBack(): void {
    this.location.back();
  }
}

