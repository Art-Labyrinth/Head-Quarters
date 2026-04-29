export type AuthResponseData = {
    access_token: string
    token_type: TokenType
    "user_id": number,
    "username": string,
    "role_id": number,
    "role": string,
    "permissions": UserPermissionItem[],
    "redirect_url": string
    "exp": number
}

export type UserPermissionItem = {
    module: string
    rights: number
}

export enum TokenType {
    bearer = "bearer",
}
