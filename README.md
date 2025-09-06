# 📋 Doclify

> **Transforme suas ideias em documentação profissional de projetos**

Doclify é uma plataforma moderna e intuitiva para criação, gerenciamento e colaboração em documentos de projetos. Com uma interface elegante e fluxo de trabalho otimizado, você pode criar documentação técnica completa em minutos.

![Doclify Banner](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Doclify+-+Project+Documentation+Made+Easy)

## ✨ Funcionalidades

### 🎯 **Editor Inteligente de Projetos**

- **Informações Básicas**: Configure título, descrição e status do projeto
- **Gestão de Equipe**: Adicione membros com funções específicas
- **Definição de Objetivos**: Estabeleça metas, critérios de sucesso e restrições
- **Planejamento de Cronograma**: Crie marcos e defina metodologias
- **Stack Tecnológica**: Documente tecnologias, versões e arquitetura
- **Revisão Completa**: Visualize e finalize toda a documentação

### 🚀 **Recursos Avançados**

- ⚡ **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- 🎨 **Design Moderno**: Interface limpa e profissional
- 📊 **Dashboard Intuitivo**: Visão geral de todos os seus projetos
- 🔒 **Autenticação Segura**: Sistema completo de login e registro
- 💾 **Salvamento Automático**: Seus dados estão sempre seguros
- 📤 **Exportação**: Gere documentos em diversos formatos

## 🛠️ Tecnologias

### **Frontend**

- **Next.js 15** - Framework React de última geração
- **TypeScript** - Tipagem estática para maior confiabilidade
- **Tailwind CSS** - Estilização utilitária e responsiva
- **Shadcn/ui** - Componentes elegantes e acessíveis
- **React Hook Form** - Gerenciamento eficiente de formulários
- **Zod** - Validação robusta de schemas
- **Zustand** - Gerenciamento de estado simplificado

### **Backend & Infraestrutura**

- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional robusto
- **Autenticação JWT** - Segurança de ponta a ponta

### **Ferramentas de Desenvolvimento**

- **ESLint** - Análise estática de código
- **Prettier** - Formatação consistente
- **Husky** - Git hooks automatizados
- **Commitlint** - Padronização de commits

## 🚀 Instalação

### **Pré-requisitos**

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### **1. Clone o repositório**

```bash
git clone https://github.com/seu-usuario/doclify.git
cd doclify
```

### **2. Instale as dependências**

```bash
npm install
# ou
yarn install
```

### **3. Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### **4. Configure o banco de dados**

Execute o script SQL no seu projeto Supabase:

```bash
# O arquivo schema.sql está em supabase/schema.sql
```

### **5. Execute o projeto**

```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 📖 Como Usar

### **1. Criando sua Conta**

- Acesse a página de registro
- Preencha seus dados
- Confirme seu email

### **2. Criando um Novo Projeto**

1. No dashboard, clique em "Novo Projeto"
2. Siga o assistente passo a passo:
   - **Informações Básicas**: Nome e descrição
   - **Equipe**: Adicione membros e suas funções
   - **Objetivos**: Defina metas e critérios
   - **Cronograma**: Estabeleça prazos e marcos
   - **Tecnologias**: Documente sua stack
   - **Revisão**: Finalize e salve

### **3. Gerenciando Projetos**

- Visualize todos os projetos no dashboard
- Edite informações a qualquer momento
- Exporte documentação completa
- Compartilhe com sua equipe

## 🏗️ Estrutura do Projeto

```
doclify/
├── src/
│   ├── app/                 # Páginas da aplicação (App Router)
│   │   ├── auth/           # Páginas de autenticação
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── editor/         # Editor de projetos
│   │   └── projects/       # Listagem de projetos
│   ├── components/         # Componentes reutilizáveis
│   │   ├── dashboard/      # Componentes do dashboard
│   │   ├── editor/         # Componentes do editor
│   │   ├── forms/          # Formulários
│   │   ├── layout/         # Layout da aplicação
│   │   └── ui/             # Componentes base (Shadcn)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários e configurações
│   ├── stores/             # Gerenciamento de estado (Zustand)
│   ├── types/              # Definições TypeScript
│   └── utils/              # Funções utilitárias
├── supabase/
│   └── schema.sql          # Schema do banco de dados
└── public/                 # Arquivos estáticos
```

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### **Padrões de Commit**

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção

# Qualidade de Código
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint
npm run format       # Formata código com Prettier

# Verificações
npm run type-check   # Verifica tipos TypeScript
```

## 🐛 Reportando Bugs

Encontrou um bug? Ajude-nos a melhorar:

1. Verifique se já não existe uma [issue](https://github.com/seu-usuario/doclify/issues) similar
2. Crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Informações do ambiente

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Principal** - [Seu Nome](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) pela excelente framework
- [Supabase](https://supabase.com/) pela infraestrutura robusta
- [Shadcn/ui](https://ui.shadcn.com/) pelos componentes elegantes
- [Tailwind CSS](https://tailwindcss.com/) pelo sistema de design

---

<div align="center">
  <p>Feito com ❤️ para simplificar a documentação de projetos</p>
  <p>
    <a href="#top">⬆️ Voltar ao topo</a>
  </p>
</div>
