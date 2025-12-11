import { Pipe, PipeTransform } from "@angular/core";
import { TicketStatus } from "../../core/models/ticket.model";

@Pipe({
  name: "statusColor",
  standalone: true,
})
export class StatusColorPipe implements PipeTransform {
  transform(status: TicketStatus): string {
    const colors: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: "bg-green-100 text-green-700 border-green-200",
      [TicketStatus.IN_PROGRESS]:
        "bg-yellow-100 text-yellow-700 border-yellow-200",
      [TicketStatus.RESOLVED]: "bg-blue-100 text-blue-700 border-blue-200",
      [TicketStatus.CLOSED]: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  }
}
