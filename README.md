# RoboXperience Backend

Este repositório contém a API backend da plataforma **RoboXperience**, desenvolvida para gerenciar cursos educacionais com foco em Impressão 3D e Robótica/Circuitos com Arduino.

## 🚀 Tecnologias e Bibliotecas Utilizadas

- **Node.js** com **Express** (API REST)
- **TypeScript** (Tipagem estática e segurança)
- **Prisma ORM** (Integração e tipagem com banco de dados PostgreSQL)
- **PostgreSQL** (Banco de dados relacional)
- **AWS S3 / Cloudflare R2** (Upload e gerenciamento de arquivos como STL, PDFs, Imagens e Códigos)
- **JWT (JSON Web Tokens)** (Autenticação e Autorização)
- **Bcryptjs** (Criptografia de senhas)
- **Zod** (Validação de schemas de requisições)
- **Multer** e **Sharp** (Processamento e upload de mídias)
- **Helmet** e **Cors** (Segurança e controle de acesso)

## 🗂️ Arquitetura e Estrutura de Pastas

O projeto segue um padrão de arquitetura em camadas (Controllers, Services e Routes):

- `src/controllers/` - Lida com a entrada/saída HTTP das requisições (req, res).
- `src/services/` - Contém a lógica de negócios e as interações com o banco de dados (Prisma).
- `src/routes/` - Define os endpoints e os mapeia para os seus respectivos Controllers e Middlewares.
- `src/middlewares/` - Interceptadores (ex: `auth.middleware` para validar tokens JWT).
- `src/lib/` - Configurações de bibliotecas externas (ex: exportação do cliente Prisma).
- `prisma/` - Modelagem do banco de dados (`schema.prisma`) e migrações.

## ⚙️ Variáveis de Ambiente (.env)

Para rodar o projeto localmente, crie um arquivo `.env` na raiz do repositório baseado na seguinte estrutura:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/roboxperience?schema=public"

# Autenticação
JWT_SECRET="sua_chave_secreta_jwt_aqui"

# Armazenamento (S3 / R2)
R2_ACCESS_KEY_ID="sua_access_key"
R2_SECRET_ACCESS_KEY="sua_secret_key"
R2_ENDPOINT="seu_endpoint"
R2_BUCKET_NAME="nome_do_bucket"
R2_PUBLIC_URL="sua_url_publica"
```

## 🛠️ Como Instalar e Rodar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Gere o Prisma Client e sincronize com o banco de dados:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Inicie o servidor em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Para build de produção:**
   ```bash
   npm run build
   npm start
   ```

## 🔗 Principais Entidades e Domínio

- **User**: Gerenciamento de usuários e alunos (Admin ou Student).
- **Course**: Cursos da plataforma, incluindo nível de dificuldade (`difficulty`).
- **Module**: Agrupamento de aulas (módulos do curso).
- **Lesson**: Aulas do módulo, suportando vídeos do YouTube, arquivos PDF e STL.
- **Activity**: Atividades práticas vinculadas a uma aula (arquivos de código, imagens de circuitos e materiais).
- **Progress & ActivityProgress**: Registro de acompanhamento do aluno (horas assistidas e atividades completas).
- **Comment**: Sistema de comentários por aula, suportando respostas.

## 📄 Scripts Disponíveis

- `npm run dev`: Inicia o servidor localmente com hot-reload (`ts-node-dev`).
- `npm run build`: Compila o projeto TypeScript para JavaScript na pasta `dist/`.
- `npm start`: Inicia o servidor usando os arquivos compilados (Produção).
