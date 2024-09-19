import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';

@Module({
    imports: [
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                // Registering partials
                const partialsDir = join(__dirname, 'templates', 'shared');
                fs.readdirSync(partialsDir).forEach((file) => {
                    const partialName = file.split('.')[0];
                    const partialTemplate = fs.readFileSync(
                        join(partialsDir, file),
                        'utf8',
                    );
                    Handlebars.registerPartial(partialName, partialTemplate);
                });

                return {
                    transport: {
                        host: configService.get('MAIL_HOST'),
                        secure: false,
                        auth: {
                            user: configService.get('MAIL_USER'),
                            pass: configService.get('MAIL_PASS'),
                        },
                    },
                    defaults: {
                        from: '"No Reply" <noreply@example.com>',
                    },
                    template: {
                        dir: join(__dirname, 'templates'),
                        adapter: new HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                };
            },
        }),
    ],
    providers: [EmailService],
    controllers: [EmailController],
    exports: [EmailService]
})
export class EmailModule { }
