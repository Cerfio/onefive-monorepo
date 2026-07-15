import { Resend } from "resend";
import { renderAsync } from "@react-email/render";
import { createTransport } from "nodemailer";

type SendOptions = Parameters<Resend["emails"]["send"]>[0];
type SendResponse = Awaited<ReturnType<Resend["emails"]["send"]>>;

/**
 * La surface de Resend réellement consommée par la route /api/send.
 * Le vrai client Resend la satisfait telle quelle ; le sink de dev l'imite.
 */
export interface EmailClient {
  emails: {
    send(options: SendOptions): Promise<SendResponse>;
  };
}

let client: EmailClient | undefined;

/**
 * Le sink de dev détourne 100% des emails. Activé par erreur en production,
 * il ferait disparaître silencieusement chaque email transactionnel
 * (vérification, reset password, invitations). On préfère refuser de démarrer.
 */
function isDevSinkEnabled(): boolean {
  if (process.env.EMAIL_DEV_SINK !== "true") return false;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "EMAIL_DEV_SINK=true avec NODE_ENV=production : tous les emails seraient " +
        "détournés vers Mailpit au lieu d'être livrés. Retire EMAIL_DEV_SINK de " +
        "l'environnement de production."
    );
  }

  return true;
}

/**
 * Client compatible Resend qui livre dans Mailpit (SMTP local) au lieu d'internet.
 *
 * Le rendu passe par renderAsync de @react-email/render 0.0.9 — exactement la version
 * que resend@2.1.0 épingle et appelle en interne. Le HTML vu dans Mailpit est donc
 * identique, octet pour octet, à celui que Resend enverrait en production.
 * En cas de montée de version de resend, réaligner @react-email/render dans package.json.
 */
function createDevSinkClient(): EmailClient {
  // MAILPIT_* et non SMTP_* : onefive-back porte déjà des SMTP_* hérités pointant
  // vers un vrai relais Gmail. Un nom dédié évite toute collision.
  // 127.0.0.1 plutôt que "localhost" : selon l'ordre de résolution DNS du process,
  // "localhost" part en IPv6 ou en IPv4 et le comportement diffère. On fixe l'IPv4.
  const host = process.env.MAILPIT_HOST || "127.0.0.1";
  const port = Number(process.env.MAILPIT_PORT || 2525);

  const transport = createTransport({
    host,
    port,
    secure: false,
    ignoreTLS: true, // Mailpit écoute en clair en local
  });

  return {
    emails: {
      async send(options) {
        const html = options.react
          ? await renderAsync(options.react as Parameters<typeof renderAsync>[0])
          : options.html || "";

        const info = await transport.sendMail({
          from: options.from,
          to: options.to,
          subject: options.subject,
          html,
        });

        return { data: { id: info.messageId }, error: null } as SendResponse;
      },
    },
  };
}

export function getResend(): EmailClient {
  if (client) return client;

  if (isDevSinkEnabled()) {
    client = createDevSinkClient();
    return client;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key. Pass it to the constructor `new Resend("re_123")`');
  }
  client = new Resend(apiKey);
  return client;
}
