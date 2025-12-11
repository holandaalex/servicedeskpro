import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  DestroyRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TicketService } from "../../../../core/services/ticket.service";
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  VALIDATION_RULES,
} from "../../../../core/models/ticket.model";
import { ToastService } from "../../../../shared/services/toast.service";

@Component({
  selector: "app-ticket-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./ticket-form.component.html",
  styleUrls: ["./ticket-form.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService);

  isSubmitting = false;
  isLoading = false;
  notification: { type: "success" | "error"; message: string } | null = null;
  categories = Object.values(TicketCategory);
  priorities = Object.values(TicketPriority);
  statuses = Object.values(TicketStatus);
  isEditMode = false;
  ticketId: string | null = null;
  VALIDATION_RULES = VALIDATION_RULES;

  ticketForm = this.fb.group({
    title: [
      "",
      [
        Validators.required,
        Validators.minLength(VALIDATION_RULES.TITLE_MIN_LENGTH),
        Validators.maxLength(VALIDATION_RULES.TITLE_MAX_LENGTH),
      ],
    ],
    description: [
      "",
      [
        Validators.required,
        Validators.minLength(VALIDATION_RULES.DESCRIPTION_MIN_LENGTH),
        Validators.maxLength(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH),
      ],
    ],
    category: [TicketCategory.HARDWARE, Validators.required],
    priority: [TicketPriority.MEDIUM, Validators.required],
    status: [TicketStatus.OPEN, Validators.required],
  });

  ngOnInit(): void {
    // Verificar se é modo edição
    this.ticketId = this.route.snapshot.paramMap.get("id");
    if (this.ticketId) {
      this.isEditMode = true;
      this.loadTicket();
    }
  }

  loadTicket(): void {
    if (!this.ticketId) return;

    this.isLoading = true;
    this.ticketService
      .getById(this.ticketId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.ticketForm.patchValue({
              title: response.data.title,
              description: response.data.description,
              category: response.data.category,
              priority: response.data.priority,
              status: response.data.status,
            });
          } else {
            this.notification = {
              type: "error",
              message: response.message || "Chamado não encontrado",
            };
            this.toastService.error(response.message || "Chamado não encontrado");
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.notification = {
            type: "error",
            message: "Erro ao carregar o chamado",
          };
          this.toastService.error("Erro ao carregar o chamado");
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.ticketForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.ticketForm.get(field);
    if (!control || !control.errors) return "";

    if (control.hasError("required")) {
      return `${field === "title" ? "Título" : "Descrição"} é obrigatório.`;
    }
    if (control.hasError("minlength")) {
      const minLength = control.errors["minlength"].requiredLength;
      return `Mínimo ${minLength} caracteres.`;
    }
    if (control.hasError("maxlength")) {
      const maxLength = control.errors["maxlength"].requiredLength;
      return `Máximo ${maxLength} caracteres.`;
    }
    return "Campo inválido.";
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      this.notification = {
        type: "error",
        message:
          "Por favor, preencha todos os campos obrigatórios corretamente.",
      };
      this.toastService.warning("Preencha todos os campos obrigatórios.");
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.notification = null;
    this.cdr.markForCheck();

    const formValue = this.ticketForm.value;

    if (this.isEditMode && this.ticketId) {
      // Modo edição
      this.ticketService
        .update(this.ticketId, {
          title: formValue.title || undefined,
          description: formValue.description || undefined,
          category: formValue.category || undefined,
          priority: formValue.priority || undefined,
          status: formValue.status || undefined,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.handleSubmitResponse(response);
          },
          error: () => {
            this.notification = { type: "error", message: "Erro de conexão." };
            this.toastService.error("Erro de conexão com o servidor.");
            this.isSubmitting = false;
            this.cdr.markForCheck();
          },
        });
    } else {
      // Modo criação
      this.ticketService
        .create({
          title: formValue.title || "",
          description: formValue.description || "",
          category: formValue.category || TicketCategory.OTHER,
          priority: formValue.priority || TicketPriority.MEDIUM,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.handleSubmitResponse(response);
          },
          error: () => {
            this.notification = { type: "error", message: "Erro de conexão." };
            this.toastService.error("Erro de conexão com o servidor.");
            this.isSubmitting = false;
            this.cdr.markForCheck();
          },
        });
    }
  }

  private handleSubmitResponse(response: { success: boolean; message?: string }): void {
    if (response.success) {
      this.notification = {
        type: "success",
        message: response.message || "Salvo com sucesso!",
      };
      this.toastService.success(response.message || "Chamado salvo com sucesso!");
      this.cdr.markForCheck();

      // Redirecionar após 1s
      setTimeout(() => {
        this.router.navigate(["/"]);
      }, 1000);
    } else {
      this.notification = {
        type: "error",
        message: response.message || "Erro ao salvar.",
      };
      this.toastService.error(response.message || "Erro ao salvar o chamado.");
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }
}
