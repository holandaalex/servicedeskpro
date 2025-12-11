import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { importProvidersFrom } from "@angular/core";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideAnimations()],
}).catch((err) => {
  console.error("Bootstrap error:", err);
  const loader = document.getElementById("app-loader");
  if (loader) {
    loader.innerHTML = `
      <div style="color:#dc2626; text-align:center; padding: 20px;">
        <h2 style="font-size: 1.25rem; font-weight: bold;">Erro de Inicialização</h2>
        <p style="margin-top: 10px;">${err.message}</p>
        <p style="font-size: 0.8rem; margin-top: 10px; color: #666;">Recarregue a página.</p>
      </div>
    `;
  }
});
