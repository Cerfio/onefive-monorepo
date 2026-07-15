import { Injectable, Inject } from '@nestjs/common';
import { Twilio } from 'twilio';
import { createTransport, Transporter } from 'nodemailer';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  TwilioSendException,
  TwilioConfigurationException,
  TwilioPhoneNumberException,
} from './twilio.exception';

@Injectable()
export class TwilioService {
  private twilioClient?: Twilio;
  private devTransport?: Transporter;

  constructor(@Inject('Logger') private readonly logger: LogService) {}

  /**
   * Client construit au premier envoi, jamais au boot.
   *
   * Le SDK Twilio rejette immédiatement tout SID qui ne commence pas par "AC"
   * (`accountSid must start with AC`). Construit dans le constructeur, cette erreur
   * fait échouer l'injection Nest : l'API entière refuse de démarrer à cause d'une
   * variable SMS mal remplie. Un SID vide, lui, est accepté — Twilio ne valide qu'au
   * premier appel réseau. En différant la construction, une config SMS absente ou
   * fausse ne casse plus que l'envoi de SMS, pas le service.
   */
  private getTwilioClient(): Twilio {
    if (this.twilioClient) return this.twilioClient;

    try {
      this.twilioClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      return this.twilioClient;
    } catch (error) {
      TwilioConfigurationException.throw(this.logger, {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Activé par erreur en production, le sink ferait disparaître tous les SMS de
   * vérification et bloquerait l'onboarding en silence. On échoue bruyamment.
   */
  private isDevSinkEnabled(): boolean {
    if (process.env.SMS_DEV_SINK !== 'true') return false;

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SMS_DEV_SINK=true avec NODE_ENV=production : aucun SMS ne serait livré. ' +
          "Retire SMS_DEV_SINK de l'environnement de production.",
      );
    }

    return true;
  }

  /**
   * Dépose le SMS dans Mailpit : une seule boîte de réception pour les emails et les
   * SMS de dev, sans crédit Twilio consommé ni téléphone réel.
   *
   * Le corps du SMS sert de sujet : le code est lisible directement dans la liste
   * Mailpit, sans ouvrir le message.
   */
  private async sendViaDevSink({
    transactionId,
    to,
    body,
  }: {
    transactionId: string;
    to: string;
    body: string;
  }): Promise<string> {
    if (!this.devTransport) {
      this.devTransport = createTransport({
        // MAILPIT_* et non SMTP_* : .env porte déjà des SMTP_* hérités qui pointent
        // vers smtp.gmail.com avec de vrais identifiants. Les réutiliser enverrait
        // les SMS de dev par Gmail pour de vrai.
        // 127.0.0.1 plutôt que "localhost" : selon l'ordre de résolution DNS du
        // process, "localhost" part en IPv6 ou en IPv4. On fixe l'IPv4.
        host: process.env.MAILPIT_HOST || '127.0.0.1',
        port: Number(process.env.MAILPIT_PORT || 2525),
        secure: false,
        ignoreTLS: true,
      });
    }

    const info = await this.devTransport.sendMail({
      from: `SMS Onefive <${process.env.TWILIO_PHONE_NUMBER || 'twilio'}@sms.dev>`,
      to: `${to.replace(/\D/g, '')}@sms.dev`,
      subject: body,
      text: `SMS vers ${to}\n\n${body}`,
    });

    this.logger.info('SMS routed to dev sink (Mailpit)', {
      transactionId,
      to,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    });

    return `SM-devsink-${info.messageId}`;
  }

  @Log()
  async sendSms({
    transactionId,
    to,
    body,
  }: {
    transactionId: string;
    to: string;
    body: string;
  }): Promise<string> {
    try {
      // Validation du numéro de téléphone
      if (!to || !to.match(/^\+[1-9]\d{1,14}$/)) {
        TwilioPhoneNumberException.throw(this.logger, {
          transactionId,
          phoneNumber: to,
          timestamp: new Date().toISOString(),
        });
      }

      // Après la validation, pour que le dev attrape aussi les numéros invalides.
      if (this.isDevSinkEnabled()) {
        return await this.sendViaDevSink({ transactionId, to, body });
      }

      const message = await this.getTwilioClient().messages.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        body,
      });

      this.logger.info(`SMS sent successfully`, {
        transactionId,
        to,
        messageSid: message.sid,
        timestamp: new Date().toISOString(),
      });

      return message.sid;
    } catch (error) {
      TwilioSendException.throw(this.logger, {
        transactionId,
        to,
        body,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
