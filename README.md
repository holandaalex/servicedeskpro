# ServiceDesk Pro - Sistema de Gerenciamento de Chamados Corporativos

![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Aplicação web moderna para gerenciamento de chamados de serviço (Help Desk), desenvolvida com foco em **UX**, **performance**, **acessibilidade** e **código limpo**. Projeto desenvolvido com fins educacionais, seguindo as melhores práticas de desenvolvimento front-end.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Executar](#-como-executar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Arquitetura](#-arquitetura)
- [Segurança](#-segurança)
- [SEO e Acessibilidade](#-seo-e-acessibilidade)
- [Testes](#-testes)
- [Melhorias Implementadas](#-melhorias-implementadas)
- [Atalhos de Teclado](#-atalhos-de-teclado)
- [Convenções de Código](#-convenções-de-código)
- [Autor](#-autor)

---

## 🎯 Sobre o Projeto

O **ServiceDesk Pro** é uma aplicação web responsiva para gerenciamento de chamados de serviço corporativos. Foi desenvolvido como projeto prático para demonstrar habilidades em desenvolvimento front-end moderno, utilizando Angular 17+ com Standalone Components.

### Objetivos do Projeto

- ✅ Interface funcional, acessível e organizada
- ✅ Visualizar e cadastrar chamados de serviço
- ✅ Totalmente responsivo (Desktop, Tablet, Mobile)
- ✅ Código limpo com boas práticas
- ✅ Comentários técnicos para fins educacionais

---

## 🚀 Funcionalidades

### Funcionalidades Principais

- **📋 Listagem de Chamados**: Visualização em tabela com ID, título, descrição, categoria, status e prioridade
- **➕ Criação de Chamados**: Formulário reativo com validação completa
- **✏️ Edição de Chamados**: Atualização de dados existentes
- **🗑️ Exclusão de Chamados**: Remoção com confirmação via modal customizado
- **🔍 Busca Inteligente**: Filtro em tempo real com debounce (300ms)
- **🎯 Filtros Avançados**: Por status, prioridade e categoria
- **📊 Ordenação**: Clique nos headers para ordenar colunas

### Funcionalidades Extras

- **📈 Dashboard**: Cards de estatísticas e barra de progresso por status
- **📥 Exportar CSV**: Download dos chamados filtrados
- **🌙 Tema Dark/Light**: Alternância com persistência
- **⌨️ Atalhos de Teclado**: Navegação rápida
- **📄 Paginação**: Navegação entre páginas de resultados
- **🔔 Notificações Toast**: Feedback visual de ações

### UX/UI

- **💀 Skeleton Loading**: Indicador visual durante carregamento
- **🎬 Animações**: Transições suaves e efeitos visuais
- **📱 Responsividade**: Mobile-first design
- **♿ Acessibilidade**: WCAG 2.1 compliance

---

## 🛠️ Tecnologias Utilizadas

### Core

| Tecnologia       | Versão | Descrição                                   |
| ---------------- | ------ | ------------------------------------------- |
| **Angular**      | 17.3+  | Framework principal (Standalone Components) |
| **TypeScript**   | 5.2    | Linguagem com tipagem estática              |
| **RxJS**         | 7.8    | Programação reativa                         |
| **Tailwind CSS** | 3.4    | Framework de utilitários CSS                |

### Bibliotecas Auxiliares

| Biblioteca         | Uso                                |
| ------------------ | ---------------------------------- |
| **UUID v4**        | Geração segura de IDs únicos       |
| **Reactive Forms** | Formulários reativos com validação |

### Justificativa das Escolhas Tecnológicas

#### Por que Tailwind CSS ao invés de PrimeNG/Material/Bootstrap?

O requisito original sugeria usar uma biblioteca de componentes como PrimeNG, Material ou Bootstrap. Optamos pelo **Tailwind CSS** pelos seguintes motivos:

1. **Flexibilidade Total**: Tailwind permite criar qualquer design sem estar limitado aos padrões visuais de bibliotecas prontas
2. **Performance Superior**: Gera apenas o CSS utilizado (PurgeCSS), resultando em bundles menores
3. **Responsividade Nativa**: Classes utilitárias mobile-first facilitam a criação de layouts responsivos
4. **Customização Completa**: Dark mode, cores e espaçamentos facilmente configuráveis
5. **Sem Overhead**: Não adiciona JavaScript desnecessário como bibliotecas de componentes
6. **Aprendizado**: Demonstra capacidade de criar componentes customizados do zero

> **Nota**: Todos os componentes (tabela, formulários, modais, toasts) foram construídos manualmente, demonstrando domínio de CSS e componentização Angular.

#### Por que Angular Standalone Components?

1. **Modernidade**: Padrão recomendado a partir do Angular 17
2. **Simplicidade**: Elimina a necessidade de NgModules
3. **Tree-shaking**: Melhor otimização no build
4. **Imports Explícitos**: Dependências claras em cada componente

---

## 💻 Como Executar

### Pré-requisitos

- **Node.js** 18+ instalado
- **npm** ou **yarn**

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/holandaalex/servicedeskpro

# Entrar na pasta
cd servicedeskpro

# Instalar dependências
npm install
```

### Execução

```bash
# Servidor de desenvolvimento (porta 4200)
npm run dev

# Build para produção
npm run build:prod

# Executar testes
npm run test
```

### Scripts Disponíveis

| Comando              | Descrição                          |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Inicia servidor de desenvolvimento |
| `npm run build`      | Build de desenvolvimento           |
| `npm run build:prod` | Build otimizado para produção      |
| `npm run test`       | Executa testes unitários           |

OBS: Foi feito um Deploy real no meu ambiente de produção particular e tá rodando normalmente em: https://cni.alexholanda.com.br

---

## 📁 Estrutura do Projeto

```
servicedesk-pro/
├── src/
│   ├── app/
│   │   ├── core/                    # Núcleo da aplicação
│   │   │   ├── models/              # Interfaces e tipos TypeScript
│   │   │   │   └── ticket.model.ts  # Modelo de dados do chamado
│   │   │   └── services/            # Serviços de negócio
│   │   │       ├── ticket.service.ts     # CRUD de chamados
│   │   │       ├── storage.service.ts    # Persistência localStorage
│   │   │       └── theme.service.ts      # Controle de tema
│   │   │
│   │   ├── features/                # Módulos de funcionalidades
│   │   │   └── tickets/
│   │   │       └── components/
│   │   │           ├── ticket-list/      # Listagem de chamados
│   │   │           └── ticket-form/      # Formulário de chamados
│   │   │
│   │   ├── shared/                  # Recursos compartilhados
│   │   │   ├── components/          # Componentes reutilizáveis
│   │   │   │   ├── toast/           # Notificações
│   │   │   │   ├── confirm-modal/   # Modal de confirmação
│   │   │   │   ├── stats-cards/     # Cards de estatísticas
│   │   │   │   └── keyboard-help/   # Ajuda de atalhos
│   │   │   ├── pipes/               # Pipes customizados
│   │   │   └── services/            # Serviços utilitários
│   │   │
│   │   ├── layout/                  # Layout principal
│   │   ├── app.component.ts         # Componente raiz
│   │   └── app.routes.ts            # Configuração de rotas
│   │
│   ├── environments/                # Configurações por ambiente
│   ├── styles.css                   # Estilos globais (Tailwind)
│   └── index.html                   # HTML principal (SEO)
│
├── angular.json                     # Configuração Angular CLI
├── tailwind.config.js               # Configuração Tailwind
├── tsconfig.json                    # Configuração TypeScript
└── package.json                     # Dependências e scripts
```

---

## 🏗️ Arquitetura

### Padrões Utilizados

1. **Feature-based Structure**: Organização por funcionalidades
2. **Smart/Dumb Components**: Separação de responsabilidades
3. **Service Layer**: Lógica de negócio isolada em serviços
4. **Reactive Programming**: RxJS para fluxos assíncronos
5. **OnPush Change Detection**: Otimização de performance

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│                      COMPONENTE                          │
│  (TicketListComponent / TicketFormComponent)            │
├─────────────────────────────────────────────────────────┤
│                          ↓ ↑                             │
│                    TICKET SERVICE                        │
│              (Lógica de negócio + Validação)            │
├─────────────────────────────────────────────────────────┤
│                          ↓ ↑                             │
│                   STORAGE SERVICE                        │
│                    (localStorage)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Segurança

### Medidas Implementadas

| Medida                    | Descrição                                     |
| ------------------------- | --------------------------------------------- |
| **Validação Dupla**       | Frontend (Reactive Forms) + Backend (Service) |
| **Sanitização XSS**       | Proteção nativa do Angular                    |
| **Limites de Caracteres** | Título: 3-100, Descrição: 10-5000             |
| **UUID v4**               | IDs seguros e únicos                          |
| **Quota de Storage**      | Limite de 4MB para localStorage               |

### Validações

```typescript
// Regras de validação centralizadas
export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 5000,
};
```

---

## 📊 SEO e Acessibilidade

### SEO

- ✅ Meta tags descritivas (title, description, keywords)
- ✅ Open Graph tags para redes sociais
- ✅ Twitter Card meta tags
- ✅ Canonical URL
- ✅ Robots meta tag
- ✅ Tema color para mobile

### Acessibilidade (WCAG 2.1)

- ✅ Labels em todos os campos de formulário
- ✅ ARIA attributes em elementos interativos
- ✅ Roles semânticos (alert, dialog, button)
- ✅ Focus visible em elementos focáveis
- ✅ Contraste de cores adequado
- ✅ Navegação por teclado completa
- ✅ Skip links para conteúdo principal

---

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes com coverage
ng test --code-coverage

# Testes headless (CI/CD)
npm test -- --no-watch --browsers=ChromeHeadless
```

### Cobertura de Testes

- ✅ TicketService (CRUD completo)
- ✅ StorageService (persistência)
- ✅ TicketListComponent (listagem e filtros)

---

## ✨ Melhorias Implementadas

### Versão 2.0 (Atual)

| Melhoria                    | Descrição                                  |
| --------------------------- | ------------------------------------------ |
| 🌙 **Dark Mode**            | Tema escuro com toggle e persistência      |
| 🔔 **Toast Notifications**  | Feedback visual para ações                 |
| 📊 **Dashboard**            | Cards de estatísticas e barra de progresso |
| 🔍 **Filtros Avançados**    | Status, prioridade, categoria              |
| 📄 **Paginação**            | Navegação entre páginas                    |
| 📥 **Exportar CSV**         | Download de dados                          |
| ↕️ **Ordenação**            | Headers clicáveis                          |
| ⌨️ **Atalhos de Teclado**   | Navegação rápida                           |
| 💀 **Skeleton Loading**     | Indicador visual de carregamento           |
| 🎬 **Animações**            | Transições e micro-interações              |
| 🗑️ **Modal de Confirmação** | Substituiu confirm() nativo                |
| ⏱️ **Debounce na Busca**    | 300ms para melhor performance              |

---

## ⌨️ Atalhos de Teclado

| Tecla | Ação                         |
| ----- | ---------------------------- |
| `N`   | Novo chamado                 |
| `/`   | Focar na busca               |
| `?`   | Mostrar ajuda                |
| `ESC` | Sair do campo / Fechar modal |

---

## 📝 Convenções de Código

### TypeScript

```typescript
// ✅ Usar inject() para injeção de dependências
private ticketService = inject(TicketService);

// ✅ Tipar sempre os retornos
getAll(): Observable<ApiResponse<Ticket[]>> { }

// ✅ Usar enums para valores fixos
export enum TicketStatus {
  OPEN = "Aberto",
  IN_PROGRESS = "Em Andamento",
}
```

### Componentes

```typescript
// ✅ Sempre usar OnPush para performance
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})

// ✅ Usar takeUntilDestroyed para subscriptions
this.service.getData()
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe();
```

### Templates

```html
<!-- ✅ Usar aria-label para acessibilidade -->
<button aria-label="Deletar chamado">
  <!-- ✅ Usar trackBy em *ngFor -->
  <tr *ngFor="let item of items; trackBy: trackById"></tr>
</button>
```

---

## 👨‍💻 Autor

<div align="center">

**Desenvolvido por Alexsander Barreto**

[![Website](https://img.shields.io/badge/Website-alexholanda.com.br-blue?style=for-the-badge&logo=google-chrome&logoColor=white)](https://alexholanda.com.br)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alexsanderholanda/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)]([https://github.com/holandaalex](https://github.com/holandaalex))

</div>

---

<div align="center">

_Projeto desenvolvido com foco em qualidade, segurança e performance._

**© 2025 ServiceDesk Pro. Todos os direitos reservados.**

</div>
