import React, {useCallback, useEffect, useState} from 'react'
import {ChevronLeft, ChevronRight, Edit2, Trash2, X} from 'lucide-react'
import {createUser, deleteUser, getUsers, updateUser} from '../../../entities/user/api.admin'
import {getRoles} from '../../../entities/role'
import {useUserStore} from '../../../entities/user'
import {hasModuleRight} from '../../../shared/lib'

type Role = {
  id: number
  name: string
}

type UserItem = {
  id?: number | string
  username?: string
  role?: Role | null
  is_active?: boolean
  permissions?: unknown[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const extractUserList = (payload: unknown): {users: UserItem[], count: number} => {
  if (!isRecord(payload)) {
    return { users: [], count: 0 }
  }

  const users = payload.users
  const count = payload.count

  if (!Array.isArray(users)) {
    return { users: [], count: 0 }
  }

  return {
    users: users as UserItem[],
    count: typeof count === 'number' ? count : 0
  }
}

const extractRoleList = (payload: unknown): Role[] => {
  if (Array.isArray(payload)) {
    return payload as Role[]
  }

  if (!isRecord(payload)) {
    return []
  }

  const candidates = ['roles', 'list', 'items', 'results', 'data']
  for (const key of candidates) {
    const candidate = payload[key]
    if (Array.isArray(candidate)) {
      return candidate as Role[]
    }
  }

  return []
}

const items_per_page = 10

type CreateUserModalProps = {
  isOpen: boolean
  roles: Role[]
  onClose: () => void
  onSubmit: (data: {username: string, role_id?: number}) => Promise<void>
  isSubmitting?: boolean
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({isOpen, roles, onClose, onSubmit, isSubmitting}) => {
  const [formData, setFormData] = useState<{username: string, role_id: string}>({username: '', role_id: ''})
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.username.trim()) {
      setError('Имя пользователя обязательно.')
      return
    }

    try {
      await onSubmit({
        username: formData.username,
        role_id: formData.role_id ? Number(formData.role_id) : undefined,
      })
      setFormData({username: '', role_id: ''})
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка при создании пользователя.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-800">Создать пользователя</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 cursor-pointer"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Имя пользователя
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Введите имя пользователя"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Роль</label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                disabled={isSubmitting}
              >
                <option value="">Без роли</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded hover:bg-stone-200 cursor-pointer"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-60 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

type EditUserModalProps = {
  isOpen: boolean
  user: UserItem | null
  roles: Role[]
  isSubmitting?: boolean
  onClose: () => void
  onSave: (payload: {id: number, username: string, role_id?: number}) => Promise<void>
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  roles,
  isSubmitting,
  onClose,
  onSave,
}) => {
  const [username, setUsername] = useState('')
  const [roleId, setRoleId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setUsername(user?.username ?? '')
    setRoleId(user?.role?.id ? String(user.role.id) : '')
    setError(null)
  }, [isOpen, user])

  if (!isOpen || !user?.id) {
    return null
  }

  const userId = Number(user.id)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError('Имя пользователя обязательно.')
      return
    }

    try {
      await onSave({
        id: userId,
        username: username.trim(),
        role_id: roleId ? Number(roleId) : undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении пользователя.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-800">Редактировать пользователя</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 cursor-pointer"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Имя пользователя</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Роль</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                disabled={isSubmitting}
              >
                <option value="">Без роли</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded hover:bg-stone-200 cursor-pointer"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-60 cursor-pointer"
                disabled={isSubmitting}
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export const UsersManagement: React.FC = () => {
  const {session} = useUserStore()
  const canEditOrCreate = hasModuleRight(session, 'users', 2)
  const canDelete = hasModuleRight(session, 'users', 4)

  const [users, setUsers] = useState<UserItem[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const offset = (currentPage - 1) * items_per_page
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: items_per_page.toString()
      })

      const response = await getUsers(params)

      if ('data' in response) {
        const {users: userList, count: totalCount} = extractUserList(response.data)
        setUsers(userList)
        setCount(totalCount)
      } else {
        setError('Не удалось загрузить пользователей.')
      }
    } catch (e) {
      console.error(e)
      setError('Ошибка при загрузке пользователей.')
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const loadRoles = useCallback(async () => {
    try {
      const response = await getRoles()
      if ('data' in response) {
        setRoles(extractRoleList(response.data))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    void loadRoles()
  }, [loadRoles])

  const handleCreateUser = async (data: {username: string, role_id?: number}) => {
    if (!canEditOrCreate) {
      throw new Error('Недостаточно прав для создания пользователей.')
    }

    setIsSubmitting(true)
    try {
      await createUser(data)
      setCurrentPage(1)
      await loadUsers()
    } catch (e) {
      throw e instanceof Error ? e : new Error('Ошибка при создании пользователя.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (user: UserItem) => {
    if (!canEditOrCreate) {
      return
    }
    setEditingUser(user)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingUser(null)
  }

  const handleUpdateUser = async ({id, username, role_id}: {id: number, username: string, role_id?: number}) => {
    if (!canEditOrCreate) {
      throw new Error('Недостаточно прав для редактирования пользователей.')
    }

    setIsSubmitting(true)
    try {
      await updateUser(id, {username, role_id})
      await loadUsers()
    } catch (e) {
      throw e instanceof Error ? e : new Error('Ошибка при обновлении пользователя.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!canDelete) {
      throw new Error('Недостаточно прав для удаления пользователей.')
    }

    const confirmed = window.confirm('Удалить пользователя?')
    if (!confirmed) {
      return
    }

    setIsSubmitting(true)
    try {
      await deleteUser(id)
      await loadUsers()
    } catch (e) {
      throw e instanceof Error ? e : new Error('Ошибка при удалении пользователя.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPages = Math.ceil(count / items_per_page) || 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Пользователи</h3>
        {canEditOrCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer"
          >
            Создать пользователя
          </button>
        )}
      </div>

      <div className="bg-white border rounded shadow-sm p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-sm text-stone-600 border-b">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Имя</th>
              <th className="py-2 px-3">Статус</th>
              <th className="py-2 px-3">Роль</th>
              <th className="py-2 px-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="text-sm text-stone-700">
                <td className="py-2 px-3" colSpan={5}>Загрузка пользователей...</td>
              </tr>
            )}

            {!loading && error && (
              <tr className="text-sm text-red-600">
                <td className="py-2 px-3" colSpan={5}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => void loadUsers()}
                      className="px-3 py-1 bg-stone-100 text-stone-700 rounded hover:bg-stone-200"
                    >
                      Повторить
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && users.length === 0 && (
              <tr className="text-sm text-stone-700">
                <td className="py-2 px-3" colSpan={5}>Пользователей не найдено</td>
              </tr>
            )}

            {!loading && !error && users.map((user) => (
              <tr className="text-sm text-stone-700 hover:bg-stone-50 border-b" key={String(user.id)}>
                <td className="py-2 px-3">{user.id}</td>
                <td className="py-2 px-3">{user.username ?? '—'}</td>
                <td className="py-2 px-3">
                  {user.is_active ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
                      Активен
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-red-50 text-red-700 rounded">
                      Неактивен
                    </span>
                  )}
                </td>
                <td className="py-2 px-3">
                  {typeof user.role === 'object' && user.role !== null
                    ? user.role.name
                    : '—'}
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-2">
                    {canEditOrCreate && (
                      <button
                        className="text-amber-600 hover:text-amber-800 cursor-pointer"
                        title="Редактировать"
                        onClick={() => openEditModal(user)}
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        title="Удалить"
                        onClick={() => user.id && void handleDeleteUser(Number(user.id))}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {!canEditOrCreate && !canDelete && '—'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-stone-200 flex items-center justify-between">
            <div className="text-sm text-stone-700">
              Показано{' '}
              <span className="font-medium">
                {Math.min((currentPage - 1) * items_per_page + 1, count)}
              </span>{' '}
              до{' '}
              <span className="font-medium">
                {Math.min(currentPage * items_per_page, count)}
              </span>{' '}
              из <span className="font-medium">{count}</span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-stone-300 rounded hover:bg-stone-100 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? 'bg-amber-100 text-amber-800 border-amber-400'
                      : 'border-stone-300 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-stone-300 rounded hover:bg-stone-100 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {canEditOrCreate && (
        <CreateUserModal
          isOpen={isCreateModalOpen}
          roles={roles}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateUser}
          isSubmitting={isSubmitting}
        />
      )}

      {canEditOrCreate && (
        <EditUserModal
          isOpen={isEditModalOpen}
          user={editingUser}
          roles={roles}
          isSubmitting={isSubmitting}
          onClose={closeEditModal}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  )
}

export default UsersManagement
