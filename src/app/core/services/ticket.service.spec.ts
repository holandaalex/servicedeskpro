import { TestBed } from "@angular/core/testing";
import { TicketService } from "./ticket.service";
import { StorageService } from "./storage.service";
import { TicketCategory, TicketStatus, TicketPriority } from "../models/ticket.model";

describe("TicketService", () => {
  let service: TicketService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TicketService, StorageService],
    });
    service = TestBed.inject(TicketService);
    storageService = TestBed.inject(StorageService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getAll", () => {
    it("should return tickets sorted by creation date (newest first)", (done) => {
      service.getAll().subscribe((response) => {
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data?.length).toBeGreaterThan(0);

        // Verify sorting
        if (response.data && response.data.length > 1) {
          const dates = response.data.map((t) =>
            new Date(t.createdAt).getTime()
          );
          for (let i = 0; i < dates.length - 1; i++) {
            expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
          }
        }
        done();
      });
    });
  });

  describe("create", () => {
    it("should create a valid ticket", (done) => {
      const dto = {
        title: "Test Ticket",
        description: "This is a test ticket description",
        category: TicketCategory.HARDWARE,
        priority: TicketPriority.MEDIUM,
      };

      service.create(dto).subscribe((response) => {
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data?.title).toBe(dto.title);
        expect(response.data?.status).toBe(TicketStatus.OPEN);
        done();
      });
    });

    it("should reject invalid title", (done) => {
      const dto = {
        title: "A", // Too short
        description: "Valid description",
        category: TicketCategory.HARDWARE,
        priority: TicketPriority.MEDIUM,
      };

      service.create(dto).subscribe((response) => {
        expect(response.success).toBe(false);
        expect(response.message).toContain("entre 3");
        done();
      });
    });

    it("should reject invalid description", (done) => {
      const dto = {
        title: "Valid Title",
        description: "Short", // Too short
        category: TicketCategory.HARDWARE,
        priority: TicketPriority.MEDIUM,
      };

      service.create(dto).subscribe((response) => {
        expect(response.success).toBe(false);
        expect(response.message).toContain("entre 10");
        done();
      });
    });
  });

  describe("delete", () => {
    it("should delete an existing ticket", (done) => {
      // First get all tickets
      service.getAll().subscribe((initialResponse) => {
        const ticketToDelete = initialResponse.data?.[0];

        if (ticketToDelete) {
          service.delete(ticketToDelete.id).subscribe((deleteResponse) => {
            expect(deleteResponse.success).toBe(true);

            // Verify ticket is deleted
            service.getAll().subscribe((finalResponse) => {
              const stillExists = finalResponse.data?.some(
                (t) => t.id === ticketToDelete.id
              );
              expect(stillExists).toBeFalsy();
              done();
            });
          });
        } else {
          done();
        }
      });
    });

    it("should fail to delete non-existent ticket", (done) => {
      service.delete("non-existent-id").subscribe((response) => {
        expect(response.success).toBe(false);
        expect(response.message).toContain("não encontrado");
        done();
      });
    });
  });
});
