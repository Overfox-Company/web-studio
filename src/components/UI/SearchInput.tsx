'use client'
import React, { FC, KeyboardEvent, useContext, useEffect, useState } from 'react';
import { Container, Item } from './Container';
import { IconButton } from '@mui/material';
import Image from 'next/image';
import styled from '@emotion/styled'
import { AppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import Link from 'next/link';
import { PRIMARYCOLOR } from '@/constant/Colors';
const Input = styled.input({
    width: '100%',
    height: 40,
    border: 0,
    marginLeft: 10,
    outline: 'none',
    backgroundColor: 'rgba(40,40,40,1)'
})
const Card = styled.div({
    backgroundColor: 'rgba(40,40,40,1)',
    borderRadius: 28,
    display: 'flex', alignItems: 'center',
    width: '100%',
    padding: '2px 12px',
    // border: "1px solid rgba(255,255,255,0.01)",

})
const SearchInput: FC<{ search: string, setSearch: any, setShowMenu: any }> = ({ search, setSearch, setShowMenu }) => {
    const { setSearchName } = useContext(AppContext)


    const router = useRouter();

    const onLoad = () => {
        setShowMenu(false)
        localStorage.setItem('parameterSeach', search)
        const currentPath = window.location.pathname;
        if (currentPath !== '/search') {
            // Redirecciona a la ruta '/search'

            router.push('/search');
            setSearchName(search);

        } else {

            // Ejecuta setSearchName solo si la ruta actual es '/search'
            setSearchName(search);
        }
    }
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onLoad();
        }
    };
    const handleChange = (value: string) => {
        setSearch(value)
        setShowMenu(true)
    }
    const onClick = () => {
        setShowMenu(true)
        //console.log(search)
    }
    useEffect(() => {
        if (localStorage.getItem("parameterSeach")) {
            setSearch(localStorage.getItem("parameterSeach") || '')
            setSearchName(localStorage.getItem("parameterSeach") || '')
        }
    }, [])
    return (
        <Card>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 4 }}>
                <IconButton onClick={() => onLoad()}>
                    <Image src={'/assets/Search.svg'} title="Search icon" alt={"Search Icon"} width={24} height={24} />
                </IconButton>
                <Input
                    onClick={() => onClick()

                    }
                    autoComplete="nope"
                    placeholder='Search in ONLYSX'
                    value={search}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e)}
                />
            </div>

        </Card>
    )
}
export default SearchInput