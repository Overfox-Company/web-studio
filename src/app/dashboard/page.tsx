'use client'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import * as React from 'react';
import { useEffect, useContext } from "react";
import { createTheme } from '@mui/material/styles';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import ComputerIcon from '@mui/icons-material/Computer';
import Image from 'next/image';
import Canvas from "./components/Canvas";
import Link from "next/link";
import SideBar from "./sideBar/SideBar";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ExtensionSharpIcon from '@mui/icons-material/ExtensionSharp';
import { AppContext } from "@/context/AppContext";
const Page = () => {

    const PRIMARYCOLOR = "rgb(200,255,230)"
    const PRIMARYCOLORL = "rgb(29, 202, 122)"
    const NAVIGATION: Navigation = [

        {
            segment: 'layout',
            title: 'Layout',
            icon: <ViewComfyIcon />,
        },
        {
            segment: 'components',
            title: 'Components',
            icon: <ExtensionSharpIcon />,
        },
        /*    {
                segment: 'Videos',
                title: 'Videos',
                icon: < ArtTrackIcon />,
            },
            {
                segment: 'UploadModels',
                title: 'Upload models',
                icon: <AssignmentIndIcon />,
            },
            {
                segment: 'Models',
                title: 'Models',
                icon: <BookIcon />,
            },
            {
                segment: 'UploadGaleries',
                title: 'Upload galeries',
                icon: <CloudUploadIcon />,
            },
            {
                segment: 'Galery',
                title: 'Galery',
                icon: <DashboardIcon />,
            },*/
    ];
    const demoTheme = createTheme({
        cssVariables: {
            colorSchemeSelector: 'data-toolpad-color-scheme',
        },
        colorSchemes: {
            light: {
                palette: {
                    primary: {
                        main: PRIMARYCOLORL, // Cambia esto por el color que prefieras en modo oscuro
                        light: PRIMARYCOLORL,
                        dark: PRIMARYCOLORL,
                        //      contrastText: "PRIMARYCOLORL",
                    },
                },
            },
            dark: {
                palette: {
                    primary: {
                        main: PRIMARYCOLOR, // Cambia esto por el color que prefieras en modo oscuro
                        light: PRIMARYCOLOR,
                        dark: PRIMARYCOLOR,
                        contrastText: "black",

                    },

                },
            },
        },
        breakpoints: {
            values: {
                xs: 0,
                sm: 600,
                md: 600,
                lg: 1200,
                xl: 1536,
            },
        },
    });
    //  const { window } = props;
    //  const { authUpload } = useContext(AppContext)

    //  const demoWindow = window !== undefined ? window() : undefined;
    const Title = () => {
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link href={'/'} target=' _blank'>

                    <Image src="/assets/logo.svg" alt="" width={80} height={40} />
                </Link>

            </div>


        )
    }
    const router = useDemoRouter('/dashboard');
    const { setTab } = useContext(AppContext)
    const handleChangeTab = () => {
        switch (router.pathname) {
            case '/layout':
                setTab(0);
                break;
            case '/components':
                setTab(1);
                break;
            default:
                break;
        }
    };

    useEffect(() => { handleChangeTab() }, [router.pathname])
    return <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
    //   window={demoWindow}
    >
        <DashboardLayout
            slots={{
                appTitle: Title,
            }}
        >
            <DndProvider backend={HTML5Backend}>
                <div style={{ position: "relative" }}>
                    <SideBar />

                    <Canvas />
                </div>

            </DndProvider>
        </DashboardLayout>
    </AppProvider>

}

export default Page