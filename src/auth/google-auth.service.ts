import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
@Injectable()
export class GoogleAuthService {
  private googleClient: OAuth2Client;
  constructor() {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:5173',
    );
  }
  
  async getTokens(code: string): Promise<any> {
    const client = this.googleClient;
    try {
      const { tokens } = await client.getToken(code);
      return tokens;
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.error === 'invalid_grant'
      ) {
        throw new BadRequestException('Invalid authorization code');
      }
      throw new InternalServerErrorException(
        'Error retrieving tokens',
        error.message,
      );
    }
  }
  async verify(token: string): Promise<any> {
    const client = this.googleClient;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if(!payload){
        throw new Error("payload is empty");
      }
      return {
        userId: payload['sub'],
        payload,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error verifying token',
        error.message,
      );
    }
  }
  
}
