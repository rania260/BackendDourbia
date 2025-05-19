import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";



Injectable()
export class GoogleAuthGuard extends AuthGuard('google'){
    handleRequest(err, user, info) {
        if (err || !user) {
          throw err || new UnauthorizedException('Google authentication failed');
        }
        return user;
      }
}