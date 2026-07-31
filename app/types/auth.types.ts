import type { UserRole } from "./user.types";

export type LoginRequest = {
    username: string;
    userkey: string;
}

export type LoginResponse = {
    message: string;
    accessToken: string;
    refreshToken: string;
}

export type RefreshRequest = {
    refreshToken: string;
}

export type BranchBasic = {
    id: string;
    phones: {
        id: string;
        phone1: string;
        phone2: string | null;
        whatsapp: string | null;
        createdAt: string;
        updatedAt: string;
    };
}

export type AuthUser = {
    id: string;
    username: string;
    isActive: boolean;
    role: UserRole;
    branch?: BranchBasic | null;
    branches?: BranchBasic[];
}

export type RefreshResponse = {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export type ValidateTokenResponse = {
    valid: boolean;
    user: AuthUser;
}

export type VerifyDiscountAuthorizationRequest = {
    username: string;
    userkey: string;
}

export type VerifyDiscountAuthorizationResponse = {
    discountAuthToken: string;
}