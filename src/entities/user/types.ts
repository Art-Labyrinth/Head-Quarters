export type AuthResponseData = {
    access_token: string
    token_type: TokenType
    "user_id": number,
    "username": string,
    "role_id": number,
    "role": UserRole,
    "redirect_url": string
    "exp": number
}

export enum TokenType {
    bearer = "bearer",
}

export enum UserRole {
    admin = "admin",
    volunteer = "volunteer",
    master = "master",
    tickets = "ticket",
}
