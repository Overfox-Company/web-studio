

import { useState, useEffect } from "react";
import * as React from 'react';

import { ButtonCustom, DragableBasicLayout, DraggableComponent } from './Components';
import { AppContext, ComponentType } from "@/context/AppContext";


const Canvas = () => {

    const { openSideBar, setComponents, components } = React.useContext(AppContext)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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
                    id: parsedData.id, // Mantiene el mismo ID
                    name: parsedData.name,
                    style: parsedData.style,
                },
            ]);
        }
    };


    const handleDropItem = (index: number, type?: string, create?: boolean, item?: any) => {
        console.log("si entre en el drop")

        if (!create) {
            console.log("no exite create")
            if (draggedIndex === null || draggedIndex === index) return;
        }
        console.log("paso el if")
        const updatedComponents = [...components];
        let movedItem = null;

        // Solo mover el item si no estamos creando uno nuevo
        if (!create) {
            if (draggedIndex !== null) {
                [movedItem] = updatedComponents.splice(draggedIndex, 1);
            }
        }

        let newItem: ComponentType = { type: "", id: 0, name: "", style: {} };

        console.log("Create:" + create)
        console.log(item)
        if (create) {
            const parsedData = item;
            newItem = {
                type: parsedData.type,
                id: parsedData.id, // Mantiene el mismo ID
                name: parsedData.name,
                style: parsedData.style,
            }
        }
        if (type === "layout") {
            console.log("debe crear un hijo")
            // Si se arrastra un componente dentro de un layout, se anida en su propiedad `children`
            updatedComponents[index] = {
                ...updatedComponents[index],
                children: [...(updatedComponents[index].children || []), create && item ? newItem : (movedItem as ComponentType)],
            };
        } else {
            // Si no es un layout, se intercambia la posición
            if (movedItem) {
                updatedComponents.splice(index, 0, movedItem);
            }
        }

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
    useEffect(() => {
        console.log(components)
    }, [components])
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
                        data={comp}
                        style={comp.style}
                        key={comp.id}
                        name={"button"}
                        index={index}
                        onDragStart={handleDragStart}
                        onDrop={handleDropItem}
                    />
                    if (comp.type === "layout") return <DragableBasicLayout
                        data={comp}
                        style={comp.style}
                        key={comp.id}
                        name={"layout"}
                        index={index}
                        onDragStart={handleDragStart}
                        onDrop={handleDropItem}
                    >
                        {(comp.children ?? []).map((child, childIndex) => (
                            <DraggableComponent
                                data={child}
                                style={child.style}
                                key={child.id}
                                name={"button"}
                                index={childIndex}
                                onDragStart={handleDragStart}
                                onDrop={handleDropItem}
                            />
                        ))}
                    </DragableBasicLayout>
                })}
            </div>
        </div>
    );
}

export default Canvas