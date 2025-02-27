import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material'
import { NextPage } from 'next'
import Image from 'next/image';
import Link from 'next/link'

interface Props { image?: string, name: string, dashboard?: boolean, id?: string, size?: number, fontSize?: number }

const AvatarName: NextPage<Props> = ({ image, name, dashboard, id, size = 48, fontSize = 16 }) => {
    const content = (

        <ListItem style={{ width: '100%', padding: 2, gap: 16 }}>
            {image ? (
                <div style={{ overflow: 'hidden', borderRadius: 200, width: size, height: size, position: 'relative' }}>
                    <Image alt={name} title='name' layout='responsive' width={size} height={size} src={image} />
                </div>


            ) : null}
            <p style={{ color: 'white', fontSize: fontSize }}>
                {image ? name : `#${name}`}
            </p>
        </ListItem>

    );

    return <div style={{ width: "100%", }}>{content}</div>;

}

export default AvatarName