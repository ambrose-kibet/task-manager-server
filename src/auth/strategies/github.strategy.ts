import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GithubAuthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('GITHUB_CALLBACK_URL'),
      scope: ['public_profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { photos, emails, displayName } = profile;
    const avatar = photos[0].value;
    const email = emails[0].value;

    const user = await this.userService.findUserByEmail(email);

    if (user) {
      const { password, ...result } = user;
      if (!user.isEmailConfirmed) {
        await this.userService.markEmailAsConfirmed(user.id);
      }
      return result;
    } else {
      const newUser = await this.userService.createUser({
        name: displayName,
        email: email,
        avatar,
        password: null,
        isEmailConfirmed: true,
      });

      return newUser;
    }
  }
}
