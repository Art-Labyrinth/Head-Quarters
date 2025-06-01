import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export const usePageTitle = (title: string) => {
    const location = useLocation()

    useEffect(() => {
        document.title = title
    }, [title, location.pathname])
}
