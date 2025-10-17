# Copilot Instructions for Agenda-

## Visão Geral
Este projeto é um sistema de agendamento médico web, desenvolvido em Node.js com Express, EJS para views, MongoDB (via Mongoose) para persistência e autenticação de usuários. O fluxo principal é: usuários se cadastram, fazem login e gerenciam agendamentos em um calendário interativo.

## Estrutura de Pastas
- `app.js`: Ponto de entrada, configura middlewares, rotas e conexão MongoDB.
- `controllers/`: Lógica de autenticação (`authController.js`) e agendamento (`agendamentoController.js`).
- `models/`: Schemas Mongoose para `User` e `Agendamento`.
- `routes/`: Rotas de autenticação e agendamento, separadas.
- `views/`: Templates EJS para páginas de login, cadastro, agenda, etc.
- `public/`: Arquivos estáticos (CSS, JS, imagens).

## Fluxo de Dados
- Usuário acessa `/`, faz login/cadastro.
- Após login, sessão salva `username`.
- Todas as rotas de agendamento exigem autenticação (middleware `verificarAutenticacao`).
- Agendamentos são filtrados por usuário (`usuario: req.session.username`).
- O frontend usa FullCalendar para exibir e manipular agendamentos via endpoints REST (`/api/agendamentos`).

## Convenções e Padrões
- Cada agendamento pertence a um usuário (campo `usuario` no modelo).
- Controllers retornam JSON para APIs e renderizam EJS para páginas.
- O frontend espera objetos de evento no formato `{ id, title, start }`.
- Senhas de usuários são sempre armazenadas com hash (bcrypt).
- O código utiliza async/await para operações assíncronas.
- O CSS está centralizado em `public/styles.css`.

## Comandos de Desenvolvimento
- Instale dependências: `npm install`
- Inicie o servidor: `node app.js` ou `npx nodemon app.js` (hot reload)
- O servidor roda por padrão em `http://localhost:3000`
- O MongoDB deve estar rodando localmente em `mongodb://localhost:27017/agendamentoDB`

## Pontos de Atenção
- Não há testes automatizados implementados.
- O sistema de autenticação é baseado em sessão Express.
- O calendário depende de endpoints REST para CRUD de agendamentos.
- O campo `usuario` é fundamental para isolar dados de cada usuário.
- O projeto não segue arquitetura MVC estrita, mas separa controllers, models e rotas.

## Exemplos de Integração
- Para adicionar um novo endpoint, siga o padrão dos arquivos em `routes/` e `controllers/`.
- Para adicionar campos ao agendamento, atualize o schema em `models/agendamento.js` e ajuste os controllers.

## Referências
- Veja `controllers/agendamentoController.js` para lógica de agendamento.
- Veja `controllers/authController.js` para autenticação.
- Veja `views/agendamentos.ejs` para integração do calendário com a API.

---
Adapte instruções conforme mudanças no fluxo ou arquitetura. Para dúvidas, consulte os controllers e rotas como referência principal.