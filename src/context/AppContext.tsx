'use client'
import { Update } from '@mui/icons-material';
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
export interface ComponentType {
    type: string;
    id: number;
    name: string;
    style: React.CSSProperties,
    children?: ComponentType[];
}
type ComponentTypeArray = ComponentType[];
type ContextData = {
    openSideBar: boolean,
    setOpenSidebar: Dispatch<SetStateAction<boolean>>,
    components: ComponentTypeArray,
    setComponents: Dispatch<SetStateAction<ComponentTypeArray>>
    tab: number,
    setTab: Dispatch<SetStateAction<number>>,
    draggedIndex: null | number, setDraggedIndex: Dispatch<SetStateAction<null | number>>,
    onDrop: (e: React.DragEvent<HTMLDivElement>, parentDrop: ComponentType, index: number, action: string) => void

};
export const AppContext = createContext<ContextData>({
    openSideBar: true,
    setOpenSidebar: () => { },
    components: [],
    setComponents: () => { },
    tab: 0,
    setTab: () => { },
    draggedIndex: null,
    setDraggedIndex: () => { },
    onDrop: () => { }
});


export const AppContextProvider: React.FC<ProviderProps> = ({ children }) => {

    const [openSideBar, setOpenSidebar] = useState(true)
    const [components, setComponents] = useState<ComponentTypeArray>([]);
    const [tab, setTab] = useState<number>(0)
    const [draggedIndex, setDraggedIndex] = useState<null | number>(null)




    //this function 
    const onDrop = (e: React.DragEvent<HTMLDivElement>, parentDrop: ComponentType, index: number, action: string) => {
        e.stopPropagation();
        const component = e.dataTransfer ? e.dataTransfer.getData("component") || "{}" : "{}";
        const item: ComponentType = JSON.parse(component);
        const exist = !!parentDrop.children?.find(parent => parent.id === item.id);
        console.log(parentDrop);

        if (exist) {
            if (draggedIndex === null || draggedIndex === index) return;
        }

        const updatedComponents = !parentDrop.id ? [...components] : [parentDrop];
        let componentToModify = updatedComponents[0];
        let movedItem = null;

        if (exist) {
            if (draggedIndex !== null) {
                [movedItem] = updatedComponents.splice(draggedIndex, 1);
            }
        }

        let newItem: ComponentType = { type: "", id: 0, name: "", style: {} };

        if (!exist) {
            const parsedData = item;
            newItem = {
                type: parsedData.type,
                id: Date.now(),
                name: parsedData.name,
                style: parsedData.style,
            };
        }

        if (action === "insert") {
            if (parentDrop.type === "layout") {
                componentToModify = {
                    ...componentToModify,
                    children: [...(componentToModify.children || []), !exist ? newItem : (movedItem as ComponentType)],
                };
                // Eliminar la posición original del componente movido
                console.log(movedItem)
                console.log(draggedIndex)
                if (draggedIndex !== null) {
                    console.log("se ejecuta el insert y debio eliminar el componente")
                    updatedComponents.splice(draggedIndex, 1);
                }
            }
        } else if (action === "swap") {
            if (movedItem && index !== null) {
                const targetItem = updatedComponents[index];
                updatedComponents[index] = movedItem;
                if (draggedIndex !== null) {
                    updatedComponents[draggedIndex] = targetItem;
                }
                console.log("si se ejecuta el swap");
            }
        }

        const updateComponent = (components: any[], componentToModify: any): any[] => {
            return components.map(comp => {
                if (comp.id === componentToModify.id) {
                    return { ...comp, ...componentToModify };
                }
                if (comp.children && Array.isArray(comp.children)) {
                    return { ...comp, children: updateComponent(comp.children, componentToModify) };
                }
                return comp;
            });
        };

        const finalComponents = updateComponent(components, componentToModify);

        setComponents(finalComponents);
        setDraggedIndex(null);
    }

    return (
        <AppContext.Provider
            value={{
                draggedIndex, setDraggedIndex,
                tab,
                setTab,
                openSideBar,
                setOpenSidebar,
                components,
                setComponents,
                onDrop
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
