import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-facebook";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>("oauth.facebook.appId"),
      clientSecret: configService.get<string>("oauth.facebook.appSecret"),
      callbackURL: configService.get<string>("oauth.facebook.callbackUrl"),
      scope: ["email", "public_profile"],
      profileFields: ["id", "displayName", "emails", "photos", "name"],
      passReqToCallback: true,
    });
  }

  async validate(
    _request: any,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user?: any) => void,
  ) {
    const { id, name, emails, photos } = profile;
    done(null, {
      id,
      email: emails?.[0]?.value,
      firstName: name?.givenName ?? "",
      lastName: name?.familyName ?? "",
      picture: photos?.[0]?.value,
    });
  }
}
