# Clara no WhatsApp (número de teste da Meta)

O código já está no ar. O webhook fica em `https://clinica-ia-demo-alan.vercel.app/api/whatsapp`. Faltam só os passos com a sua conta, uns 20 minutos, sem custo nenhum.

O número de teste da Meta é grátis e responde a até 5 números de celular que você cadastrar. Isso basta para demonstrar no seu celular e no do dono da clínica durante a reunião.

## 1. Criar o app na Meta

1. Entre em https://developers.facebook.com com a sua conta do Facebook e clique em **Meus apps → Criar app**.
2. Escolha o caso de uso **Conectar-se com clientes pelo WhatsApp**. Dê um nome qualquer, por exemplo "Clara demo", e crie. Se pedir um portfólio empresarial (Business), crie um com seu nome.
3. No menu do app, abra **WhatsApp → Configuração da API** (API Setup). A Meta já mostra um **número de teste**.
4. Nessa mesma tela:
   - Copie o **ID do número de telefone** (Phone number ID).
   - Em **Para** (To), adicione o seu celular e confirme o código que chega no WhatsApp. Depois repita com qualquer outro número que for testar (máximo 5).

## 2. Gerar um token que não expira

O token temporário da tela de API Setup dura só 24 horas. Para a demo, gere um permanente:

1. Abra https://business.facebook.com/settings e vá em **Usuários → Usuários do sistema → Adicionar**. Dê um nome, escolha a função **Admin** e crie.
2. Clique em **Atribuir ativos**, escolha o app "Clara demo" e marque **Controle total**.
3. Clique em **Gerar token**, escolha o app e a validade **Nunca**. Marque as permissões `whatsapp_business_messaging` e `whatsapp_business_management`.
4. Copie o token. Não mande esse token para ninguém, nem para mim.

## 3. Colocar as chaves no Vercel

Abra https://vercel.com/alansouzeesi-7528/clinica-ia-demo-alan/settings/environment-variables e adicione as variáveis em **Production**, marcando "Sensitive":

| Nome | Valor |
|---|---|
| `WHATSAPP_TOKEN` | o token do passo 2 |
| `WHATSAPP_PHONE_NUMBER_ID` | o ID do número do passo 1 |
| `WHATSAPP_VERIFY_TOKEN` | uma frase inventada, por exemplo `clara-sorriso-2026` |
| `WHATSAPP_APP_SECRET` | no painel do app: **Configurações do app → Básico → Chave secreta do app** |
| `WHATSAPP_RECEPCAO` | opcional: seu celular, como `5519994450160`. Ele recebe o aviso "novo agendamento" ou "paciente pediu a recepção". |

Depois disso, me avise que eu publico de novo (as variáveis só valem a partir da próxima publicação). Se preferir fazer você mesmo, rode na pasta do projeto:

```powershell
vercel deploy --prod --yes
```

## 4. Ligar o webhook

1. No app da Meta, abra **WhatsApp → Configuração** (Configuration) e, em **Webhook**, clique em **Editar**.
2. Preencha os campos:
   - **URL de callback:** `https://clinica-ia-demo-alan.vercel.app/api/whatsapp`
   - **Token de verificação:** a mesma frase que você pôs em `WHATSAPP_VERIFY_TOKEN`.
3. Salve. Se der erro, o deploy do passo 3 ainda não foi feito ou a frase está diferente.
4. Em **Campos do webhook**, clique em **Assinar** na linha **messages**.

## 5. Testar

Mande "oi" do seu celular para o número de teste. A Clara responde em poucos segundos. Algumas mensagens para testar:

- "Vocês aceitam Amil?"
- "Quero marcar uma limpeza amanhã de manhã". Ela mostra os horários, você escolhe e confirma o nome. Se `WHATSAPP_RECEPCAO` estiver configurado, o seu número recebe o aviso do agendamento.
- "Quero falar com uma atendente". Ela transfere a conversa e avisa a recepção.
- "reiniciar" apaga a conversa e começa do zero.

## Como ela funciona

- Usa a mesma Clara do site: mesmas regras, mesma agenda e mesmo Gemini.
- Lembra as últimas 20 mensagens de cada número por até 6 horas. Essa memória fica na memória da função do Vercel. Se a função ficar parada um tempo, a conversa recomeça. Para não perder nunca, crie um banco Upstash Redis grátis (Vercel → Storage → Upstash) e as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` passam a ser usadas sozinhas.
- Só lê texto. Para áudio ou foto, pede para a pessoa escrever.
- Confere a assinatura da Meta (`WHATSAPP_APP_SECRET`). Ninguém consegue fingir mensagens para ela.
- Se a mesma mensagem chegar de novo (a Meta reenvia quando demora), ela responde uma vez só.

## Para um cliente de verdade

O número de teste não serve para produção. Para uma clínica cliente, o caminho é:

1. A clínica usa um número que **não** esteja no WhatsApp comum (um chip novo, ou o fixo da clínica). Um número só pode estar em um lugar: no app WhatsApp ou na API.
2. Esse número é adicionado no mesmo app, com o nome de exibição da clínica. A Meta aprova o nome em 1 ou 2 dias.
3. Sem verificar a empresa, dá para atender até 250 conversas iniciadas pela clínica por dia. Responder quem escreve primeiro não tem esse limite. Depois, a clínica verifica a empresa com o CNPJ.
4. **Custo:** responder dentro de 24 horas depois da mensagem do paciente é grátis. Mensagens que a clínica inicia (lembrete de consulta, por exemplo) são pagas por mensagem, centavos cada. Os valores atuais estão na página de preços da Meta.
5. Cada clínica tem o próprio `clinica.ts` (serviços, convênios, horários) e as próprias variáveis.
