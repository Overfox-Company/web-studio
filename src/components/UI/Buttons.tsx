'use client'
import { FC } from 'react';
import { ButtonType } from '@/types/App';
import styled from '@emotion/styled';
import LoadingButton from '@mui/lab/LoadingButton';
import { PRIMARYCOLOR } from '@/constant/Colors';
import { TextLight } from './Text';
import { IconButton, Button } from '@mui/material';
import Image from 'next/image';

export const ButtonBlue = styled((props: ButtonType) => (
    <Button {...props} variant="contained" >
        <TextLight style={{ color: 'white' }}>{props.children}</TextLight>
    </Button>
))({
    textTransform: 'none',
    backgroundColor: PRIMARYCOLOR,
    display: 'flex',
    width: '100%',
    padding: '8px 12px',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    justifyContent: 'center',
    border: `1px solid ${PRIMARYCOLOR}`,
    '&:hover': {
        backgroundColor: PRIMARYCOLOR,// Oscurece el color y reduce la opacidad
        opacity: 0.9
    },
});

export const ButtonBlueOutlined = styled((props: ButtonType) => (
    <LoadingButton {...props} variant="outlined" loading={props.loading} loadingIndicator="Loading…">
        {!props.loading ? <TextLight style={{ color: PRIMARYCOLOR, }}>{props.children}</TextLight> : null}
    </LoadingButton>
))({
    textTransform: 'none',
    display: 'flex',
    width: '100%',
    height: 48,
    padding: '12px 16px',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    border: `1px solid ${PRIMARYCOLOR}`,
    justifyContent: 'center',
});

export const DeleteIcon: FC<any> = (props) => {
    return (
        <IconButton {...props} style={{ backgroundColor: PRIMARYCOLOR, borderRadius: 4 }}>
            <Image alt="" src="/assets/DeleteIcon.svg" width={20} height={20} />
        </IconButton>
    )
}

export const EditIcon: FC<any> = (props) => {
    return (
        <IconButton {...props} style={{ backgroundColor: PRIMARYCOLOR, borderRadius: 4 }}>
            <Image alt="" src="/assets/Edit.svg" width={20} height={20} />
        </IconButton>
    )
}