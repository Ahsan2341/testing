import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtGuards } from 'src/common/guards/jwt-guards';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @UseGuards(JwtGuards)
  @Get()
  async findAll(
    @Query() params,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const filters = {
      ...Object.fromEntries(
        Object.entries(params).filter(
          ([key]) => !['page', 'limit', 'name', 'email'].includes(key),
        ),
      ),
      ...(name && { name: { $regex: name, $options: 'i' } }),
      ...(email && { email: { $regex: email, $options: 'i' } }),
    };
    console.log(filters);
    return this.userService.findAll(filters, limitNum, pageNum);
  }
  @UseGuards(JwtGuards)
  @Patch()
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Request() request) {
    return this.userService.findByIdAndUpdate(request.user._id, updateUserDto);
  }

  @UseGuards(JwtGuards)
  @Get("current-user")
  async getCurrentUser(@Request() request){
    return this.userService.findById(request.user._id);
  }
}
