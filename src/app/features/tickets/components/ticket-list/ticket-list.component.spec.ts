import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { TicketListComponent } from "./ticket-list.component";
import { TicketService } from "../../../../core/services/ticket.service";
import { ToastService } from "../../../../shared/services/toast.service";
import { of } from "rxjs";

describe("TicketListComponent", () => {
  let component: TicketListComponent;
  let fixture: ComponentFixture<TicketListComponent>;
  let ticketService: jasmine.SpyObj<TicketService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const ticketServiceSpy = jasmine.createSpyObj("TicketService", [
      "getAll",
      "delete",
      "update",
    ]);
    const toastServiceSpy = jasmine.createSpyObj("ToastService", [
      "success",
      "error",
      "warning",
      "info",
    ]);

    await TestBed.configureTestingModule({
      imports: [TicketListComponent, RouterTestingModule],
      providers: [
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    ticketService = TestBed.inject(
      TicketService
    ) as jasmine.SpyObj<TicketService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load tickets on init", () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: "1",
          title: "Test",
          description: "Test description",
          category: "Hardware" as any,
          status: "Aberto" as any,
          priority: "Média" as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    ticketService.getAll.and.returnValue(of(mockResponse));

    component.ngOnInit();

    expect(ticketService.getAll).toHaveBeenCalled();
  });

  it("should filter tickets by search term", () => {
    component.tickets = [
      {
        id: "1",
        title: "Hardware Issue",
        description: "Computer broken",
        category: "Hardware" as any,
        status: "Aberto" as any,
        priority: "Alta" as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Software Issue",
        description: "App not working",
        category: "Software" as any,
        status: "Em Andamento" as any,
        priority: "Média" as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    component.searchTerm = "Hardware";
    component.applyFilters();

    expect(component.filteredTickets.length).toBe(1);
    expect(component.filteredTickets[0].title).toContain("Hardware");
  });

  it("should filter tickets by status", () => {
    component.tickets = [
      {
        id: "1",
        title: "Ticket 1",
        description: "Description 1",
        category: "Hardware" as any,
        status: "Aberto" as any,
        priority: "Alta" as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Ticket 2",
        description: "Description 2",
        category: "Software" as any,
        status: "Em Andamento" as any,
        priority: "Média" as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    component.statusFilter = "Aberto" as any;
    component.applyFilters();

    expect(component.filteredTickets.length).toBe(1);
    expect(component.filteredTickets[0].status).toBe("Aberto");
  });

  it("should clear all filters", () => {
    component.searchTerm = "test";
    component.statusFilter = "Aberto" as any;
    component.priorityFilter = "Alta" as any;
    component.categoryFilter = "Hardware" as any;

    component.clearFilters();

    expect(component.searchTerm).toBe("");
    expect(component.statusFilter).toBe("");
    expect(component.priorityFilter).toBe("");
    expect(component.categoryFilter).toBe("");
  });

  it("should paginate results correctly", () => {
    const tickets = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Ticket ${i + 1}`,
      description: `Description ${i + 1}`,
      category: "Hardware" as any,
      status: "Aberto" as any,
      priority: "Média" as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    component.tickets = tickets;
    component.pageSize = 10;
    component.applyFilters();

    expect(component.totalPages).toBe(3);
    expect(component.paginatedTickets.length).toBe(10);

    component.goToPage(2);
    expect(component.currentPage).toBe(2);
    expect(component.paginatedTickets[0].id).toBe("11");
  });
});
