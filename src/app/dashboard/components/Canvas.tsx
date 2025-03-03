

import { useState, useEffect } from "react";
import * as React from 'react';

import { ButtonCustom, DragableBasicLayout, DraggableComponent } from './Components';
import { AppContext, ComponentType } from "@/context/AppContext";


const Canvas = () => {

    const { openSideBar, setComponents, components, draggedIndex, setDraggedIndex } = React.useContext(AppContext)

    // Agregar un nuevo componente al lienzo basado en el tipo de componente arrastrado
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const componentData = e.dataTransfer.getData("component");
        if (!componentData) return;

        const parsedData = JSON.parse(componentData);

        // Verificar si el componente ya está en el lienzo buscando su ID en `components`
        const isExistingComponent = components.some((comp) => comp.id === parsedData.id);

        if (!isExistingComponent) {
            // Solo agregar si el componente no está en el lienzo (viene del panel lateral)
            setComponents((prev) => [
                ...prev,
                {
                    type: parsedData.type,
                    id: Date.now(), // Mantiene el mismo ID
                    name: parsedData.name,
                    style: parsedData.style,
                },
            ]);
        }
    };





    // Evitar el comportamiento por defecto de `onDragOver` para permitir el `drop`
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };
    useEffect(() => {
        console.log(components)
    }, [components])
    const renderComponents = (components: ComponentType[]) => {
        return components.map((comp, index) => {
            if (comp.type === "button") {
                return (
                    <DraggableComponent
                        data={comp}
                        style={comp.style}
                        key={comp.id}
                        index={index}
                        onDragStart={handleDragStart}
                    />
                );
            }

            if (comp.type === "layout") {
                return (
                    <DragableBasicLayout
                        data={comp}
                        style={comp.style}
                        key={comp.id}
                        index={index}
                        onDragStart={handleDragStart}
                    >
                        {comp.children && Array.isArray(comp.children) && renderComponents(comp.children)}
                    </DragableBasicLayout>
                );
            }

            return null; // Si el tipo no es reconocido, no renderiza nada
        });
    };

    return (
        <div style={{ borderRadius: 4 }}>
            {/* Lienzo donde se agregan los componentes */}
            <div className="canvas" onDragOver={handleDragOver} onDrop={handleDrop}>
                {renderComponents(components)}
            </div>
        </div>
    );
}






export default Canvas