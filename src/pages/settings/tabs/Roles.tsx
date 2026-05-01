import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Edit2, Trash2, X} from 'lucide-react'
import {createRole, deleteRole, getPermissionsSchema, getRoles, updateRole} from '../../../entities/role'
import type {PermissionItem, PermissionSchema, PermissionRight, Role, RoleCreatePayload} from '../../../entities/role'
import {useUserStore} from '../../../entities/user'
import {hasModuleRight} from '../../../shared/lib'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
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

const extractPermissionSchema = (payload: unknown): PermissionSchema => {
  if (!isRecord(payload)) {
    return { modules: [], rights: [] }
  }

  const modules = Array.isArray(payload.modules) ? payload.modules.filter((item): item is string => typeof item === 'string') : []
  const rights = Array.isArray(payload.rights)
    ? payload.rights.filter((item): item is PermissionSchema['rights'][number] => {
      if (!isRecord(item)) {
        return false
      }

      return typeof item.name === 'string' && typeof item.bit === 'number' && typeof item.description === 'string'
    })
    : []

  return { modules, rights }
}

const hasRightBit = (rights: number, bit: number): boolean => (rights & bit) !== 0

const toggleRightBit = (rights: number, bit: number, checked: boolean): number => {
  if (checked) {
    return rights | bit
  }

  return rights & ~bit
}

const formatRightLabel = (right: PermissionRight): string => {
  const normalizedName = right.name.trim()
  if (!normalizedName) {
    return String(right.bit)
  }

  return normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1)
}

type RoleModalProps = {
  isOpen: boolean
  schema: PermissionSchema
  isSubmitting: boolean
  initialRole?: Role | null
  onClose: () => void
  onSubmit: (payload: RoleCreatePayload) => Promise<void>
}

const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  schema,
  isSubmitting,
  initialRole,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('')
  const [homepage, setHomepage] = useState('')
  const [description, setDescription] = useState('')
  const [rightsMap, setRightsMap] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(initialRole?.id)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setName(initialRole?.name ?? '')
    setHomepage(initialRole?.homepage ?? '')
    setDescription(initialRole?.description ?? '')

    const map: Record<string, number> = {}
    if (initialRole?.permissions?.length) {
      for (const item of initialRole.permissions) {
        map[item.module] = item.rights
      }
    }
    setRightsMap(map)
    setError(null)
  }, [initialRole, isOpen, schema])

  const canManagePermissions = schema.modules.length > 0

  if (!isOpen) {
    return null
  }

  const updateRight = (module: string, bit: number, checked: boolean) => {
    setRightsMap((prev) => ({
      ...prev,
      [module]: toggleRightBit(prev[module] ?? 0, bit, checked),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Поле name обязательно.')
      return
    }

    const normalizedPermissions: PermissionItem[] = Object.entries(rightsMap)
      .filter(([module, rights]) => module && rights > 0)
      .map(([module, rights]) => ({ module, rights }))

    const payload: RoleCreatePayload = {
      name: name.trim(),
      homepage: homepage.trim() || undefined,
      description: description.trim() || undefined,
      permissions: normalizedPermissions,
    }

    try {
      await onSubmit(payload)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить роль.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto shadow-xl">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-800">{isEdit ? 'Редактировать роль' : 'Создать роль'}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 cursor-pointer"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm text-stone-700">
                <span className="block mb-1">Name</span>
                <input
                  className="w-full px-3 py-2 border border-stone-300 rounded-md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </label>

              <label className="text-sm text-stone-700">
                <span className="block mb-1">Homepage</span>
                <input
                  className="w-full px-3 py-2 border border-stone-300 rounded-md"
                  value={homepage}
                  onChange={(e) => setHomepage(e.target.value)}
                  disabled={isSubmitting}
                />
              </label>
            </div>

            <label className="text-sm text-stone-700 block">
              <span className="block mb-1">Description</span>
              <textarea
                className="w-full px-3 py-2 border border-stone-300 rounded-md min-h-24"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </label>

            <div className="space-y-2">
              <h3 className="font-semibold text-stone-800">Permissions</h3>

              {!canManagePermissions && (
                <p className="text-sm text-stone-500">Справочник permissions пока недоступен.</p>
              )}

              {canManagePermissions && (
                <div className="border border-stone-200 rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200">
                        <th className="py-2 px-3 text-left font-medium text-stone-600">Модуль</th>
                        {schema.rights.map((right) => (
                          <th key={right.bit} className="py-2 px-2 text-center font-medium text-stone-600 whitespace-nowrap">
                            {formatRightLabel(right)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schema.modules.map((module) => {
                        const rights = rightsMap[module] ?? 0
                        return (
                          <tr key={module} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                            <td className="py-2 px-3 text-stone-700">{module}</td>
                            {schema.rights.map((right) => (
                              <td key={right.bit} className="py-2 px-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasRightBit(rights, right.bit)}
                                  onChange={(e) => updateRight(module, right.bit, e.target.checked)}
                                  disabled={isSubmitting}
                                  className="w-4 h-4 border-stone-300 rounded cursor-pointer"
                                />
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-end gap-2 pt-2">
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
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export const RolesManagement: React.FC = () => {
  const {session} = useUserStore()
  const canEditOrCreate = hasModuleRight(session, 'roles', 2)
  const canDelete = hasModuleRight(session, 'roles', 4)

  const [roles, setRoles] = useState<Role[]>([])
  const [schema, setSchema] = useState<PermissionSchema>({ modules: [], rights: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getRoles()

      if ('data' in response) {
        setRoles(extractRoleList(response.data))
      } else {
        setError('Не удалось загрузить роли.')
      }
    } catch (e) {
      console.error(e)
      setError('Ошибка при загрузке ролей.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPermissionsSchema = useCallback(async () => {
    try {
      const response = await getPermissionsSchema()
      if ('data' in response) {
        setSchema(extractPermissionSchema(response.data))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    void loadRoles()
    void loadPermissionsSchema()
  }, [loadPermissionsSchema, loadRoles])

  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => a.id - b.id)
  }, [roles])

  const openCreateModal = () => {
    if (!canEditOrCreate) {
      return
    }
    setEditingRole(null)
    setIsModalOpen(true)
  }

  const openEditModal = (role: Role) => {
    if (!canEditOrCreate) {
      return
    }
    setEditingRole(role)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingRole(null)
  }

  const handleSubmitRole = async (payload: RoleCreatePayload) => {
    if (!canEditOrCreate) {
      throw new Error('Недостаточно прав для изменения ролей.')
    }

    setIsSubmitting(true)

    try {
      if (editingRole?.id) {
        await updateRole(editingRole.id, payload)
      } else {
        await createRole(payload)
      }

      closeModal()
      await loadRoles()
    } catch (e) {
      throw e instanceof Error ? e : new Error('Ошибка при сохранении роли.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: number) => {
    if (!canDelete) {
      return
    }

    const confirmed = window.confirm('Удалить роль?')
    if (!confirmed) {
      return
    }

    try {
      await deleteRole(roleId)
      await loadRoles()
    } catch (e) {
      console.error(e)
      setError('Ошибка при удалении роли.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Роли</h3>
        {canEditOrCreate && (
          <button
            className="px-3 py-1 bg-amber-600 text-white rounded cursor-pointer"
            onClick={openCreateModal}
          >
            Создать роль
          </button>
        )}
      </div>

      <div className="bg-white border rounded shadow-sm p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-stone-600 border-b">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Имя роли</th>
              <th className="py-2 px-3">Homepage</th>
              <th className="py-2 px-3">Описание</th>
              <th className="py-2 px-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="text-stone-700">
                <td className="py-2 px-3" colSpan={5}>Загрузка ролей...</td>
              </tr>
            )}

            {!loading && error && (
              <tr className="text-red-600">
                <td className="py-2 px-3" colSpan={5}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => void loadRoles()}
                      className="px-3 py-1 bg-stone-100 text-stone-700 rounded hover:bg-stone-200"
                    >
                      Повторить
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && sortedRoles.length === 0 && (
              <tr className="text-stone-700">
                <td className="py-2 px-3" colSpan={5}>Роли не найдены</td>
              </tr>
            )}

            {!loading && !error && sortedRoles.map((role) => (
              <tr className="text-stone-700 hover:bg-stone-50 border-b" key={role.id}>
                <td className="py-2 px-3">{role.id}</td>
                <td className="py-2 px-3">{role.name}</td>
                <td className="py-2 px-3">{role.homepage || '—'}</td>
                <td className="py-2 px-3">{role.description || '—'}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    {canEditOrCreate && (
                      <button
                        className="text-amber-600 hover:text-amber-800 cursor-pointer"
                        title="Редактировать роль"
                        onClick={() => openEditModal(role)}
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        title="Удалить роль"
                        onClick={() => void handleDeleteRole(role.id)}
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
      </div>

      {canEditOrCreate && (
        <RoleModal
          isOpen={isModalOpen}
          schema={schema}
          isSubmitting={isSubmitting}
          initialRole={editingRole}
          onClose={closeModal}
          onSubmit={handleSubmitRole}
        />
      )}
    </div>
  )
}

export default RolesManagement
