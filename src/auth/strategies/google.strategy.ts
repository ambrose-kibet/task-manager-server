import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly userService: UserService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    request: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;
    const email = emails[0].value;
    const avatar = photos[0].value;

    const user = await this.userService.findUserByEmail(email);

    if (user) {
      const { password, ...result } = user;
      if (!user.isEmailConfirmed) {
        await this.userService.markEmailAsConfirmed(user.id);
      }
      done(null, result);
    } else {
      const newUser = await this.userService.createUser({
        name: name.givenName + ' ' + name.familyName,
        email,
        avatar,
        password: null,
        isEmailConfirmed: true,
      });

      done(null, newUser);
    }
  }
}
