'use client'
import { NextPage } from 'next'
import { Container, ContentContainer, Item, PrincipalContainer } from '../UI/Container'
import Image from 'next/image'
import Link from 'next/link'
import SearchBar from './components/searchBar/SearchBar'
import { useContext, useEffect, useState } from 'react'
import { Background, PRIMARYCOLOR } from '@/constant/Colors'
import { AppContext } from '@/context/AppContext'

import { usePathname } from 'next/navigation'
import { ButtonBlue } from '../UI/Buttons'
import Feedback from './components/FeedbackComponent/Feedback'
import { Box } from '@mui/material'
interface Props { }
const routes = [{ url: '/', name: 'Home' }, { url: '/models', name: 'Models' }]
const Navbar: NextPage<Props> = ({ }) => {
    const [isFixed, setIsFixed] = useState(false);
    const { setSearchName } = useContext(AppContext)
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const resetSearch = () => {
        localStorage.removeItem("parameterSeach")
        setSearchName('')
    }
    useEffect(() => {
        //  //console.log(pathname)
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsFixed(true);
            } else {
                setIsFixed(false);
            }

        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return <PrincipalContainer>
        <ContentContainer style={{ position: 'relative', padding: 0 }}>
            <Feedback
                open={open}
                setOpen={setOpen}
            />
            <nav style={{ width: '100%' }}>
                <div style={{ height: isFixed ? 180 : 0, width: '100%', }} />
                <Box className={isFixed ? 'navbar-fixed' : 'navbar'}
                    sx={{ height: { xs: 180, md: 100 } }}
                    style={{

                        height: 180,
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'rgb(15,15,15)',
                        padding: '0 20px'
                    }}>

                    <Container alignItems='center' justifyContent='space-between' rowSpacing={1}>
                        <Item xs={4} md={1.5}>
                            <Link href={'/'} onClick={() => resetSearch()}>
                                <Image alt="onlysx" title="onlysx - free porn" src={'/assets/logo.svg'} width={100} height={50} />
                            </Link>
                        </Item>
                        <Item xs={8} md={6} >
                            <SearchBar />
                        </Item>
                        <Item sx={{ display: { xs: 'none', md: 'flex' } }} xs={12} md={1.1} style={{ justifyContent: 'flex-end', }} >
                            {/* <Link href={"/about"} style={{ color: PRIMARYCOLOR }}>
                                About
                            </Link>*/}
                            <ButtonBlue onClick={() => setOpen(true)}>
                                Give feedback
                            </ButtonBlue>
                        </Item>

                        <Item xs={4} md={8} style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: '100%', gap: 15, display: 'flex' }}>
                                {routes.map((route, index) => {
                                    return (
                                        <Link key={route.url} href={route.url} style={{ color: pathname === route.url ? PRIMARYCOLOR : 'white' }}>
                                            {route.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        </Item>
                        <br /><br />
                        <Item sx={{ display: { xs: 'flex', md: 'none' } }} xs={12} md={1.1} style={{ justifyContent: 'flex-end', }} >
                            {/* <Link href={"/about"} style={{ color: PRIMARYCOLOR }}>
                                About
                            </Link>*/}
                            <ButtonBlue onClick={() => setOpen(true)}>
                                Give feedback
                            </ButtonBlue>
                        </Item>
                    </Container>

                </Box>
            </nav>

        </ContentContainer>
    </PrincipalContainer >
}

export default Navbar