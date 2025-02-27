'use client'
import SearchInput from '@/components/UI/SearchInput'
import { NextPage } from 'next'
import { useContext, useEffect, useState } from 'react'
import AutoCompleteMenu from './AutoCompleteMenu'
import { AppContext } from '@/context/AppContext'
import Link from 'next/link'
import { PRIMARYCOLOR } from '@/constant/Colors'

interface Props { }

const SearchBar: NextPage<Props> = ({ }) => {
    const { searchName } = useContext(AppContext)
    const [search, setSearch] = useState('')
    const [showMenu, setShowMenu] = useState(false)
    useEffect(() => {
        setSearch(searchName)
    }, [searchName])
    useEffect(() => {
        const handleClick = (e: any) => {

            if (showMenu && e.target.tagName.toLowerCase() !== 'input') {

                setShowMenu(false)
            }

        };
        // Añadir event listener cuando el componente se monta
        document.addEventListener('click', handleClick);
        // Eliminar event listener cuando el componente se desmonta
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [search, showMenu]);

    return <div style={{ width: '100%', position: 'relative', alignItems: 'center', display: 'flex', }}>
        <SearchInput search={search} setSearch={setSearch} setShowMenu={setShowMenu} />
        <br />
        <AutoCompleteMenu
            search={search}
            setSearch={setSearch}
            showMenu={showMenu}
            setShowMenu={setShowMenu} />
    </div>
}

export default SearchBar