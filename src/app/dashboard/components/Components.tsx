
import * as React from 'react';
import styled from '@emotion/styled'

import { Box, Button } from "@mui/material";

interface DraggableProps {
    name: string;
    style: React.CSSProperties,
    index: number;
    onStyleChange?: (newStyle: React.CSSProperties) => void,
    onDragStart: (index: number) => void;
    onDrop: (index: number) => void;
}
export const ButtonCustom = styled(Button)({

})
export const LayoutBasic = styled(Box)({
    width: '100%',
    height: '100vh',
})


export const DragableBasicLayout = ({ name, index, onDragStart, style, onDrop }: DraggableProps) => {
    return (
        <LayoutBasic
            style={{ ...style, width: '100%', backgroundColor: "red" }}
            className="button"
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => e.preventDefault()} // Necesario para permitir drop
            onDrop={() => onDrop(index)}
        >
            {index + 1}
        </LayoutBasic>
    )
}
export function DraggableComponent({ name, index, onDragStart, style, onDrop }: DraggableProps) {
    return (

        <ButtonCustom
            style={style}
            className="button"
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => e.preventDefault()} // Necesario para permitir drop
            onDrop={() => onDrop(index)}
        >
            {name}
        </ButtonCustom>
    );
}