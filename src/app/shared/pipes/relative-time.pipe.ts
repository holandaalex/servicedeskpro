import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "relativeTime",
  standalone: true,
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date): string {
    try {
      const date = new Date(value);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "agora";
      if (diffMins < 60) return `há ${diffMins}m`;
      if (diffHours < 24) return `há ${diffHours}h`;
      if (diffDays < 7) return `há ${diffDays}d`;

      return date.toLocaleDateString("pt-BR");
    } catch (e) {
      return "Data inválida";
    }
  }
}
