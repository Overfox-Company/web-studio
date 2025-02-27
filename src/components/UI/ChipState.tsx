import { NextPage } from 'next'
import styled from '@emotion/styled'
import { Chip } from '@mui/material'
interface Props { label: string, type: 'error' | "pending" | 'success' }
const ChipCustom = styled(Chip)(({ type }: Props) => ({
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    width: 110,
    fontFamily: 'Inter',
    backgroundColor: type === 'error' ? 'rgba(249, 204, 204, 1)' : type === 'pending' ? 'rgba(255, 249, 233, 1)' : 'rgba(234, 255, 242, 1)',
    color: type === 'error' ? 'rgba(164, 19, 36, 1)' : type === 'pending' ? 'rgba(216, 163, 0, 1)' : 'rgba(2, 161, 68, 1)', // Cambia el color del texto según el fondo
}));

const ChipState: NextPage<Props> = ({ type = 'error', label }) => {
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    return <div>
        <ChipCustom label={capitalizedLabel} type={type} />
    </div>
}

export default ChipState