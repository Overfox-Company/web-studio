import React, { FC } from 'react'
import { Container, Item } from './Container';
import styled from '@emotion/styled';
const RenderColor = styled.div({
    borderRadius: 200,
    height: 24,
    width: 24
})
interface colors {
    values: string;
}

const Color: FC<colors> = ({ values }) => {
    return (
        <RenderColor style={{ backgroundColor: values }} />
    )
}
export default Color;