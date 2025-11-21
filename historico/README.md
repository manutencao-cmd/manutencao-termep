
# Sistema de Gestão de Manutenção - Refatorado

Sistema de gestão de manutenção de frota integrado ao Google Sheets com análise de Inteligência Artificial (Gemini AI).

## Refatorações Realizadas

O projeto passou por uma série de refatorações para melhorar a arquitetura, manutenibilidade e desempenho:

### 1. Configuração do Projeto
- **Migração de Create React App para Vite**: Atualizado o `package.json` para usar scripts do Vite (`dev`, `build`, `preview`) ao invés de react-scripts
- **Atualização de dependências**: Removido `react-scripts` e adicionado dependências do Vite (`@vitejs/plugin-react`, `vite`, etc.)
- **Atualização do TypeScript**: Configurado `tsconfig.json` para padrões modernos do Vite

### 2. Arquitetura de Código
- **Criação de hooks personalizados**: 
  - `useAppData`: Gerencia o estado global de dados (equipamentos, técnicos, histórico, etc.)
  - `useRecordOperations`: Separa as operações de gravação/atualização com navegação
- **Separação de responsabilidades**: Lógica de dados movida para hooks, deixando o componente App mais limpo
- **Melhoria na estrutura de pastas**: Organização mais clara dos componentes, páginas e serviços

### 3. Melhorias no Serviço de Dados
- **Tipagem mais robusta**: Adicionado tipo `ApiResponse` para melhorar a segurança de tipos
- **Tratamento de erros aprimorado**: 
  - Melhor tratamento de timeouts de requisições
  - Validação mais rigorosa dos dados recebidos
  - Melhor fallback para dados mock
- **Segurança de requisições**: Adicionado timeout e headers adequados nas requisições
- **Tratamento de dados mais seguro**: Validação de tipos e formatação de datas mais robusta

### 4. Melhorias de Desempenho
- **Redução de re-renderizações**: Separação de lógica em hooks específicos
- **Carregamento mais eficiente**: Melhor organização das requisições de dados
- **Código mais otimizado**: Eliminação de duplicações e melhor estruturação

## Funcionalidades

- **Dashboard:** Visão geral de custos e status.
- **Lançamentos:** Registro detalhado de ordens de serviço.
- **Histórico:** Consulta completa com filtros avançados.
- **IA Gemini:** Assistente técnico para análise de falhas e correção de diagnósticos.
- **Integração:** Banco de dados via Google Sheets (Apps Script).

## Tecnologias

- React + TypeScript
- Vite 4
- Tailwind CSS
- Google Gemini API
- Recharts (Gráficos)
- Lucide React (Ícones)

## Como rodar

1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Crie um arquivo `.env` na raiz com sua chave API: `VITE_GEMINI_KEY=sua_chave_aqui`
4. Rode o projeto: `npm run dev`

## Scripts Disponíveis

No diretório do projeto, você pode executar:

### `npm run dev`
Executa o aplicativo no modo de desenvolvimento com Vite.
Abra [http://localhost:3000](http://localhost:3000) para visualizá-lo no navegador.

### `npm run build`
Constrói o aplicativo para produção na pasta `dist`.

### `npm run preview`
Visualiza localmente a versão de produção construída.

## Estrutura do Projeto

```
historico/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── hooks/              # Hooks personalizados
├── services/           # Serviços de API
├── context/            # Contextos do React
├── types/              # Tipos TypeScript
├── constants/          # Constantes globais
├── public/             # Arquivos públicos
├── App.tsx            # Componente principal
├── index.tsx          # Ponto de entrada
├── package.json       # Dependências e scripts
└── vite.config.ts     # Configuração do Vite
```
