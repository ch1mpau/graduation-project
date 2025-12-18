import { AppBadRequestException, ErrorCode } from '@app/core';
import { FileType } from '@app/core/constants/file.enum';
import { FileEntity } from '@app/core/entities/image.entity';
import { Get, Injectable, Logger, Param, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FIleDto } from './dto/file.dto';
import { join } from 'path';
import { existsSync } from 'fs';
import { Response } from 'express';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
  ) {}

  @Get(':filename')
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    const imagePath = join(process.cwd(), 'uploads', filename);

    if (!existsSync(imagePath)) {
      throw new AppBadRequestException(ErrorCode.FILE_NOT_FOUND);
    }

    return res.sendFile(imagePath);
  }

  async uploadImages(files: Express.Multer.File[]): Promise<any> {
    try {
      if (!files.length) {
        console.log('No file uploads');
        return [];
      }
      const filesCreated = await Promise.all(
        files.map(async (file) => {
          const newFile = this.filesRepository.create({
            path: file.filename,
            type: FileType.IMAGE,
          });
          return await this.filesRepository.save(newFile);
        }),
      );
      return filesCreated.map((file) => new FIleDto(file));
    } catch (error) {
      Logger.error('Create file error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.CREATE_PROJECT_ERROR);
    }
  }
}
