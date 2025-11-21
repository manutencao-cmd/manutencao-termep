
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

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/historico-manutencao-termep.git
   cd historico-manutencao-termep
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```
   
   **Observação para ambientes com pouca memória (como alguns ambientes de desenvolvimento online):**
   Se você encontrar erros de memória (código 137) durante a instalação, tente:
   ```bash
   # Configure o npm para usar menos recursos
   npm config set maxsockets 1
   npm config set progress false
   
   # Instale as dependências com menos paralelismo
   npm install --no-audit --no-fund --no-optional
   ```

3. Crie um arquivo `.env.local` na raiz do projeto e adicione sua chave da API Gemini:
   ```env
   VITE_GEMINI_API_KEY=sua_chave_da_api_aqui
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Abra [http://localhost:5173](http://localhost:5173) no seu navegador para ver o resultado.

## Scripts Disponíveis

No diretório do projeto, você pode executar:

### `npm run dev`
Executa o aplicativo no modo de desenvolvimento com Vite.
Abra [http://localhost:5173](http://localhost:5173) para visualizá-lo no navegador.

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

## Solução de Problemas

### Erro de memória durante a instalação (código 137)
Este erro ocorre em ambientes com pouca memória disponível. Tente executar o projeto em um ambiente local com mais recursos ou use um serviço de desenvolvimento em nuvem com mais RAM.

### Porta padrão do Vite
Por padrão, o Vite executa na porta 5173, não na 3000 como o Create React App. Certifique-se de acessar o aplicativo em [http://localhost:5173](http://localhost:5173).

### Variáveis de ambiente
Certifique-se de que o arquivo `.env.local` (e não `.env`) está sendo usado para variáveis de ambiente no Vite, e que ele está listado no `.gitignore` para segurança.
