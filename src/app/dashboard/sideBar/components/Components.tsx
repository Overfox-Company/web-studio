import { NextPage } from 'next'
import { AppContext } from '@/context/AppContext'
import { Box } from '@mui/material'
import { useContext, useState } from 'react'
import { ButtonCustom } from '../../components/Components'
import FadeIn from '@/components/animation/FadeIn'
interface Props { }

const Components: NextPage<Props> = ({ }) => {
    // const [color, setColor] = useState('')

    const [buttons, setButtons] = useState<
        { type: "button", id: number; style: React.CSSProperties }[]
    >([
        {
            type: "button",
            id: Date.now(),
            style: { backgroundColor: "#008CBA", color: "#fff", border: "1px solid #ccc" },
        },
    ]);
    const handleAddButton = () => {
        setButtons((prevButtons) => [
            ...prevButtons,
            {
                type: "button",
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
    return <FadeIn>
        <div style={{ padding: 8 }}>
            <h2 >Componentes</h2>
            {/* Sección con los componentes arrastrables */}
            <button onClick={handleAddButton}>Agregar Nuevo Botón</button>
            <div>
                <div>
                    {buttons.map((button, index) => (
                        <div
                            key={button.id}
                        >
                            <div draggable
                                onDragStart={(e) => e.dataTransfer.setData("component", JSON.stringify(button))}
                            >
                                <ButtonCustom

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


        </div>
    </FadeIn>

}

export default Components