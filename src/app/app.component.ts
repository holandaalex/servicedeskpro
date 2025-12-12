/**
 * @fileoverview App Component
 * @description Componente raiz da aplicação.
 * Renderiza apenas o router-outlet - o layout é aplicado por rota.
 *
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ThemeService } from "./core/services/theme.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet></router-outlet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Inicializar tema - ThemeService carrega do localStorage ou system preference
  }
}
