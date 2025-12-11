import { TestBed } from "@angular/core/testing";
import { StorageService } from "./storage.service";

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService],
    });
    service = TestBed.inject(StorageService);
    // Clear storage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("set/get", () => {
    it("should store and retrieve data", () => {
      const testData = { id: 1, name: "Test" };

      const setSucess = service.set("test_key", testData);
      expect(setSucess).toBe(true);

      const retrieved = service.get<typeof testData>("test_key");
      expect(retrieved).toEqual(testData);
    });

    it("should return null for missing keys", () => {
      const result = service.get("non_existent");
      expect(result).toBeNull();
    });

    it("should return default value if provided", () => {
      const defaultValue = { default: true };
      const result = service.get("non_existent", defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe("remove", () => {
    it("should remove stored data", () => {
      service.set("to_remove", "value");
      expect(service.get("to_remove")).toBe("value");

      service.remove("to_remove");
      expect(service.get("to_remove")).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all service data", () => {
      service.set("key1", "value1");
      service.set("key2", "value2");

      service.clear();

      expect(service.get("key1")).toBeNull();
      expect(service.get("key2")).toBeNull();
    });
  });

  describe("getStorageUsage", () => {
    it("should calculate storage usage", () => {
      service.set("key1", { data: "test" });

      const usage = service.getStorageUsage();
      expect(usage.used).toBeGreaterThan(0);
      expect(usage.available).toBeGreaterThan(0);
    });
  });
});
