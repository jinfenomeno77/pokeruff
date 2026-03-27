

## Timer em tempo real via Supabase Realtime

Sim, é possivel. A tabela `tournaments` já tem `current_blind_index` e `timer_running`. O plano é armazenar o estado do timer no banco e usar Supabase Realtime para sincronizar todos os clientes.

### Abordagem

O admin controla o timer. Quando ele dá play/pause/skip, o estado é salvo na tabela `tournaments`. Todos os clientes assinam mudanças nessa tabela via Realtime e calculam localmente o tempo restante.

**Dado-chave**: em vez de fazer "tick" no banco a cada segundo, salvamos `timer_seconds_left` (segundos restantes no momento da ação) e `timer_updated_at` (timestamp UTC). Cada cliente calcula: `timeLeft = timer_seconds_left - (agora - timer_updated_at)` quando `timer_running = true`.

---

### 1. Migration — adicionar colunas ao `tournaments`

```sql
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS timer_seconds_left integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timer_updated_at timestamptz DEFAULT now();

ALTER TABLE public.tournaments REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL` é necessário para o Realtime capturar updates corretamente.

### 2. Refatorar `BlindTimer` para modo sincronizado

O componente receberá uma nova prop `syncMode` com os dados do torneio. Quando ativado:

- **Admin (isAdmin=true)**: cada ação (play, pause, skip, reset) faz um `UPDATE` na tabela `tournaments` com os novos valores de `current_blind_index`, `timer_running`, `timer_seconds_left` e `timer_updated_at`.
- **Todos os clientes**: assinam `supabase.channel('tournament-timer').on('postgres_changes', ...)` filtrando pelo `id` do torneio. Ao receber update, recalculam o estado local.
- **Contagem local**: quando `timer_running=true`, um `setInterval` local decrementa `timeLeft` a cada segundo, partindo do valor calculado. Isso evita latência visível.

### 3. Atualizar `Tournaments.tsx`

- Na seção de torneio com `status = 'in-progress'`, renderizar o `BlindTimer` em modo sync (somente leitura, sem controles de admin).
- Assinar Realtime para o torneio ativo e passar os dados atualizados ao timer.

### 4. Atualizar `Admin.tsx`

- O `BlindTimer` no admin passa a gravar cada ação no banco em vez de apenas alterar estado local.
- Quando o admin clica "Iniciar Torneio", o status muda para `in-progress`, `timer_running = true`, `timer_seconds_left` = duração do nível 0, e `timer_updated_at = now()`.

### Resumo dos arquivos alterados

| Arquivo | Alteração |
|---|---|
| Migration SQL | Adiciona `timer_seconds_left`, `timer_updated_at`, replica identity |
| `src/components/BlindTimer.tsx` | Adiciona sync mode: escrita no DB (admin) + leitura via Realtime (todos) |
| `src/pages/Tournaments.tsx` | Mostra timer para torneios in-progress com subscription Realtime |
| `src/pages/Admin.tsx` | Passa props de sync para o BlindTimer |

