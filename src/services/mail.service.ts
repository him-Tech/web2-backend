import { ServerClient } from "postmark";
import { config, logger } from "../config";
import { Owner, Repository } from "../model";

export class MailService {
  // TODO: make a data structure and a test to be sure to that this url exists
  private registerURL: string = `${config.frontEndUrl}/sign-up`;

  private client: ServerClient;

  constructor() {
    this.client = new ServerClient(config.email.postmarkApiToken);
  }

  async sendMail(to: string, subject: string, text: string) {
    await this.client.sendEmail({
      From: config.email.from,
      To: to,
      Subject: subject,
      TextBody: text,
    });
  }

  // TODO: create a good email
  async sendCompanyAdminInvite(
    toName: string | null,
    toEmail: string,
    token: string,
  ): Promise<void> {
    const subject = "Invite to register";
    const resetPasswordUrl = `${this.registerURL}?company_token=${token}`;

    logger.debug(
      `Sending email to ${toEmail} with invite link ${resetPasswordUrl}`,
    );

    const text = `Dear ${toName ? toName : ""},,
        Register to Open Source Economy: ${resetPasswordUrl}`;

    await this.sendMail(toEmail, subject, text);
  }

  async sendRepositoryAdminInvite(
    toName: string | null,
    toEmail: string,
    owner: Owner,
    repository: Repository,
    token: string,
  ): Promise<void> {
    const subject = "Invite to register";
    const setUpYourAccountLink = `${this.registerURL}?repository_token=${token}`;

    const ownerLogin: string = owner.id.login;
    const ownerProfileUrl: string | undefined = owner.avatarUrl;

    const repositoryName: string = repository.id.name;
    const repositoryUrl: string | null = repository.htmlUrl;

    // URL could be:
    // https://avatars.githubusercontent.com/u/141809657?v=4
    // https://avatars.githubusercontent.com/u/6135171?v=4
    // https://avatars.githubusercontent.com/u/47359?v=4

    logger.debug(
      `Sending email to ${toEmail} with invite link ${setUpYourAccountLink}`,
    );

    const text = `Dear ${toName ? toName : ownerLogin},,
        Register to Open Source Economy: ${setUpYourAccountLink}`;

    await this.sendMail(toEmail, subject, text);
  }
}
