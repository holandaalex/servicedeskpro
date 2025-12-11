import { Component, ChangeDetectionStrategy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeService } from "../core/services/theme.service";
import { ToastComponent } from "../shared/components/toast/toast.component";
import { KeyboardHelpComponent } from "../shared/components/keyboard-help/keyboard-help.component";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterLinkActive,
    ToastComponent,
    KeyboardHelpComponent,
  ],
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private themeService = inject(ThemeService);

  currentYear = new Date().getFullYear();
  isDark$ = this.themeService.isDark$;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
