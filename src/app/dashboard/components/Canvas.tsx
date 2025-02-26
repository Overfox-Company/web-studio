
import { NextPage } from 'next'
import { useState } from "react";
import * as React from 'react';

import { ButtonCustom, DraggableComponent } from './Components';


const Canvas = () => {
    const [components, setComponents] = useState<{ id: number; name: string; style: React.CSSProperties }[]>([]);

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    // Agregar un nuevo componente al lienzo basado en el tipo de componente arrastrado
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const componentData = e.dataTransfer.getData("component");

        if (componentData) {
            const parsedData = JSON.parse(componentData); // Convertir los datos almacenados en objeto

            setComponents((prev) => [
                ...prev,
                {
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




    const [styles, setStyles] = useState<React.CSSProperties>({
        backgroundColor: "", // color de fondo
        color: "", // color del texto
        border: "1px solid #ccc", // borde
    });



    const [color, setColor] = useState('')
    const [buttons, setButtons] = useState<
        { id: number; style: React.CSSProperties }[]
    >([
        {
            id: Date.now(),
            style: { backgroundColor: "#008CBA", color: "#fff", border: "1px solid #ccc" },
        },
    ]);
    const handleAddButton = () => {
        setButtons((prevButtons) => [
            ...prevButtons,
            {
                id: Date.now(),
                style: { backgroundColor: "#4CAF50", color: "#fff", border: "1px solid #ccc" },
            },
        ]);
    };
    const handleStyleChange = (
        id: number,
        property: string,
        value: string
    ) => {
        setButtons((prevButtons) =>
            prevButtons.map((button) =>
                button.id === id
                    ? {
                        ...button,
                        style: { ...button.style, [property]: value },
                    }
                    : button
            )
        );
    };

    const [activeButtonId, setActiveButtonId] = useState<number | null>(null);

    // Función para agregar un nuevo botón con estilos por defecto



    return (
        <div>

            {/* Sidebar con elementos arrastrables */}
            <div>
                <h2 >Componentes</h2>
                {/* Sección con los componentes arrastrables */}
                <button onClick={handleAddButton}>Agregar Nuevo Botón</button>
                <div>


                    <div>
                        {buttons.map((button, index) => (
                            <div>
                                <div draggable
                                    onDragStart={(e) => e.dataTransfer.setData("component", JSON.stringify(button))}
                                >
                                    <ButtonCustom
                                        key={button.id}
                                        style={button.style}
                                    >
                                        Botón {index + 1}
                                    </ButtonCustom>
                                </div>

                                <div>
                                    {/* Control para seleccionar el botón activo */}
                                    <button onClick={() => setActiveButtonId(button.id)}>Editar Estilos</button>
                                </div>
                            </div>

                        ))}
                    </div>
                    {activeButtonId && (
                        <div>
                            <h3>Editar Estilos del Botón </h3>
                            <label>Color del Texto: </label>
                            <input
                                type="color"
                                value={
                                    buttons.find((button) => button.id === activeButtonId)?.style.color || "#000000"
                                }
                                onChange={(e) => {
                                    handleStyleChange(activeButtonId, "color", e.target.value);
                                }} />
                            <label>Color del fondo: </label>
                            <input
                                type="color"
                                value={
                                    buttons.find((button) => button.id === activeButtonId)?.style.backgroundColor || "#ff0000"
                                }
                                onChange={(e) => {
                                    handleStyleChange(activeButtonId, "backgroundColor", e.target.value);
                                }} />
                        </div>
                    )}
                </div>

                <div
                    style={{ backgroundColor: color }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("component", "Tarjeta")}
                >
                    Agregar Tarjeta
                </div>
            </div>

            {/* Lienzo donde se agregan los componentes */}
            <div
                className="canvas"
                onDragOver={handleDragOver} // Necesario para permitir el `drop`
                onDrop={handleDrop} // Maneja el `drop` y agrega el componente
            >
                {components.map((comp, index) => (
                    <DraggableComponent
                        style={comp.style}
                        key={comp.id}
                        name={"button"}
                        index={index}
                        onDragStart={handleDragStart}
                        onDrop={handleDropItem}
                    />
                ))}
            </div>
        </div>
    );
}

export default Canvas