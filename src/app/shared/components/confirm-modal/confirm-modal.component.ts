import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-confirm-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
    <div
      class="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'modal-title-' + modalId"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        (click)="onCancel()"
      ></div>

      <!-- Modal -->
      <div
        class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-slate-950/50 max-w-md w-full p-6 animate-scale-in border border-slate-200 dark:border-slate-700"
      >
        <!-- Icon -->
        <div
          class="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          [class]="iconBgClass"
        >
          @if (type === 'danger') {
          <svg
            class="w-7 h-7 text-red-600 dark:text-red-400"
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
          } @else if (type === 'warning') {
          <svg
            class="w-7 h-7 text-amber-600 dark:text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          } @else {
          <svg
            class="w-7 h-7 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          }
        </div>

        <!-- Title -->
        <h3
          [id]="'modal-title-' + modalId"
          class="text-lg font-semibold text-center text-slate-900 dark:text-white mb-2"
        >
          {{ title }}
        </h3>

        <!-- Message -->
        <p
          class="text-slate-600 dark:text-slate-400 text-center mb-6 text-sm leading-relaxed"
        >
          {{ message }}
        </p>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            type="button"
            (click)="onCancel()"
            class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            class="flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors"
            [class]="confirmButtonClass"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [
    `
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }

      .animate-scale-in {
        animation: scale-in 0.2s ease-out;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = "Confirmar ação";
  @Input() message = "Tem certeza que deseja continuar?";
  @Input() confirmText = "Confirmar";
  @Input() cancelText = "Cancelar";
  @Input() type: "danger" | "warning" | "info" = "info";

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  modalId = crypto.randomUUID();

  get iconBgClass(): string {
    const classes: Record<string, string> = {
      danger: "bg-red-100 dark:bg-red-900/30",
      warning: "bg-amber-100 dark:bg-amber-900/30",
      info: "bg-blue-100 dark:bg-blue-900/30",
    };
    return classes[this.type] || classes["info"];
  }

  get confirmButtonClass(): string {
    const classes: Record<string, string> = {
      danger: "bg-red-600 hover:bg-red-700 text-white",
      warning: "bg-amber-600 hover:bg-amber-700 text-white",
      info: "bg-blue-600 hover:bg-blue-700 text-white",
    };
    return classes[this.type] || classes["info"];
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

