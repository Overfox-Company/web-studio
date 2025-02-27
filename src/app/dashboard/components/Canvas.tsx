

import { useState } from "react";
import * as React from 'react';

import { ButtonCustom, DragableBasicLayout, DraggableComponent } from './Components';
import { AppContext } from "@/context/AppContext";


const Canvas = () => {

    const { openSideBar, setComponents, components } = React.useContext(AppContext)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    // Agregar un nuevo componente al lienzo basado en el tipo de componente arrastrado
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const componentData = e.dataTransfer.getData("component");
        console.log(componentData)

        if (componentData) {
            const parsedData = JSON.parse(componentData); // Convertir los datos almacenados en objeto

            setComponents((prev) => [
                ...prev,
                {
                    type: parsedData.type,
                    id: Date.now(),
                    name: parsedData.name, // o el nombre que desees
                    style: parsedData.style, // Los estilos del botón
                },
            ]);
        }
    };
    const handleDropItem = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const updatedComponents = [...components];
        const [movedItem] = updatedComponents.splice(draggedIndex, 1);
        updatedComponents.splice(index, 0, movedItem);

        setComponents(updatedComponents);
        setDraggedIndex(null);
    };
    // Evitar el comportamiento por defecto de `onDragOver` para permitir el `drop`
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    return (
        <div style={{ borderRadius: 4 }}>

            {/* Sidebar con elementos arrastrables */}

            {/* Lienzo donde se agregan los componentes */}
            <div

                className="canvas"
                onDragOver={handleDragOver} // Necesario para permitir el `drop`
                onDrop={handleDrop} // Maneja el `drop` y agrega el componente
            >
                {components.map((comp, index) => {

                    if (comp.type === "button") return <DraggableComponent
                        style={comp.style}
                        key={comp.id}
                        name={"button"}
                        index={index}
                        onDragStart={handleDragStart}
                        onDrop={handleDropItem}
                    />
                    if (comp.type === "layout") return <DragableBasicLayout
                        style={comp.style}
                        key={comp.id}
                        name={"button"}
                        index={index}
                        onDragStart={handleDragStart}
                        onDrop={handleDropItem}
                    />
                })}
            </div>
        </div>
    );
}

export default Canvas