import FadeIn from '@/components/animation/FadeIn';
import { NextPage } from 'next'
import { useState } from 'react';

interface Props { }

const Layouts: NextPage<Props> = ({ }) => {

    const [layouts, setLayouts] = useState<
        { type: "layout"; id: number; style: React.CSSProperties }[]
    >([
        {
            type: "layout",
            id: Date.now(),
            style: { width: "200px", height: "100vh", backgroundColor: "#ddd", border: "1px solid #aaa" },
        },
    ]);

    const handleAddLayout = () => {
        setLayouts((prevLayouts) => [
            ...prevLayouts,
            {
                type: "layout",
                id: Date.now(),
                style: { width: "200px", height: "100vh", backgroundColor: "#bbb", border: "1px solid #777" },
            },
        ]);
    };

    const handleStyleChange = (
        id: number,
        property: string,
        value: string
    ) => {
        setLayouts((prevLayouts) =>
            prevLayouts.map((layout) =>
                layout.id === id
                    ? { ...layout, style: { ...layout.style, [property]: value } }
                    : layout
            )
        );
    };

    const [activeLayoutId, setActiveLayoutId] = useState<number | null>(null);

    return (
        <FadeIn>
            <div style={{ padding: 8 }}>
                <h2>Layouts</h2>
                <button onClick={handleAddLayout}>Agregar Nuevo Layout</button>
                <div>
                    {layouts.map((layout, index) => (
                        <div key={layout.id}>
                            <div
                                draggable
                                onDragStart={(e) => {
                                    console.log(layout)
                                    e.dataTransfer.setData("component", JSON.stringify(layout))
                                }}
                                style={{ ...layout.style, height: 120 }}
                            >
                                Layout {index + 1}
                            </div>
                            <button onClick={() => setActiveLayoutId(layout.id)}>Editar Estilos</button>
                        </div>
                    ))}
                </div>
                {activeLayoutId && (
                    <div>
                        <h3>Editar Estilos del Layout</h3>
                        <label>Color de Fondo: </label>
                        <input
                            type="color"
                            value={
                                layouts.find((layout) => layout.id === activeLayoutId)?.style.backgroundColor || "#ffffff"
                            }
                            onChange={(e) => {
                                handleStyleChange(activeLayoutId, "backgroundColor", e.target.value);
                            }}
                        />
                        <label>Ancho (px): </label>
                        <input
                            type="number"
                            value={
                                parseInt(
                                    layouts.find((layout) => layout.id === activeLayoutId)?.style.width?.toString() || "200"
                                )
                            }
                            onChange={(e) => {
                                handleStyleChange(activeLayoutId, "width", `${e.target.value}px`);
                            }}
                        />
                        <label>Alto (px): </label>
                        <input
                            type="number"
                            value={
                                parseInt(
                                    layouts.find((layout) => layout.id === activeLayoutId)?.style.height?.toString() || "150"
                                )
                            }
                            onChange={(e) => {
                                handleStyleChange(activeLayoutId, "height", `${e.target.value}px`);
                            }}
                        />
                    </div>
                )}
            </div>
        </FadeIn>
    );
}

export default Layouts