import { Injectable } from '@nestjs/common';
import { MailProvider } from './providers/mail-provider.interface';

function getAppName(locale: string): string {
  return locale === 'ar' ? 'منارة' : 'manara';
}

@Injectable()
export class MailService {
  constructor(private mailProvider: MailProvider) {}

  async sendNewContentNotification(to: string[], courseName: string, contentTitle: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: `New content in ${courseName}`,
      template: `new-content-${locale}`,
      context: { courseName, contentTitle, appName: getAppName(locale) },
    });
  }

  async sendEnrollmentRequest(to: string, learnerName: string, courseName: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: `Enrollment Request: ${courseName}`,
      template: `enrollment-request-${locale}`,
      context: { learnerName, courseName, appName: getAppName(locale) },
    });
  }

  async sendEnrollmentApproved(to: string, courseName: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: `Enrollment Approved: ${courseName}`,
      template: `enrollment-approved-${locale}`,
      context: { courseName, appName: getAppName(locale) },
    });
  }

  async sendEnrollmentRejected(to: string, courseName: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: `Enrollment Update: ${courseName}`,
      template: `enrollment-rejected-${locale}`,
      context: { courseName, appName: getAppName(locale) },
    });
  }

  async sendCourseInvitation(to: string, instructorName: string, courseName: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: `Invitation to join ${courseName}`,
      template: `course-invitation-${locale}`,
      context: { instructorName, courseName, appName: getAppName(locale) },
    });
  }

  async sendOtpEmail(to: string, otp: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: 'Verify your email address',
      template: `email-verification-${locale}`,
      context: { otp, appName: getAppName(locale) },
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: 'Reset your password',
      template: `reset-password-${locale}`,
      context: { resetUrl, appName: getAppName(locale) },
    });
  }

  async sendPaymentConfirmation(to: string, plan: string, amount: string, currency: string, date: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: `Payment Confirmed — ${plan} Plan`,
      template: `payment-confirmation-${locale}`,
      context: { plan, amount, currency, date, appName: getAppName(locale) },
    });
  }

  async sendSubscriptionRenewed(to: string, plan: string, date: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: `Subscription Renewed — ${plan}`,
      template: `subscription-renewed-${locale}`,
      context: { plan, date, appName: getAppName(locale) },
    });
  }

  async sendSubscriptionExpiring(to: string, plan: string, date: string, locale: string = 'en') {
    await this.mailProvider.sendMail({
      to,
      subject: 'Subscription Expiring Soon',
      template: `subscription-expiring-${locale}`,
      context: { plan, date, appName: getAppName(locale) },
    });
  }
}
