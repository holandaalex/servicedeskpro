import { Injectable } from "@angular/core";
import { Ticket } from "../../core/models/ticket.model";

@Injectable({ providedIn: "root" })
export class ExportService {
  /**
   * Exporta tickets para CSV e faz download
   */
  exportToCSV(tickets: Ticket[], filename = "chamados"): void {
    if (tickets.length === 0) {
      return;
    }

    const headers = [
      "ID",
      "Título",
      "Descrição",
      "Categoria",
      "Status",
      "Prioridade",
      "Data Criação",
      "Data Atualização",
    ];

    const rows = tickets.map((ticket) => [
      ticket.id,
      this.escapeCSV(ticket.title),
      this.escapeCSV(ticket.description),
      ticket.category,
      ticket.status,
      ticket.priority,
      this.formatDate(ticket.createdAt),
      this.formatDate(ticket.updatedAt),
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

    // Adicionar BOM para suporte a caracteres especiais no Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${this.getDateString()}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Escapa valores para CSV (adiciona aspas se necessário)
   */
  private escapeCSV(value: string): string {
    if (value.includes(";") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Formata data ISO para formato brasileiro
   */
  private formatDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
    } catch {
      return isoDate;
    }
  }

  /**
   * Gera string de data para nome do arquivo
   */
  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  }
}

