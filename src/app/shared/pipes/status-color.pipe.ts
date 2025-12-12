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
      [TicketStatus.PENDING_APPROVAL]:
        "bg-amber-100 text-amber-700 border-amber-200",
      [TicketStatus.IN_PROGRESS]:
        "bg-blue-100 text-blue-700 border-blue-200",
      [TicketStatus.ON_HOLD]:
        "bg-orange-100 text-orange-700 border-orange-200",
      [TicketStatus.RESOLVED]:
        "bg-emerald-100 text-emerald-700 border-emerald-200",
      [TicketStatus.CLOSED]:
        "bg-slate-100 text-slate-600 border-slate-200",
      [TicketStatus.CANCELLED]:
        "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  }
}
