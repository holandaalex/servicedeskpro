import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LayoutComponent } from "./layout/layout.component";
import { ThemeService } from "./core/services/theme.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, LayoutComponent, CommonModule],
  template: `
    <app-layout>
      <div class="page-transition" [@.disabled]="false">
        <router-outlet></router-outlet>
      </div>
    </app-layout>
  `,
  styles: [
    `
      .page-transition {
        animation: pageEnter 0.3s ease-out;
      }

      @keyframes pageEnter {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Inicializar tema - ThemeService carrega do localStorage ou system preference
    // Classe 'dark' é aplicada automaticamente ao html
  }
}
