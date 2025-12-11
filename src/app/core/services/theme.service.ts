import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

/**
 * Serviço para gerenciar o tema (claro/escuro) da aplicação
 * Persiste a preferência em localStorage
 * Aplica as mudanças ao DOM
 */
@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly STORAGE_KEY = "app-theme";

  private readonly isDarkSubject = new BehaviorSubject<boolean>(
    this.getInitialTheme()
  );
  public readonly isDark$: Observable<boolean> =
    this.isDarkSubject.asObservable();

  constructor() {
    this.applyTheme(this.isDarkSubject.value);
  }

  /**
   * Obtém o tema inicial:
   * 1. Do localStorage se salvo
   * 2. Do system preference (prefers-color-scheme)
   * 3. Padrão: light mode (false)
   */
  private getInitialTheme(): boolean {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch {
      console.warn("Erro ao ler tema do localStorage");
    }

    // Fallback: detectar preferência do sistema
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    return false;
  }

  /**
   * Alterna entre tema claro e escuro
   */
  toggleTheme(): void {
    const newTheme = !this.isDarkSubject.value;
    this.isDarkSubject.next(newTheme);
    this.persistTheme(newTheme);
    this.applyTheme(newTheme);
  }

  /**
   * Define um tema específico
   * @param isDark true para dark mode, false para light mode
   */
  setTheme(isDark: boolean): void {
    if (this.isDarkSubject.value !== isDark) {
      this.isDarkSubject.next(isDark);
      this.persistTheme(isDark);
      this.applyTheme(isDark);
    }
  }

  /**
   * Obtém o tema atual
   */
  getCurrentTheme(): boolean {
    return this.isDarkSubject.value;
  }

  /**
   * Persiste o tema em localStorage
   * @param isDark Tema a persistir
   */
  private persistTheme(isDark: boolean): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(isDark));
    } catch {
      console.warn("Erro ao salvar tema no localStorage");
    }
  }

  /**
   * Aplica o tema ao elemento root do HTML
   * @param isDark true para adicionar classe 'dark'
   */
  private applyTheme(isDark: boolean): void {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }
}
