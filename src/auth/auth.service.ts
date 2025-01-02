import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupInput } from './dto/inputs/signup.input';
import { AuthResponse } from './types/auth-response.type';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { LoginInput } from './dto/inputs/login.input';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(userId: string) {
    return this.jwtService.sign({
      id: userId,
    });
  }

  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    // Crear usuario
    const user = await this.userService.create(signupInput);

    //JWT
    const token = this.getJwtToken(user.id);

    return {
      token,
      user,
    };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.userService.findOneByEmail(loginInput.email);

    if (!bcrypt.compareSync(loginInput.password, user.password)) {
      throw new BadRequestException('Email / Password do not match');
    }

    //JWT
    const token = this.getJwtToken(user.id);

    return {
      token,
      user,
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userService.findOneById(id);

    if (!user.isActive)
      throw new UnauthorizedException(`User is inactive, talk with an admin`);

    delete user.password;

    return user;
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user.id);

    return {
      token,
      user,
    };
  }
}
