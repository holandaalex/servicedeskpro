import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

@Injectable({ providedIn: "root" })
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  success(message: string, duration = 4000): void {
    this.show({ message, type: "success", duration });
  }

  error(message: string, duration = 5000): void {
    this.show({ message, type: "error", duration });
  }

  warning(message: string, duration = 4000): void {
    this.show({ message, type: "warning", duration });
  }

  info(message: string, duration = 4000): void {
    this.show({ message, type: "info", duration });
  }

  private show(toast: Omit<Toast, "id">): void {
    const id = crypto.randomUUID();
    const newToast: Toast = { ...toast, id };

    this.toasts$.next([...this.toasts$.value, newToast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }
  }

  dismiss(id: string): void {
    this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts$.next([]);
  }
}

