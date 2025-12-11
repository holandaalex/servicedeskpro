import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class StorageService {
  private readonly prefix = "sd_";
  private readonly maxStorageSize = 4; // MB

  set<T>(key: string, value: T): boolean {
    try {
      if (!this.hasStorageAvailable()) {
        console.warn("LocalStorage não disponível");
        return false;
      }

      const fullKey = this.prefix + key;
      const serialized = JSON.stringify(value);
      const sizeInMB = new Blob([serialized]).size / 1024 / 1024;

      if (sizeInMB > this.maxStorageSize) {
        console.error(`Dados muito grandes (${sizeInMB.toFixed(2)}MB)`);
        return false;
      }

      localStorage.setItem(fullKey, serialized);
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.code === 22) {
        console.error("LocalStorage cheio");
      } else {
        console.error("Erro ao salvar no storage:", e);
      }
      return false;
    }
  }

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      if (!this.hasStorageAvailable()) {
        return defaultValue ?? null;
      }

      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (e) {
      console.error("Erro ao ler do storage:", e);
      return defaultValue ?? null;
    }
  }

  remove(key: string): boolean {
    try {
      if (!this.hasStorageAvailable()) {
        return false;
      }

      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (e) {
      console.error("Erro ao remover do storage:", e);
      return false;
    }
  }

  clear(): boolean {
    try {
      if (!this.hasStorageAvailable()) {
        return false;
      }

      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.prefix))
        .forEach((key) => localStorage.removeItem(key));
      return true;
    } catch (e) {
      console.error("Erro ao limpar storage:", e);
      return false;
    }
  }

  getStorageUsage(): { used: number; available: number } {
    let used = 0;
    try {
      if (this.hasStorageAvailable()) {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(this.prefix)) {
            used += localStorage.getItem(key)?.length ?? 0;
          }
        });
      }
    } catch (e) {
      console.error("Erro ao calcular uso de storage:", e);
    }

    return {
      used: used / 1024 / 1024,
      available: this.maxStorageSize,
    };
  }

  private hasStorageAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
}
