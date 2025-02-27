import { FC } from 'react';
import styled from '@emotion/styled';
import { TextProps } from '@/types/App';

import { Container, Item } from './Container';
import { Typography } from '@mui/material';



const PL = styled.p({
    fontFamily: '"Inter",sans-serif',
    fontWeight: 600,
    fontSize: 16,
    color: 'white',
    letterSpacing: 0.96
});

export const Title = styled(Typography)({
    fontFamily: '"Inter",sans-serif',
    fontWeight: 700,
    fontSize: 18,
    // color: 'white',
})
export const TextLight: FC<TextProps> = ({ children, ...props }) => {
    return (<PL {...props}>
        {children}
    </PL>)
}
export const Tag = styled.span({
    fontStyle: "italic",
    color: '#74ABFF',
    fontSize: 12,

})
