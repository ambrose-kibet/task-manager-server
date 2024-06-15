import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: Mail;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      service: this.configService.get('EMAIL_HOST'),
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  private async sendEmail(email: string, subject: string, text: string) {
    this.transporter.sendMail(
      {
        from: this.configService.get('EMAIL_USER'),
        to: email,
        subject,
        html: text,
      },
      (err, info) => {
        if (err) {
          console.log(err);
          throw new Error('Error sending email');
        }
      },
    );
  }

  private populateVerificationEmailTemplate({
    name,
    token,
  }: {
    name: string;
    token: string;
  }): string {
    const year = new Date().getFullYear();

    return `  
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Email Confirmation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <style>
      @media screen and (max-width: 600px) {
        .content {
          width: 100% !important;
          display: block !important;
          padding: 10px !important;
        }
        .header,
        .body,
        .footer {
          padding: 20px !important;
        }
      }
    </style>
  </head>
    <body style="font-family: 'Poppins', Arial, sans-serif">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td align="center" style="padding: 20px">
        <table
            class="content"
            width="600"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="border-collapse: collapse; border: 1px solid #cccccc"
        >
            <!-- Header -->
            <tr
            style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding-top: 20px;
            "
            >
            <td
                class="header"
                style="background-color: transparent; text-align: center"
            >
                <img
                src="https://res.cloudinary.com/citadell/image/upload/v1717755131/Group_7_3_cvoadb.svg"
                alt="logo"
                style="width: 100px"
                />
            </td>
            </tr>
            <tr>
            <td
                class="header"
                style="
                background-color: #e50eded3;
                padding: 40px;
                text-align: center;
                color: white;
                font-size: 24px;
                "
            >
                Verify Your E-mail Address
            </td>
            </tr>

            <!-- Body -->
            <tr>
            <td
                class="body"
                style="
                padding: 40px;
                text-align: left;
                font-size: 16px;
                line-height: 1.6;
                "
            >
                Hello, ${name} <br />
                We are excited to have you on board. <br />
                <br />

                To start exploring the platform, please verify your email
                address.<br />
                This link will expire in 1 hour. <br />
            </td>
            </tr>

            <!-- Call to action Button -->
            <tr>
            <td style="padding: 0px 40px 0px 40px; text-align: center">
                <!-- CTA Button -->
                <table cellspacing="0" cellpadding="0" style="margin: auto">
                <tr>
                    <td
                    align="center"
                    style="
                        background-color: #e50eded3;
                        padding: 10px;
                        border-radius: 5px;
                        max-width: 800px;
                        display: block;
                        width: 100%;
                        margin-bottom: 20px;
                    "
                    >
                    <a
                        href="${this.configService.get(
                          'CLIENT_URL',
                        )}/verify-email?token=${token}"
                        style="
                        color: #ffffff;
                        text-decoration: none;
                        font-weight: bold;
                        width: 100%;
                        font-size: 24px;
                        margin: 0px;
                        padding: 0px;
                        text-decoration: none;
                        "
                    >
                       Verify Email
                    </a>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
            <!-- Footer -->
            <tr>
            <td
                class="footer"
                style="
                background-color: #e50eded3;
                padding: 40px;
                text-align: center;
                color: white;
                font-size: 14px;
                "
            >
                Copyright &copy; ${year} Task Manager
            </td>
            </tr>
        </table>
        </td>
    </tr>
    </table>
    </body>
</html>

    `;
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const html = this.populateVerificationEmailTemplate({ name, token });

    await this.sendEmail(email, 'Email Verification', html);
  }

  private populatePasswordResetEmailTemplate({
    token,
    name,
  }: {
    token: string;
    name: string;
  }): string {
    const year = new Date().getFullYear();

    return `<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Reset Password</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <style>
      @media screen and (max-width: 600px) {
        .content {
          width: 100% !important;
          display: block !important;
          padding: 10px !important;
        }
        .header,
        .body,
        .footer {
          padding: 20px !important;
        }
      }
    </style>
  </head>

  <body style="font-family: 'Poppins', Arial, sans-serif">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding: 20px">
          <table
            class="content"
            width="600"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="border-collapse: collapse; border: 1px solid #cccccc"
          >
            <!-- Header -->
            <tr
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding-top: 20px;
              "
            >
              <td
                class="header"
                style="background-color: transparent; text-align: center"
              >
                <img
                  src="https://res.cloudinary.com/citadell/image/upload/v1717755131/Group_7_3_cvoadb.svg"
                  alt="logo"
                  style="width: 100px"
                />
              </td>
            </tr>
            <tr>
              <td
                class="header"
                style="
                  background-color: #e50eded3;
                  padding: 40px;
                  text-align: center;
                  color: white;
                  font-size: 24px;
                "
              >
                Reset Password
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td
                class="body"
                style="
                  padding: 40px;
                  text-align: left;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Hello, ${name} <br />
                You Requested to reset your password. <br />
                <br />
                Please follow the link below to reset your password. <br />
                <br />
                If you did not request a password reset, please ignore this
                email or let us know. This password reset is only valid for the
                next 1 hour. <br />
              </td>
            </tr>

            <!-- Call to action Button -->
            <tr>
              <td style="padding: 0px 40px 0px 40px; text-align: center">
                <!-- CTA Button -->
                <table cellspacing="0" cellpadding="0" style="margin: auto">
                  <tr>
                    <td
                      align="center"
                      style="
                        background-color: #e50eded3;
                        padding: 10px;
                        border-radius: 5px;
                        max-width: 800px;
                        display: block;
                        width: 100%;
                        margin-bottom: 20px;
                      "
                    >
                      <a
                        href="${this.configService.get(
                          'CLIENT_URL',
                        )}/reset-password?token=${token}"
                        style="
                          color: #ffffff;
                          text-decoration: none;
                          font-weight: bold;
                          width: 100%;
                          font-size: 24px;
                          margin: 0px;
                          padding: 0px;
                        "
                      >
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td
                class="footer"
                style="
                  background-color: #e50eded3;
                  padding: 40px;
                  text-align: center;
                  color: white;
                  font-size: 14px;
                "
              >
                Copyright &copy; ${year} Task Manager
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const html = this.populatePasswordResetEmailTemplate({ token, name });
    await this.sendEmail(email, 'Password Reset', html);
  }
}
