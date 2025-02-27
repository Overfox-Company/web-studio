import GoBack from '@/components/UI/GoBack'
import { AppContext } from '@/context/AppContext'
import { Box } from '@mui/material'
import { NextPage } from 'next'
import { useContext, useEffect, useState } from 'react'
import { ButtonCustom } from '../components/Components'
import Components from './components/Components'
import Layouts from './components/Layouts'

interface Props { }

const SideBar: NextPage<Props> = ({ }) => {
    const { openSideBar, tab } = useContext(AppContext)



    useEffect(() => { console.log(tab) }, [tab])

    return <div style={{ display: "flex", position: "fixed", top: 80, zIndex: 99, }}>

        <Box style={{
            display: "flex",
            //justifyContent: "flex-end",
            minHeight: 200,
            width: openSideBar ? 250 : 0,
            backgroundColor: "white",
            borderRadius: 20,
            // padding: openSideBar ? 8 : 0,
            boxShadow: '0 1px 12px 1px rgba(15, 3, 56, 0.17)',
            transition: "width 0.2s",
            overflow: "hidden"
        }}>
            {tab === 0 ? <Layouts /> : null}
            {tab === 1 ? <Components /> : null}

        </Box>
        <GoBack />
    </div>

}

export default SideBar