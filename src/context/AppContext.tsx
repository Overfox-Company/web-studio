'use client'
import { unstable_noStore as noStore } from 'next/cache';
import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
const SnackbarInitial = {
    message: '',
    type: "error" as "error" | "warning" | "info" | "success"
}


type ProviderProps = {
    children?: React.ReactNode;
    className?: string;
};
interface ComponentType {
    type: string;
    id: number;
    name: string;
    style: React.CSSProperties
}
type ComponentTypeArray = ComponentType[];
type ContextData = {
    openSideBar: boolean,
    setOpenSidebar: Dispatch<SetStateAction<boolean>>,
    components: ComponentTypeArray,
    setComponents: Dispatch<SetStateAction<ComponentTypeArray>>
    tab: number,
    setTab: Dispatch<SetStateAction<number>>,

};
export const AppContext = createContext<ContextData>({
    openSideBar: true,
    setOpenSidebar: () => { },
    components: [],
    setComponents: () => { },
    tab: 0,
    setTab: () => { }

});


export const AppContextProvider: React.FC<ProviderProps> = ({ children }) => {

    const [openSideBar, setOpenSidebar] = useState(true)
    const [components, setComponents] = useState<ComponentTypeArray>([]);
    const [tab, setTab] = useState<number>(0)


    return (
        <AppContext.Provider
            value={{
                tab,
                setTab,
                openSideBar,
                setOpenSidebar,
                components,
                setComponents
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
