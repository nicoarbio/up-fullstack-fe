export interface EmailPasswordLoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileDto {
  name: string,
  lastname: string,
  email: string,
  emailVerified: boolean,
  googleId: string,
  phoneNumber: string,
  imageUrl: string,
  role: string,
  status: string,
  lastLogin: string,
  createdAt: string,
  updatedAt: string
}
