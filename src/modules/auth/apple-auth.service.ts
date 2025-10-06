import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import * as AppleSignIn from 'apple-signin';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AppleAuthService {
  private clientID: string;
  private teamID: string;
  private keyID: string;
  private privateKeyPath: string;
  private redirectUri: string;

  constructor() {
    this.clientID = process.env.APPLE_CLIENT_ID!;
    this.teamID = process.env.APPLE_TEAM_ID!;
    this.keyID = process.env.APPLE_KEY_ID!;
    this.privateKeyPath = process.env.APPLE_PRIVATE_KEY_PATH!;
    this.redirectUri = process.env.APPLE_REDIRECT_URI!;
    if (!this.clientID) {
      throw new Error('APPLE_CLIENT_ID is required');
    }
  }

  async getTokens(code: string): Promise<any> {
    if (process.env.NODE_ENV === 'development') {
      // Mock for testing: Generate a fake id_token instead of exchanging code
      return {
        access_token: 'dummy_access_token',
        id_token: this.generateDummyIdToken(),
        refresh_token: 'dummy_refresh_token',
        expires_in: 3600,
        token_type: 'bearer',
      };
    }

    // Production: Generate client secret and exchange code for tokens
    const clientSecret = AppleSignIn.getClientSecret({
      clientID: this.clientID,
      teamId: this.teamID,
      privateKeyPath: this.privateKeyPath,
      keyIdentifier: this.keyID,
    });

    const options = {
      clientID: this.clientID,
      redirectUri: this.redirectUri,
      clientSecret,
    };

    try {
      const tokens = await AppleSignIn.getAuthorizationToken(code, options);
      return tokens;
    } catch (error) {
      console.log(error);
      if (error.message?.includes('invalid_grant')) {
        throw new BadRequestException('Invalid authorization code');
      }
      throw new InternalServerErrorException('Error retrieving tokens', error.message);
    }
  }

  async verify(token: string): Promise<any> {
    if (process.env.NODE_ENV === 'development') {
      // Mock for testing: Decode without signature verification (Apple uses RS256, but we skip)
      const payload = jwt.decode(token);
      if (!payload) {
        throw new Error('Invalid token payload');
      }
      return {
        userId: payload['sub'],
        payload,
      };
    }

    // Production: Verify signature using Apple's public keys
    try {
      const result = await AppleSignIn.verifyIdToken(token, this.clientID);
      return {
        userId: result.sub,
        payload: result,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error verifying token', error.message);
    }
  }

  private generateDummyIdToken(): string {
    // Generate a fake JWT payload mimicking Apple's id_token structure
    const sub = 'apple_dummy_user_' + Math.random().toString(36).substr(2, 9);  // Unique user ID
    const payload = {
      iss: 'https://appleid.apple.com',  // Apple's issuer
      sub,
      aud: this.clientID,  // Your client ID
      email: 'test.user@example.com',  // Or use private relay: 'test@privaterelay.appleid.com'
      email_verified: true,
      is_private_email: false,
      name: { firstName: 'Test', lastName: 'User' },  // Apple only sends name on first login
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,  // Expires in 1 hour
    };

    // Sign with HS256 (symmetric) for simplicity in dev; no need for real RS256 key pair here since we skip verify
    return jwt.sign(payload, 'dummy_secret_key_for_dev_only_change_in_prod', { algorithm: 'HS256' });
  }
}