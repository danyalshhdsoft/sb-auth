import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('get_user')
  getUser(data: any) {
    console.log("shaheeer checking...", JSON.stringify(data));
    return this.appService.getUser(data.value);
  }

  // @MessagePattern('get_user.reply')
  // getUserReply(data: any) {
  //   console.log("return topic printing");
    
  // }
}
