# 📊 Hierarquia de Usuários - ServiceDesk Pro

## Visão Geral

O sistema implementa uma hierarquia de 4 níveis com permissões granulares, projetada para ambientes corporativos.

---

## 👥 Perfis de Usuário

### 1. 👤 USUÁRIO (Solicitante)
**Quem é:** Colaborador que precisa de suporte técnico.

| Ação | Permissão |
|------|-----------|
| Criar chamado | ✅ Sim |
| Ver próprios chamados | ✅ Sim |
| Ver chamados de outros | ❌ Não |
| Editar próprio chamado | ✅ Apenas se status "Aberto" |
| Cancelar próprio chamado | ✅ Apenas se status "Aberto" |
| Alterar status | ❌ Não (exceto confirmar resolução) |
| Confirmar resolução | ✅ Sim (fecha o chamado) |
| Reabrir chamado | ❌ Não (solicitar ao supervisor) |

**Fluxo típico:**
1. Abre chamado descrevendo o problema
2. Acompanha status das atualizações
3. Confirma quando o problema foi resolvido

---

### 2. 🔧 TÉCNICO (Atendente)
**Quem é:** Profissional de TI que resolve os chamados.

| Ação | Permissão |
|------|-----------|
| Criar chamado | ✅ Sim |
| Ver chamados atribuídos a ele | ✅ Sim |
| Ver chamados não atribuídos | ✅ Sim (para assumir) |
| Ver todos os chamados | ❌ Não (apenas os relevantes) |
| Assumir chamado para si | ✅ Sim |
| Alterar status | ✅ Sim (exceto Aprovação) |
| Resolver chamado | ✅ Sim |
| Atribuir a outro técnico | ❌ Não |
| Deletar chamados | ❌ Não |

**Fluxo típico:**
1. Visualiza fila de chamados (atribuídos + não atribuídos)
2. Assume um chamado → Status muda para "Em Andamento"
3. Trabalha na solução
4. Marca como "Resolvido" com descrição da solução
5. Aguarda confirmação do usuário

---

### 3. 📋 SUPERVISOR (Gestor)
**Quem é:** Líder de equipe que gerencia técnicos e prioridades.

| Ação | Permissão |
|------|-----------|
| Criar chamado | ✅ Sim |
| Ver todos os chamados | ✅ Sim |
| Editar qualquer chamado | ✅ Sim |
| Aprovar chamados urgentes | ✅ Sim |
| Rejeitar chamados urgentes | ✅ Sim |
| Atribuir chamados a técnicos | ✅ Sim |
| Alterar prioridade | ✅ Sim |
| Reabrir chamados fechados | ✅ Sim |
| Deletar chamados | ✅ Sim |
| Ver relatórios | ✅ Sim |
| Gerenciar usuários | ❌ Não |

**Responsabilidades:**
1. Aprovar/rejeitar chamados de prioridade URGENTE
2. Distribuir chamados entre técnicos
3. Monitorar SLA e produtividade
4. Escalonar problemas críticos

---

### 4. ⚙️ ADMINISTRADOR (Admin)
**Quem é:** Gestor do sistema com acesso total.

| Ação | Permissão |
|------|-----------|
| Todas as ações de Supervisor | ✅ Sim |
| Gerenciar usuários | ✅ Sim |
| Aprovar novos cadastros | ✅ Sim |
| Alterar perfis de usuários | ✅ Sim |
| Bloquear/desbloquear usuários | ✅ Sim |
| Acessar configurações do sistema | ✅ Sim |

---

## 🔄 Fluxo de Status do Chamado

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   USUÁRIO cria chamado                                               │
│         │                                                            │
│         ▼                                                            │
│   ┌─────────────────┐                                                │
│   │     ABERTO      │◄─────────────────────────────────────────┐     │
│   └────────┬────────┘                                          │     │
│            │                                                   │     │
│            │ Se prioridade = URGENTE                           │     │
│            │ e usuário = SOLICITANTE                           │     │
│            ▼                                                   │     │
│   ┌─────────────────────┐                                      │     │
│   │ AGUARDANDO APROVAÇÃO│                                      │     │
│   └─────────┬───────────┘                                      │     │
│             │                                                  │     │
│    ┌────────┴────────┐                                         │     │
│    │                 │                                         │     │
│    ▼                 ▼                                         │     │
│ APROVADO          REJEITADO                                    │     │
│    │                 │                                         │     │
│    │                 ▼                                         │     │
│    │         ┌────────────┐                                    │     │
│    │         │ CANCELADO  │                                    │     │
│    │         └────────────┘                                    │     │
│    │                                                           │     │
│    ▼                                                           │     │
│   ┌─────────────────┐                                          │     │
│   │  EM ANDAMENTO   │◄─────────────────────────────┐           │     │
│   └────────┬────────┘                              │           │     │
│            │                                       │           │     │
│    ┌───────┴───────┐                               │           │     │
│    │               │                               │           │     │
│    ▼               ▼                               │           │     │
│ ┌──────────┐  ┌──────────┐                         │           │     │
│ │ EM ESPERA│  │ RESOLVIDO│                         │           │     │
│ └────┬─────┘  └────┬─────┘                         │           │     │
│      │             │                               │           │     │
│      │             │ Usuário confirma?             │           │     │
│      │             │                               │           │     │
│      │        ┌────┴────┐                          │           │     │
│      │        │         │                          │           │     │
│      │        ▼         ▼                          │           │     │
│      │    ┌────────┐  Reabre ──────────────────────┘           │     │
│      │    │ FECHADO│                                           │     │
│      │    └────┬───┘                                           │     │
│      │         │                                               │     │
│      │         │ Supervisor pode reabrir                       │     │
│      └─────────┴───────────────────────────────────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## ⏱️ SLA por Prioridade

| Prioridade | Tempo de Resposta | Tempo de Resolução | Aprovação Necessária |
|------------|-------------------|--------------------|----------------------|
| 🟢 Baixa | 48 horas | 5 dias úteis | Não |
| 🟡 Média | 24 horas | 3 dias úteis | Não |
| 🟠 Alta | 8 horas | 1 dia útil | Não |
| 🔴 Urgente | 2 horas | 8 horas | ✅ Supervisor |

---

## 📝 Histórico de Ações

Todas as ações são registradas automaticamente:

- Criação do chamado
- Alterações de status
- Atribuições de técnicos
- Aprovações/rejeições
- Resoluções
- Reabertura
- Fechamento

Cada registro inclui:
- Data/hora
- Usuário que executou
- Perfil do usuário
- Status anterior e novo
- Descrição da ação

---

## 🔐 Regras de Segurança

1. **Isolamento de dados:** Usuários só veem seus próprios chamados
2. **Validação de transição:** Status só pode mudar seguindo o fluxo permitido
3. **Auditoria completa:** Todo histórico é preservado
4. **Aprovação obrigatória:** Chamados urgentes de usuários requerem supervisor
5. **Proteção contra exclusão:** Apenas Admin/Supervisor podem deletar

---

## 📊 Métricas por Perfil

### Usuário
- Meus chamados abertos
- Meus chamados resolvidos

### Técnico
- Chamados em minha fila
- Taxa de resolução
- Tempo médio de atendimento

### Supervisor
- Total de chamados por status
- Chamados pendentes de aprovação
- Performance da equipe

### Administrador
- Todas as métricas
- Usuários ativos
- Logs de sistema

---

*Documentação criada para ServiceDesk Pro v1.0*

