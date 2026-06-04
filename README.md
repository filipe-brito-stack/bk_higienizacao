# 📊 BK Higienização - CRM & Dashboard de Vendas

Este é um hub corporativo completo de Gestão de Vendas, Funil Metrificado (Kanban), Agenda de Tarefas e Cadastro de Clientes de alto padrão para a **BK Higienização**. 

O sistema conta com um ecossistema offline-first inteligente, mantendo estados locais reativos e uma sincronização contínua de duas vias com o banco de dados **Supabase** via sincronização peródica nativa.

---

## 🛠️ Tecnologias Principais

- **Framework**: [Next.js](https://nextjs.org/) (App Router com TypeScript)
- **Estilização**: Tailwind CSS com foco em design limpo e de alto contraste
- **Banco de Dados**: [Supabase](https://supabase.com/) (Integração resiliente de leitura/escrita e inteligência de sincronia offline)
- **Grapicos & Visualização**: Recharts / D3
- **Animações**: `motion/react` para micro-animações, modais e transições suaves de abas
- **Iconografia**: Lucide React

---

## ✨ Funcionalidades do Sistema

### 1. Dashboard (Painel de Visão Geral)
- **Métricas Chave (KPIs)**: Total faturado no mês corrente, ticket médio, serviços ativos pendentes e tarefas urgentes.
- **Gráficos de Desempenho**: Gráficos de barras do faturado mensal comparativo e distribuição de estágios visuais para análise imediata.
- **Conversão de Funil**: Indicadores reais de ganho e perda.
- **Limpeza de Histórico**: Ação protegida, com dupla confirmação e aviso visual para reiniciar logs sem comprometer a estrutura básica.

### 2. Funil de Vendas (Kanban Pipeline)
- **Estruturação de Estágios**: Orçamentos, Agendados, Propostas, Realizados e Arquivados.
- **Cartões Inteligentes**: Visualização do nome do cliente, serviço, data e valor, com badges dinâmicas de faturamento.
- **Fotos Antes & Depois**: Upload e armazenamento local/banco de registros fotográficos de serviços para auditoria e controle de qualidade.
- **Proteção Antiexclusão**: Remoção rápida protegida com dupla confirmação dinâmica nos cartões.

### 3. Cadastro de Clientes (Contatos)
- **Campos de Alto Nível**: Nome, telefone (com validação e máscara inteligente), e-mail, data de nascimento e endereço completo.
- **Filtros e Paginação**: Filtragem de status ativo/inativo, buscas instantâneas e paginação de dados otimizada.
- **Dupla Confirmação para Remoção**: Botões de exclusão de clientes internos da ficha cadastral protegidos para evitar ações acidentais.

### 4. Agenda de Serviços & Tarefas
- **Acompanhamento de Prazos**: Indicação de prioridade (Urgente, Média, Baixa) com prazos flexíveis e alertas de atraso.
- **Confirmação Dupla de Deleção**: Todos os botões "Excluir" de tarefas exigem confirmação tátil secundária direta na linha.

---

## 🔒 Camadas de Segurança e Sincronização Recentes

Durante os últimos ciclos de refinamento técnico, duas grandes correções estruturais foram implantadas para garantir a estabilidade e a experiência do usuário:

### ♻️ Resolução do Bug de Sincronização Reversa (Supabase)
**Problema**: Clientes, serviços ou tarefas eram excluídos e somiam da tela por alguns segundos, mas reapareciam misteriosamente logo após.
- **Causa**: O script de sincronização usava um filtro de exclusão remota incorreto no Supabase (`.filter("id", "not.in", ...)`) que falhava silenciosamente nas queries de remoção, e possuía uma lógica de guarda que pulava a sincronização caso o array local de dados estivesse vazio (`&& array.length > 0`). Com isso, itens excluídos nunca eram de fato expurgados do banco de dados remoto, sendo reinseridos no estado local no próximo loop de sincronia periódica.
- **Solução**: Corrigimos os métodos de sincronismo para utilizar corretamente a sintaxe `.not("id", "in", ...)` de forma assíncrona robusta e removemos as travas de tamanho de lista, permitindo que o estado de "banco totalmente limpo" ou remova o último elemento se propague corretamente para o Supabase.

### 🛡️ Proteção Contra Exclusão Acidental
Todo os botões de descarte ganharam uma camada protetora interativa inspirada no recurso de Limpar Histórico do painel principal:
- **Mudança de Estado Dinâmica**: Ao clicar em "Excluir" pela primeira vez, o botão muda de cor para um tom de alerta (Amber/Amarelo suave) com o texto *"Excluir?"* ou *"Tem certeza?"*.
- **Timer de Cancelamento Dinâmico**: Caso o usuário afaste o ponteiro do mouse (`onMouseLeave`), o botão retorna de forma segura ao seu estado padrão original, cancelando a tentativa.
- **Confirmação no Segundo Clique**: A ação de exclusão definitiva só será disparada se o usuário clicar no botão enquanto ele está em estado de alerta.

---

Desenvolvido para máxima agilidade operacional e segurança de dados da **BK Higienização**. 🚀
