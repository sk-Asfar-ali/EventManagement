import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(data: any): Promise<import("../users/users.entity").User>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
}
