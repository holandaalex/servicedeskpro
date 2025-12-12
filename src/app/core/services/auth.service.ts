/**
 * @fileoverview Serviço de Autenticação
 * @description Gerencia login, registro, logout e controle de sessão.
 * Implementa autenticação mock com LocalStorage para demonstração.
 *
 * @author Alexsander Barreto
 * @see https://alexholanda.com.br
 */

import { Injectable, signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, of, delay, map } from "rxjs";
import {
  User,
  AuthenticatedUser,
  UserRole,
  UserStatus,
  LoginDTO,
  RegisterDTO,
  AuthResponse,
  ROLE_PERMISSIONS,
  Permissions,
} from "../models/user.model";
import { environment } from "../../../environments/environment";

const STORAGE_KEYS = {
  USERS: `${environment.storagePrefix}users`,
  CURRENT_USER: `${environment.storagePrefix}current_user`,
  TOKEN: `${environment.storagePrefix}auth_token`,
};

const DELAY_MS = environment.networkDelay;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  // Signals para estado reativo
  private currentUserSignal = signal<AuthenticatedUser | null>(null);
  private isLoadingSignal = signal<boolean>(false);

  // Computed signals públicos
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);
  readonly permissions = computed<Permissions | null>(() => {
    const role = this.userRole();
    return role ? ROLE_PERMISSIONS[role] : null;
  });

  constructor(private router: Router) {
    this.initializeDefaultAdmin();
    this.loadStoredSession();
  }

  /**
   * Inicializa um usuário admin padrão se não existir nenhum usuário
   */
  private initializeDefaultAdmin(): void {
    const users = this.getStoredUsers();
    if (users.length === 0) {
      const defaultAdmin: User = {
        id: this.generateUUID(),
        name: "Administrador",
        email: "admin@servicedesk.com",
        password: this.hashPassword("admin123"),
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        department: "TI",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Criar também alguns usuários de exemplo
      const sampleUsers: User[] = [
        {
          id: this.generateUUID(),
          name: "Técnico Suporte",
          email: "tecnico@servicedesk.com",
          password: this.hashPassword("tecnico123"),
          role: UserRole.TECHNICIAN,
          status: UserStatus.ACTIVE,
          department: "TI",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: this.generateUUID(),
          name: "Supervisor TI",
          email: "supervisor@servicedesk.com",
          password: this.hashPassword("super123"),
          role: UserRole.SUPERVISOR,
          status: UserStatus.ACTIVE,
          department: "TI",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: this.generateUUID(),
          name: "João Silva",
          email: "joao@empresa.com",
          password: this.hashPassword("user123"),
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          department: "Comercial",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      this.saveUsers([defaultAdmin, ...sampleUsers]);
    }
  }

  /**
   * Carrega sessão armazenada (se existir)
   */
  private loadStoredSession(): void {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser) as AuthenticatedUser;
        // Verificar se o usuário ainda existe e está ativo
        const users = this.getStoredUsers();
        const validUser = users.find(
          (u) => u.id === user.id && u.status === UserStatus.ACTIVE
        );

        if (validUser) {
          this.currentUserSignal.set(this.sanitizeUser(validUser));
        } else {
          this.clearSession();
        }
      }
    } catch {
      this.clearSession();
    }
  }

  /**
   * Realiza login do usuário
   */
  login(dto: LoginDTO): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return of(null).pipe(
      delay(DELAY_MS),
      map(() => {
        const users = this.getStoredUsers();
        const user = users.find(
          (u) =>
            u.email.toLowerCase() === dto.email.toLowerCase() &&
            u.password === this.hashPassword(dto.password)
        );

        if (!user) {
          this.isLoadingSignal.set(false);
          return {
            success: false,
            message: "Email ou senha inválidos.",
          };
        }

        if (user.status === UserStatus.PENDING) {
          this.isLoadingSignal.set(false);
          return {
            success: false,
            message:
              "Sua conta está aguardando aprovação do administrador.",
          };
        }

        if (user.status === UserStatus.INACTIVE) {
          this.isLoadingSignal.set(false);
          return {
            success: false,
            message: "Sua conta está inativa. Entre em contato com o suporte.",
          };
        }

        if (user.status === UserStatus.BLOCKED) {
          this.isLoadingSignal.set(false);
          return {
            success: false,
            message: "Sua conta foi bloqueada. Entre em contato com o suporte.",
          };
        }

        // Atualizar último login
        user.lastLogin = new Date().toISOString();
        user.updatedAt = new Date().toISOString();
        this.updateUser(user);

        // Criar sessão
        const sanitizedUser = this.sanitizeUser(user);
        const token = this.generateToken(user);

        localStorage.setItem(
          STORAGE_KEYS.CURRENT_USER,
          JSON.stringify(sanitizedUser)
        );
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);

        this.currentUserSignal.set(sanitizedUser);
        this.isLoadingSignal.set(false);

        return {
          success: true,
          user: sanitizedUser,
          token,
          message: `Bem-vindo(a), ${user.name}!`,
        };
      })
    );
  }

  /**
   * Registra novo usuário
   */
  register(dto: RegisterDTO): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return of(null).pipe(
      delay(DELAY_MS),
      map(() => {
        const users = this.getStoredUsers();

        // Verificar se email já existe
        const existingUser = users.find(
          (u) => u.email.toLowerCase() === dto.email.toLowerCase()
        );

        if (existingUser) {
          this.isLoadingSignal.set(false);
          return {
            success: false,
            message: "Este email já está cadastrado.",
          };
        }

        // Validar senhas
        if (dto.password !== dto.confirmPassword) {
          this.isLoadingSignal.set(false);
          return {
            success: false,
            message: "As senhas não conferem.",
          };
        }

        // Criar novo usuário
        const newUser: User = {
          id: this.generateUUID(),
          name: dto.name.trim(),
          email: dto.email.toLowerCase().trim(),
          password: this.hashPassword(dto.password),
          role: UserRole.USER, // Novos usuários sempre começam como USER
          status: UserStatus.PENDING, // Aguardando aprovação
          department: dto.department?.trim(),
          phone: dto.phone?.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        users.push(newUser);
        this.saveUsers(users);

        this.isLoadingSignal.set(false);

        return {
          success: true,
          message:
            "Cadastro realizado com sucesso! Aguarde a aprovação do administrador.",
        };
      })
    );
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(["/login"]);
  }

  /**
   * Limpa a sessão atual
   */
  private clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    this.currentUserSignal.set(null);
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  hasPermission(permission: keyof Permissions): boolean {
    const perms = this.permissions();
    return perms ? perms[permission] : false;
  }

  /**
   * Verifica se o usuário tem um dos roles especificados
   */
  hasRole(...roles: UserRole[]): boolean {
    const currentRole = this.userRole();
    return currentRole ? roles.includes(currentRole) : false;
  }

  /**
   * Obtém todos os usuários (apenas para admins)
   */
  getAllUsers(): Observable<User[]> {
    return of(this.getStoredUsers()).pipe(
      delay(DELAY_MS),
      map((users) => users.map((u) => this.sanitizeUser(u) as User))
    );
  }

  /**
   * Atualiza status de um usuário (apenas para admins)
   */
  updateUserStatus(
    userId: string,
    status: UserStatus
  ): Observable<AuthResponse> {
    return of(null).pipe(
      delay(DELAY_MS),
      map(() => {
        const users = this.getStoredUsers();
        const userIndex = users.findIndex((u) => u.id === userId);

        if (userIndex === -1) {
          return { success: false, message: "Usuário não encontrado." };
        }

        users[userIndex].status = status;
        users[userIndex].updatedAt = new Date().toISOString();
        this.saveUsers(users);

        return { success: true, message: "Status atualizado com sucesso." };
      })
    );
  }

  /**
   * Atualiza role de um usuário (apenas para admins)
   */
  updateUserRole(userId: string, role: UserRole): Observable<AuthResponse> {
    return of(null).pipe(
      delay(DELAY_MS),
      map(() => {
        const users = this.getStoredUsers();
        const userIndex = users.findIndex((u) => u.id === userId);

        if (userIndex === -1) {
          return { success: false, message: "Usuário não encontrado." };
        }

        users[userIndex].role = role;
        users[userIndex].updatedAt = new Date().toISOString();
        this.saveUsers(users);

        return { success: true, message: "Perfil atualizado com sucesso." };
      })
    );
  }

  // ==================== Métodos Auxiliares ====================

  private getStoredUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private updateUser(user: User): void {
    const users = this.getStoredUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.saveUsers(users);
    }
  }

  private sanitizeUser(user: User): AuthenticatedUser {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  private hashPassword(password: string): string {
    // Simulação de hash - em produção usar bcrypt ou similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `hashed_${Math.abs(hash).toString(16)}`;
  }

  private generateToken(user: User): string {
    // Simulação de JWT - em produção usar biblioteca apropriada
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
    };
    return `mock_jwt_${btoa(JSON.stringify(payload))}`;
  }

  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}

