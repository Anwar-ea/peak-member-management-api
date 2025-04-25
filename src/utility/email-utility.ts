// src/sesEmailService.ts
import * as handlebars from "handlebars";
import { Client, Message } from "postmark";

const transporter: Client = new Client(process.env.Post_Mark_Token ?? '')


export const sendEmail = async (from: string, to: string | undefined | null, subject: string, body: string, templateData?: any): Promise<void> => {

    if (templateData) {
        // Load the HTML template file
        try {
            // Compile the template using Handlebars
            const compiledTemplate = handlebars.compile(body);
            // Render the template with the provided data
            body = compiledTemplate(templateData);
        } catch {

        }
    }


    const mailOptions: Message = {
        From: 'web@aaepa.com',
        To: to ?? '',
        Subject: subject,
        HtmlBody: body,
        Bcc: 'help@allmarketingsolutions.co.uk'
    };


    try {

        await transporter.sendEmail(mailOptions, (err) => {
            if (err) {

                console.error("Error sending email:", err);
            } else {
                console.log("Email sent successfully!");
            }
        });
    } catch (err) {
    }
}
