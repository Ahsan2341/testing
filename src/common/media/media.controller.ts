import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuards } from '../guards/jwt-guards';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  
  @UseGuards(JwtGuards)
  @Post('upload-media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMediaDto: CreateMediaDto,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.mediaService.uploadFile(
      file,
      createMediaDto.name,
      createMediaDto.type,
    );
  }
}
