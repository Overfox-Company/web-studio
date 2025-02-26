'use client'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { NextPage } from 'next'
import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import ComputerIcon from '@mui/icons-material/Computer';
import Image from 'next/image';
import Canvas from "./components/Canvas";
import Link from "next/link";


interface Props {
    window: any
}

const Page = (props: Props) => {

    const NAVIGATION: Navigation = [

        {
            segment: 'dashboard',
            title: 'Dashboard',
            icon: <ComputerIcon />,
        },
        /*  {
              segment: 'UploadVideos',
              title: 'Upload videos',
              icon: <CloudUploadIcon />,
          },
          {
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
        /* colorSchemes: {
             light: {
                 palette: {
                     primary: {
                         main: "#1976D2",
                         light: "#63a4ff",
                         dark: "#004ba0",
                         contrastText: "#fff",
                     },
                 },
             },
             dark: {
                 palette: {
                     primary: {
                         main: PRIMARYCOLOR, // Cambia esto por el color que prefieras en modo oscuro
                         light: PRIMARYCOLOR,
                         dark: PRIMARYCOLOR,
                         contrastText: "#000",
                     },
                 },
             },
         },*/
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
    const { window } = props;
    //  const { authUpload } = useContext(AppContext)
    const router = useDemoRouter('/dashboard');
    const demoWindow = window !== undefined ? window() : undefined;
    const Title = () => {
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link href={'/'} target=' _blank'>

                    <Image src="/assets/logo.svg" alt="OnlySX" width={80} height={40} />
                </Link>

            </div>

        )
    }
    return <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        window={demoWindow}
    >
        <DashboardLayout
            slots={{
                appTitle: Title,
            }}
        >
            <DndProvider backend={HTML5Backend}>

                <Canvas />
            </DndProvider>
        </DashboardLayout>
    </AppProvider>

}

export default Page