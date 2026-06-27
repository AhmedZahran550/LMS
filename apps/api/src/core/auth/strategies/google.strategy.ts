import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>("oauth.google.clientId"),
      clientSecret: configService.get<string>("oauth.google.clientSecret"),
      callbackURL: configService.get<string>("oauth.google.callbackUrl"),
      scope: ["email", "profile"],
      passReqToCallback: true,
    });
  }

  async validate(
    _request: any,
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
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
