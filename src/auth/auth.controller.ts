import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, Res, UseGuards, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { SigninDto } from './dto/signin.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordFinalDto } from './dto/reset-password-final.dto';
import { GoogleAuthGuard } from './guards/google-auth-guard';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CreateExpertDto } from '../expert/dto/create-expert.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly jwtService : JwtService
  ) {}

  // @Get('google/login')
  // @UseGuards(GoogleAuthGuard)
  // async googleLogin(@Req() req) {
  //   return req.user;
  // }

  // @Get('google/callback')
  // @UseGuards(GoogleAuthGuard)
  // async googleCallback(@Req() req, @Res() res: Response) {
  //   const user = req.user;
  //   if (!user) {
  //     return res.status(401).send('Authentication failed');
  //   }

  //   // Generate JWT token
  //   const payload = {
  //     id: user.id,
  //     email: user.email,
  //     role: user.role
  //   };

  //   const token = this.jwtService.sign(payload);
  //   
  //   const returnTo = 'http://localhost:3000/admin';
  //   
  //   res.redirect(`${returnTo}?token=${token}`);
  // }

  @Post('signup')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }


  @Post('signin')
  @ApiOperation({ summary: 'Connexion de l\'utilisateur' })
  @ApiBody({ type: SigninDto })  
  @ApiResponse({ status: 200, description: 'Utilisateur connecté avec succès' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }


  @Post('create')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  // @Post('create-expert')
  // @UseGuards(AuthGuard)
  // @ApiOperation({ summary: 'Créer un expert' })
  // @ApiResponse({ status: 201, description: 'Expert créé' })
  // @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  // createExpert(@Body() createExpertDto: CreateExpertDto) {
  //   return this.authService.createExpert(createExpertDto);
  // }

  @Get('getAll')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  async findAll() {
    return this.authService.findAll();
  }


  @Get('get/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }


@Get('search')
@UseGuards(AuthGuard)
@ApiOperation({ summary: 'Rechercher des utilisateurs par username' })
@ApiResponse({ status: 200, description: 'Liste des utilisateurs correspondants' })
async searchUsers(@Query('username') username: string) {
  return this.authService.searchUsers(username);
}
  
  @Patch('update/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.update(+id, updateUserDto);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'Successfully retrieved user profile.', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async profile(@Req() req): Promise<User> {
      return this.authService.getProfile(req.user.email);
  }

@Post('verification-otp')
@ApiOperation({ summary: 'Générer un OTP pour la vérification email' })
@ApiBody({ 
  schema: {
    type: 'object',
    properties: { email: { type: 'string' } }
  }
})
@ApiResponse({ status: 200, description: 'OTP généré avec succès' })
@ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
async generateEmailVerification(@Body('email') email: string) {
  const user = await this.authService.findUserByEmail(email);
  await this.authService.generateEmailVerification(user.id);
  return { status: 'success', message: 'Email envoyé' };
}

@Post('verify-email/:otp')
@ApiOperation({ summary: "Vérifier l'email avec OTP" })
@ApiParam({ name: 'otp', description: 'Code OTP reçu par email' })
@ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
@ApiResponse({ status: 422, description: 'OTP invalide ou expiré' })
async verifyEmail(@Param('otp') otp: string) {
  await this.authService.verifyEmailWithOtp(otp);
  return { 
    status: 'success',
    message: 'Votre email a été vérifié avec succès'
  };
}

@Patch('toggle-ban/:id')
@UseGuards(AuthGuard)
@ApiOperation({ summary: 'Bannir/Débannir un utilisateur' })
@ApiParam({ name: 'id', description: "ID de l'utilisateur" })
async toggleBan(@Param('id') id: string) {
  const user = await this.authService.toggleBan(+id);
  return {
    status: 'success',
    message: user.isBanned ? 'Utilisateur banni' : 'Utilisateur débanni',
    user
  };
}

@Post('password/send-code')
@ApiOperation({ summary: 'Envoyer un code de réinitialisation de mot de passe' })
@ApiResponse({ status: 200, description: 'Code envoyé avec succès' })
@ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
async sendPasswordResetCode(@Body() resetPasswordDto: ResetPasswordDto) {
  return this.authService.generatePasswordResetOTP(resetPasswordDto.email);
}

@Post('password/verify-code/:otp')
@ApiOperation({ summary: 'Vérifier le code de réinitialisation de mot de passe' })
@ApiParam({ name: 'otp', description: 'Code OTP reçu par email' })
@ApiResponse({ status: 200, description: 'Code vérifié avec succès' })
@ApiResponse({ status: 422, description: 'Code invalide ou expiré' })
async verifyPasswordResetCode(@Param('otp') otp: string) {
  const isValid = await this.authService.verifyPasswordResetOTP(otp);
  return { 
    status: 'success',
    message: 'Code vérifié avec succès'
  };
}

@Post('password/reset')
@ApiOperation({ summary: 'Réinitialiser le mot de passe' })
@ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
@ApiResponse({ status: 422, description: 'Erreur de réinitialisation' })
async resetPassword(@Body() resetPasswordFinalDto: ResetPasswordFinalDto) {
  const success = await this.authService.resetPassword(resetPasswordFinalDto.newPassword);
  return { 
    status: 'success',
    message: 'Mot de passe réinitialisé avec succès'
  };
}

@Post('logout')
async logout(@Res({ passthrough: true }) res: Response) {
  // Clear the token cookie
  res.clearCookie('token', { path: '/' });
  
  // Clear any other auth-related cookies
  res.clearCookie('access_token', { path: '/' });
  
  return { message: 'Logged out successfully' };
}
}
