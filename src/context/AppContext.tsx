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
    onDrop: (e: React.DragEvent<HTMLDivElement>, parentDrop: ComponentType, index: number) => void

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




    const onDrop = (e: React.DragEvent<HTMLDivElement>, parentDrop: ComponentType, index: number) => {


        e.stopPropagation()
        const component = e.dataTransfer ? e.dataTransfer.getData("component") || "{}" : "{}";

        const item: ComponentType = JSON.parse(component)
        //  console.log(item)
        const exist = !!parentDrop.children?.find(parent => parent.id === item.id)
        console.log(exist)

        if (exist) {
            //  console.log("no exite create")
            if (draggedIndex === null || draggedIndex === index) return;
        }

        const updatedComponents = !parentDrop.id ? [...components] : [parentDrop];
        let componentToModify = updatedComponents[index]
        let movedItem = null;

        // Solo mover el item si no estamos creando uno nuevo
        if (exist) {
            // console.log("se ejecuta el moved item")
            if (draggedIndex !== null) {
                [movedItem] = updatedComponents.splice(draggedIndex, 1);
            }
        }

        let newItem: ComponentType = { type: "", id: 0, name: "", style: {} };


        if (!exist) {
            const parsedData = item;
            newItem = {
                type: parsedData.type,
                id: Date.now(), // Mantiene el mismo ID
                name: parsedData.name,
                style: parsedData.style,
            }
        }
        // console.log("----------")
        //  console.log(newItem)
        // console.log(parentDrop.type === "layout" && index)
        // console.log("----------")
        if (parentDrop.type === "layout") {
            //  console.log("debe crear un hijo")
            // Si se arrastra un componente dentro de un layout, se anida en su propiedad `children`
            componentToModify = {
                ...componentToModify,
                children: [...(componentToModify.children || []), !exist ? newItem : (movedItem as ComponentType)],
            };
        } else {
            // Si no es un layout, se intercambia la posición
            if (movedItem && index) {
                updatedComponents.splice(index, 0, movedItem);
            }
        }
        //  console.log("componente a actualizar")
        //  console.log(updatedComponents[index])
        const updateComponent = (components: any[], componentToModify: any): any[] => {
            return components.map(comp => {
                if (comp.id === componentToModify.id) {
                    return { ...comp, ...componentToModify }; // Actualiza el componente encontrado
                }
                if (comp.children && Array.isArray(comp.children)) {
                    return { ...comp, children: updateComponent(comp.children, componentToModify) };
                }
                return comp;
            });
        };

        const finalComponents = updateComponent(components, componentToModify);


        //hay que hacer una copia de la jerarquia que esta arriba del padre
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
