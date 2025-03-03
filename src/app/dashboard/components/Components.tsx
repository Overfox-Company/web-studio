
import * as React from 'react';
import styled from '@emotion/styled'

import { Box, Button } from "@mui/material";
import { AppContext, ComponentType } from '@/context/AppContext';


interface DraggableProps {
    children?: React.ReactNode,

    data: ComponentType,
    style: React.CSSProperties,
    index: number;

    onStyleChange?: (newStyle: React.CSSProperties) => void,
    onDragStart: (index: number) => void;
}
export const ButtonCustom = styled(Button)({

})
export const LayoutBasic = styled(Box)({
    width: '100%',
    height: '100vh',
})


export const DragableBasicLayout = ({ children, data, index, onDragStart, style, }: DraggableProps) => {

    /* const handleDrop = (e: React.DragEvent) => {
         e.preventDefault();
         e.stopPropagation()
         const componentData = e.dataTransfer.getData("component");
         if (!componentData) return;
         // console.log("este es el componente layout")
         //   console.log(e.dataTransfer.getData("component"))
         try {
             const droppedComponent = JSON.parse(componentData);
             console.log(droppedComponent)
             if (droppedComponent.type === "layout") {
                 // Si es un layout, intercambiar posición
                 onDrop(index);
             } else {
                 console.log("no es un layout")
 
                 // Si no es un layout, anidarlo dentro del layout
 
                 onDrop(index, "layout", true, droppedComponent);
             }
         } catch (error) {
             console.error(error);
         }
     };*/
    const { onDrop } = React.useContext(AppContext)
    return (
        <LayoutBasic
            style={{ ...style, width: "100%", padding: 4, transform: "scale(0.98)", transformOrigin: "top" }}
            className="layout"
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => e.preventDefault()} // Permite drop
            onDrop={(e: any) => onDrop(e, data, index)} // Maneja drop condicionalmente
        >
            {children}
        </LayoutBasic>
    );
};
export function DraggableComponent({ name, index, onDragStart, style, onDrop, data }: DraggableProps) {
    return (

        <ButtonCustom
            style={style}
            className="button"
            draggable
            onDragStart={(e) => {

                e.dataTransfer.setData("component", JSON.stringify(data))
                onDragStart(index)
            }}
            onDragOver={(e) => e.preventDefault()} // Necesario para permitir drop
            onDrop={() => onDrop(index)}
        >
            {name}
        </ButtonCustom>
    );
}