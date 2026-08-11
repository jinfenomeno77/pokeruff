# Site PokerUFF

Crie um site mobile-first para gerenciamento de torneios presenciais de poker entre amigos chamado POKERUFF, com foco em simplicidade, clareza visual e controle em tempo real. No momento crie apenas o front-end com dados fake.

O sistema deve ter dois tipos de usuários:

Usuário comum (jogador)

Admin/Dealer (organizadores)

1. Página Inicial

Objetivo:

Apresentar o torneio e direcionar para inscrição.

Elementos:

Título do torneio

Texto explicativo (o que é, formato, público)

Botão principal: “Inscrever-se no próximo torneio”







Visão do usuário:

Qualquer visitante vê essa página

Se não estiver logado → botão leva para login/cadastro → Inscrição

Se estiver logado → botão leva direto para inscrição

2. Estrutura e FAQ

Objetivo:

Evitar dúvidas repetidas e padronizar regras

Conteúdo:

Estrutura de blinds (tabela organizada por níveis)

Tempo de cada blind

Intervalos programados

FAQ:

Qual o stack inicial?

Tem registro tardio?

Posso reentrar no torneio?

Qual a premiação?

Visão do usuário:

Todos podem acessar (sem login necessário)

3. Página de Torneios

Estrutura:

3.1 Próximo Torneio (destaque principal)

Nome do torneio

Data e horário

Buy-in

Número de inscritos

Botão: “Inscrever-se”

3.2 Lista de inscritos (visível após login)

Nome dos jogadores

Status:

“Aguardando confirmação”

“Confirmado”

⚠️ Ajuste estratégico importante:

 Evite mostrar stack aqui ainda — só depois do torneio começar.

3.3 Torneios passados

Lista com:

Nome do torneio

Data

Ranking final

Premiação

3.4 Botões de ferramentas

“Tournament Timer”

“Blind Timer”

4. Fluxo de Inscrição

Passo a passo:

Usuário cria conta / faz login

Clica em “Inscrever-se”

Realiza pagamento (simulado no front)

Status fica como: “Aguardando aprovação”

Após aprovação (admin):

Usuário passa para:

“Confirmado no torneio”

Aparece na lista oficial

Visão do usuário:

Consegue ver:

Status da inscrição

Lista de participantes

5. Página do Torneio (em andamento)

Essa é a parte mais crítica do sistema.

5.1 Informações gerais (todos conseguem ver)

Blind atual (ex: 100 / 200)

Próximo blind

Tempo restante do nível

Indicador de intervalo

5.2 Ranking em tempo real

Lista de jogadores ordenada por stack

Stack de cada jogador

Média de fichas do torneio

5.3 Atualização de stack (intervalos)

Usuário comum pode:

Apenas durante o intervalo, Inserir seu stack atual (input manual)

Sistema deve:

Reordenar ranking automaticamente

Atualizar média

6. Timer do Torneio

Funcionalidade:

Sistema de tempo progressivo com:

Contagem regressiva

Mudança automática de blinds

Pausa para intervalos

Visão do usuário comum:

Apenas visualiza:

tempo

blinds

Visão do Admin/Dealer:

Pode:

Iniciar torneio

Pausar tempo

Avançar ou voltar blinds

Pular para intervalo

Ajustar tempo manualmente

7. Página Admin / Dealer

Acesso:

Login restrito por email e senha

Funcionalidades:

7.1 Gerenciamento do torneio

Criar torneio

Editar:

buy-in

estrutura de blinds

tempo

7.2 Gestão de jogadores

Aprovar inscrições

Editar stack manualmente

Marcar jogador como:

eliminado

reentrada

7.3 Mesas

Criar mesas (ex: Mesa 1, Mesa 2)

Arrastar jogadores entre mesas

Balanceamento manual

7.4 Controle do torneio

Start do torneio

Controle total do timer

Reset geral (com confirmação)

8. Estados importantes do sistema

Definir claramente:

Torneio:

“Pré-inscrição”

“Confirmando jogadores”

“Em andamento”

“Finalizado”

Jogador:

“Inscrito”

“Confirmado”

“Eliminado”

“Reentrada ativa”

9. Considerações estratégicas (importante)

Alguns pontos do seu plano original precisam de ajuste:

3. Prioridade real (ordem ideal)

Inscrição + aprovação

Lista de jogadores

Timer funcional

Ranking simples

Admin básico

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pokeruff.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6aa4ac72-e335-4cc1-b296-d2a142357e01).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
