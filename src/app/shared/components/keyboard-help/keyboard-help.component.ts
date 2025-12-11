import {
  Component,
  HostListener,
  inject,
  ChangeDetectionStrategy,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { KeyboardShortcutsService } from "../../services/keyboard-shortcuts.service";

@Component({
  selector: "app-keyboard-help",
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Help Button -->
    <button
      (click)="toggleHelp()"
      class="fixed bottom-4 left-4 z-50 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-lg border border-slate-200 dark:border-slate-700"
      [attr.aria-label]="isOpen() ? 'Fechar ajuda de atalhos' : 'Mostrar atalhos de teclado'"
      title="Atalhos de teclado (?)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
        <path d="M6 8h.001"></path>
        <path d="M10 8h.001"></path>
        <path d="M14 8h.001"></path>
        <path d="M18 8h.001"></path>
        <path d="M8 12h.001"></path>
        <path d="M12 12h.001"></path>
        <path d="M16 12h.001"></path>
        <path d="M7 16h10"></path>
      </svg>
    </button>

    <!-- Help Modal -->
    @if (isOpen()) {
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-help-title"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm"
        (click)="toggleHelp()"
      ></div>

      <!-- Modal Content -->
      <div
        class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700"
      >
        <div class="flex items-center justify-between mb-4">
          <h3
            id="keyboard-help-title"
            class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-accent"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
              <path d="M6 8h.001"></path>
              <path d="M10 8h.001"></path>
              <path d="M14 8h.001"></path>
              <path d="M18 8h.001"></path>
              <path d="M8 12h.001"></path>
              <path d="M12 12h.001"></path>
              <path d="M16 12h.001"></path>
              <path d="M7 16h10"></path>
            </svg>
            Atalhos de Teclado
          </h3>
          <button
            (click)="toggleHelp()"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Fechar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          @for (shortcut of shortcuts; track shortcut.key) {
          <div
            class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
          >
            <span class="text-slate-600 dark:text-slate-300">{{
              shortcut.description
            }}</span>
            <kbd
              class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-sm border border-slate-200 dark:border-slate-600"
            >
              {{ shortcut.key === "/" ? "/" : shortcut.key.toUpperCase() }}
            </kbd>
          </div>
          }
          <div
            class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700"
          >
            <span class="text-slate-600 dark:text-slate-300"
              >Sair do campo de texto</span
            >
            <kbd
              class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-sm border border-slate-200 dark:border-slate-600"
            >
              ESC
            </kbd>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-slate-600 dark:text-slate-300"
              >Mostrar esta ajuda</span
            >
            <kbd
              class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-sm border border-slate-200 dark:border-slate-600"
            >
              ?
            </kbd>
          </div>
        </div>

        <p class="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
          Pressione qualquer tecla fora de campos de texto
        </p>
      </div>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardHelpComponent {
  private shortcutsService = inject(KeyboardShortcutsService);

  isOpen = signal(false);
  shortcuts = this.shortcutsService.getShortcuts();

  @HostListener("window:keydown", ["$event"])
  handleKeydown(event: KeyboardEvent): void {
    // Ignorar se estiver em input
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      return;
    }

    // ? para mostrar ajuda
    if (event.key === "?" || (event.shiftKey && event.key === "/")) {
      event.preventDefault();
      this.toggleHelp();
      return;
    }

    // Escape para fechar
    if (event.key === "Escape" && this.isOpen()) {
      this.toggleHelp();
      return;
    }

    // Delegar outros atalhos ao serviço
    if (!this.isOpen()) {
      this.shortcutsService.handleKeydown(event);
    }
  }

  toggleHelp(): void {
    this.isOpen.update((v) => !v);
  }
}

