import { useState } from "react";
import * as React from 'react';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
interface Props { }
import styled from '@emotion/styled'

import { useDrag, useDrop } from "react-dnd";
import { Button } from "@mui/material";

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
export function DraggableComponent({ onStyleChange, name, index, onDragStart, style, onDrop }: DraggableProps) {
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