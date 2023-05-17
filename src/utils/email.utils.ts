import nodemailer from "nodemailer";
import { google } from "googleapis";
import { readFileSync } from "fs";
import { compile } from "handlebars";

export const sendVerificationEmail = async (userEmail: string, verificationCode: string) => {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.OAUTH_CLIENT_ID,
        process.env.OAUTH_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });

    const accessToken = await new Promise<string>((resolve, reject) => {
        oAuth2Client.getAccessToken((err, token) => {
            if (err) {
                console.log("*ERR: ", err);
                reject();
            }
            resolve(token);
        });
    });

    const transporter = nodemailer.createTransport({
        service: "gmail", // TODO Change if using a different service
        auth: {
            type: "OAuth2",
            user: process.env.OAUTH_USER,
            accessToken,
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        },
    });

    const filePath = "./src/email-templates/validate-email-template.html"; // TODO Change or replace the HTML file if needed.
    const source = readFileSync(filePath, "utf-8").toString();
    const template = compile(source);
    const confirmationUrl = `http://${process.env.IP_ADRESS}:${process.env.PORT}/auth/verify-email/${verificationCode}`;
    const replacements = {
        // TODO To inject variable into the HTML file, use the {{VARIABLE_NAME}} format anywhere inside the file.
        confirmationUrl: confirmationUrl,
    };
    const htmlToSend = template(replacements);

    await transporter.sendMail({
        from: process.env.NODEMAILER_SENDER_EMAIL,
        to: userEmail,
        subject: "[YOUR_APP_NAME] Verify your email", // TODO Insert your app name
        html: htmlToSend,
    });
};
