import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String) //si fuera opcional {nullable:true}
  @IsEmail()
  email: string;

  @Field(() => String)
  @MinLength(6)
  password: string;
}
