import { Module } from '@nestjs/common';
import { NplService } from './npl.service';

@Module({
  providers: [NplService],
  exports: [NplService]
})
export class NplModule {}
