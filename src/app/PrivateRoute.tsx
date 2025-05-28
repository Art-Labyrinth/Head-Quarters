import { ReactElement, useLayoutEffect } from 'react'
import { Navigate } from 'react-router'
import { useLocation } from 'react-router-dom'

import { useUserStore } from '../entities/user'

type PrivateRouteType = {
  isAllowed: boolean;
  redirectTo?: string;
  children?: React.ReactNode;
}

export function PrivateRoute({ isAllowed, redirectTo = '/login', children }: PrivateRouteType): ReactElement {
  const { pathname, search, hash } = useLocation()

  useLayoutEffect(() => {
    if (!isAllowed) useUserStore.setState(() => ({ loginRedirect: `${pathname}${search}${hash}` }))
  }, [hash, isAllowed, pathname, search])

  if (!isAllowed) {
    return <Navigate to={redirectTo} />
  }

  return children as ReactElement
}

export default PrivateRoute;
