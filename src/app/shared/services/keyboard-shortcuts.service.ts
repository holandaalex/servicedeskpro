import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

@Injectable({ providedIn: "root" })
export class KeyboardShortcutsService {
  private router = inject(Router);
  
  private focusSearch$ = new Subject<void>();
  public onFocusSearch$ = this.focusSearch$.asObservable();

  private shortcuts: KeyboardShortcut[] = [
    {
      key: "n",
      description: "Novo chamado",
      action: () => this.router.navigate(["/tickets/new"]),
    },
    {
      key: "/",
      description: "Focar na busca",
      action: () => this.focusSearch$.next(),
    },
  ];

  handleKeydown(event: KeyboardEvent): void {
    // Ignorar se estiver em input, textarea ou select
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      // Permitir Escape para desfocar
      if (event.key === "Escape") {
        target.blur();
      }
      return;
    }

    // Ignorar se tiver modificadores (Ctrl, Alt, Meta)
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const shortcut = this.shortcuts.find((s) => s.key === event.key.toLowerCase());
    
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }

  getShortcuts(): KeyboardShortcut[] {
    return this.shortcuts;
  }
}

