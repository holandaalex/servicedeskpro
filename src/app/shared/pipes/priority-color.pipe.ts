import { Pipe, PipeTransform } from "@angular/core";

/**
 * Pipe para mapear prioridade para classes de cor Tailwind
 * Usa a prioridade do chamado para retornar classes de estilo
 */
@Pipe({
  name: "priorityColor",
  standalone: true,
})
export class PriorityColorPipe implements PipeTransform {
  transform(priority: string): string {
    // Mapeia prioridade para classes Tailwind de cor
    const colorMap: Record<string, string> = {
      Baixa: "bg-green-100 text-green-800 border-l-4 border-green-500",
      Média: "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500",
      Alta: "bg-orange-100 text-orange-800 border-l-4 border-orange-500",
      Urgente: "bg-red-100 text-red-800 border-l-4 border-red-500",
    };

    return (
      colorMap[priority] ||
      "bg-slate-100 text-slate-800 border-l-4 border-slate-500"
    );
  }
}
