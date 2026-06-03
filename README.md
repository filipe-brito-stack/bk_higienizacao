# Bk Higienização 🧼

> Um painel centralizado de gestão comercial e operacional (CRM) desenvolvido especificamente para o acompanhamento do ciclo de vida de serviços, gerenciamento de clientes e registro de históricos visuais e financeiros.

---

## 🚀 Sobre o Projeto

O **Bk Higienização** foi criado para otimizar e simplificar a operação de serviços de higienização. O sistema atua como um CRM dinâmico, permitindo que a equipe gerencie o relacionamento com os clientes, acompanhe o progresso de cada ordem de serviço e mantenha um histórico financeiro e visual (como fotos de "antes e depois") de forma centralizada e eficiente.

## 🛠️ Tecnologias Utilizadas

O projeto utiliza o que há de mais moderno no ecossistema de desenvolvimento web para garantir performance, tipagem estática e uma interface fluida:

* **[Next.js 15+](https://nextjs.org/)** & **[React 19](https://react.dev/)** – Framework e biblioteca para renderização robusta e otimizada.
* **[TypeScript](https://www.typescriptlang.org/)** – Tipagem estática para maior segurança e produtividade no código.
* **[Tailwind CSS v4](https://tailwindcss.com/)** – Estilização utilitária de última geração e alta performance.
* **[Tailwind Animates](https://github.com/jamiebuilds/tailwind-animate)** – Animações fluidas e nativas integradas ao Tailwind.
* **[Lucide React](https://lucide.dev/)** – Pacote de ícones limpos, consistentes e otimizados para React.
* **[Supabase](https://supabase.com/)** – Banco de dados e infraestrutura Backend-as-a-Service (BaaS).

---

## 📦 Funcionalidades Principais

* **Painel Centralizado (CRM):** Gestão completa do relacionamento e da carteira de clientes.
* **Ciclo de Vida de Serviços:** Acompanhamento em tempo real do status de cada atendimento (ex: agendado, em execução, finalizado).
* **Histórico Visual:** Armazenamento e registro fotográfico dos serviços prestados.
* **Controle Financeiro:** Registro simplificado de entradas, faturamento e pendências de pagamentos por serviço.

---

## 🔧 Configuração e Instalação

Para rodar este projeto localmente, siga os passos abaixo:

### Pré-requisitos
Certifique-se de ter o **Node.js** (versão recomendada para Next.js 15) instalado em sua máquina.

### 1. Clonar o repositório
```bash
git clone [https://github.com/seu-usuario/bk-higienizacao.git](https://github.com/seu-usuario/bk-higienizacao.git)
cd bk-higienizacao

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
`npm install`

2. Variaveis de Ambiente [.env.local](.env.local):
`NEXT_PUBLIC_SUPABASE_URL`=sua_url_do_supabase
`NEXT_PUBLIC_SUPABASE_ANON_KEY`=sua_chave_anonima_do_supabase

3. Run the app:
npm run dev

