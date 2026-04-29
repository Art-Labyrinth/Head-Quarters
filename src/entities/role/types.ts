export type Role = {
  id: number
  name: string
  homepage?: string
  description?: string
  permissions?: PermissionItem[]
}

export type PermissionItem = {
  module: string
  rights: number
}

export type PermissionRight = {
  name: string
  bit: number
  description: string
}

export type PermissionSchema = {
  modules: string[]
  rights: PermissionRight[]
}

export type RoleCreatePayload = {
  name: string
  homepage?: string
  description?: string
  permissions: PermissionItem[]
}
