# Como Rodar o Projeto Localmente e na Internet

## 🖥️ Rodando Localmente

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm (geralmente instalado junto com o Node.js)

### Passos para rodar localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/historico-manutencao-termep.git
   cd historico-manutencao-termep
   ```

2. **Instale as dependências:**
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

3. **Crie um arquivo `.env.local` na raiz do projeto** e adicione sua chave da API Gemini:
   ```env
   VITE_GEMINI_API_KEY=sua_chave_da_api_aqui
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Abra [http://localhost:5173](http://localhost:5173)** no seu navegador para ver o resultado.

---

## 🌐 Fazendo Deploy na Internet

### Opção 1: Vercel (Recomendada)

1. **Crie uma conta no [Vercel](https://vercel.com/)**

2. **Instale a CLI do Vercel (opcional, mas útil):**
   ```bash
   npm install -g vercel
   ```

3. **Faça login (se usar a CLI):**
   ```bash
   vercel login
   ```

4. **Navegue até o diretório do projeto e execute:**
   ```bash
   vercel
   ```

5. **Configure as variáveis de ambiente no painel do Vercel:**
   - Vá para Settings → Environment Variables
   - Adicione a variável: `VITE_GEMINI_API_KEY` com o valor da sua chave da API

6. **O Vercel irá fazer o build e deploy automaticamente**

### Opção 2: Netlify

1. **Crie uma conta no [Netlify](https://netlify.com/)**

2. **Faça login e clique em "Add new site"**

3. **Escolha "Import an existing project"**

4. **Selecione o método de deploy (GitHub, GitLab, etc.)**

5. **Conecte-se ao seu repositório**

6. **Na configuração de build, defina:**
   - Build command: `npm run build`
   - Publish directory: `dist`

7. **Adicione as variáveis de ambiente:**
   - Vá para Site settings → Environment → Environment Variables
   - Adicione: `VITE_GEMINI_API_KEY` com o valor da sua chave da API

### Opção 3: GitHub Pages

1. **Modifique o `vite.config.ts` para incluir a base path (se necessário):**
   ```ts
   export default defineConfig({
     // outras configurações...
     base: '/seu-repositorio/'
   })
   ```

2. **Instale o plugin do GitHub Pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Adicione scripts ao `package.json`:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Execute o deploy:**
   ```bash
   npm run deploy
   ```

---

## ⚠️ Importante

### Segurança da API Key
- **Nunca exponha sua chave da API no código fonte**
- Sempre use variáveis de ambiente
- O arquivo `.gitignore` já está configurado para ignorar arquivos `.env*`
- Nunca commitar arquivos que contenham chaves de API

### Porta padrão do Vite
- O Vite executa na porta 5173 por padrão, não na 3000 como o Create React App
- Acesse o aplicativo em [http://localhost:5173](http://localhost:5173)

### Variáveis de ambiente
- Use `.env.local` para variáveis de ambiente no Vite (não `.env`)
- As variáveis devem ter o prefixo `VITE_` para serem acessíveis no client-side

---

## 🔧 Solução de Problemas

### Erro de memória durante a instalação (código 137)
Este erro ocorre em ambientes com pouca memória disponível. Tente executar o projeto em um ambiente local com mais recursos.

### Problemas com CORS
Se você encontrar problemas de CORS ao fazer requisições para APIs externas no ambiente de desenvolvimento, isso geralmente é resolvido automaticamente no ambiente de produção.

### Build falhando
Se o build falhar, verifique:
- Se todas as dependências estão instaladas corretamente
- Se as variáveis de ambiente estão configuradas corretamente
- Se não há erros de sintaxe no código