import type {AuthResponseData} from '../../entities/user/types'

export const ADMIN_ROLE_ID = 1

export const isAdmin = (session: AuthResponseData | null | undefined): boolean =>
  Number(session?.role_id) === ADMIN_ROLE_ID

export const getModuleRights = (
  session: AuthResponseData | null | undefined,
  moduleName: string,
): number => {
  if (!session) {
    return 0
  }

  if (isAdmin(session)) {
    return 8
  }

  const permission = session.permissions?.find((item) => item.module === moduleName)
  return typeof permission?.rights === 'number' ? permission.rights : 0
}

export const hasModuleRight = (
  session: AuthResponseData | null | undefined,
  moduleName: string,
  minRight = 1,
): boolean => getModuleRights(session, moduleName) >= minRight

export const canAccessDashboard = (session: AuthResponseData | null | undefined): boolean =>
  hasModuleRight(session, 'tickets', 1)

export const canAccessQrGeneration = (session: AuthResponseData | null | undefined): boolean =>
  hasModuleRight(session, 'tickets', 8)

export const canAccessTicketsArchive = (session: AuthResponseData | null | undefined): boolean =>
  hasModuleRight(session, 'tickets', 1)

export const canAccessSettings = (session: AuthResponseData | null | undefined): boolean =>
  hasModuleRight(session, 'users', 1) || hasModuleRight(session, 'roles', 1)
