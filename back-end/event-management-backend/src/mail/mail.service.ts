import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailService {

    private transporter=nodemailer.createTransport({

       
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        },
        tls:{
            rejectUnauthorized:false
        }
    });

    async sendMail(options:{to:string,subject:string,text:string}){
        await this.transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:options.to,
            subject:options.subject,
            text:options.text
        });
    }
}
