import React, {useEffect, useState} from 'react'
import {MainLayout} from '../../widgets/layouts/main'
import UsersManagement from './tabs/Users'
import RolesManagement from './tabs/Roles'
import {useUserStore} from '../../entities/user'
import {hasModuleRight} from '../../shared/lib'

export const SettingsPage: React.FC = () => {
  const {session} = useUserStore()
  const canUsersTab = hasModuleRight(session, 'users', 1)
  const canRolesTab = hasModuleRight(session, 'roles', 1)

  const [active, setActive] = useState<'users' | 'roles'>('users')

  useEffect(() => {
    if (!canUsersTab && canRolesTab) {
      setActive('roles')
    }
    if (!canRolesTab && canUsersTab) {
      setActive('users')
    }
  }, [canRolesTab, canUsersTab])

  return (
    <MainLayout header={'Settings'}>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-1">Настройки</h1>
        <p className="text-stone-600">Управление пользователями и ролями.</p>
      </div>

      <div className="bg-white p-4 rounded shadow-sm">
        <div className="flex gap-2 mb-4">
          {canUsersTab && (
            <button
              className={`px-4 py-2 rounded cursor-pointer ${active === 'users' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'}`}
              onClick={() => setActive('users')}
            >
              Управление пользователями
            </button>
          )}
          {canRolesTab && (
            <button
              className={`px-4 py-2 rounded cursor-pointer ${active === 'roles' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'}`}
              onClick={() => setActive('roles')}
            >
              Управление ролями
            </button>
          )}
        </div>

        <div>
          {active === 'users' && canUsersTab && <UsersManagement />}
          {active === 'roles' && canRolesTab && <RolesManagement />}
        </div>
      </div>
    </MainLayout>
  )
}

export default SettingsPage
