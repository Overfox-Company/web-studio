import * as React from 'react';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import { Container, Item } from './Container';
import { DialogContent, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { PAPER, PRIMARYCOLORTransparent } from '@/constant/Colors';
import { ButtonBlue } from './Buttons';
const emails = ['username@gmail.com', 'user02@gmail.com'];

export interface SimpleDialogProps {
    open: boolean;
    selectedValue: string;
    onClose: () => void;
    data: any[]
    setSelectedValue: any
}

function SimpleDialog(props: SimpleDialogProps) {
    const { onClose, selectedValue, setSelectedValue, open, data } = props;
    const [search, setSearch] = useState<string | undefined>(undefined)
    const [filteredData, setFilteredData] = useState<any[]>(data)
    const handleClose = () => {
        onClose();
    };

    const handleListItemClick = (value: string) => {
        setSelectedValue((prev: any) => {
            // Verificar si el valor ya está en la lista
            const index = prev.indexOf(value);
            if (index !== -1) {
                // Si el valor existe, eliminarlo de la lista usando slice
                return [...prev.slice(0, index), ...prev.slice(index + 1)];
            } else {
                // Si el valor no existe, agregarlo al final de la lista
                return [...prev, value];
            }
        });
    };
    useEffect(() => {

        if (search) { // Asegura que el término de búsqueda no esté vacío después de eliminar los espacios en blanco
            const filter = data.filter(e => e.name.toLowerCase().includes(search.trim().toLowerCase()));
            setFilteredData(filter);
        } else {
            setFilteredData(data);
        }
    }, [search, data])
    return (
        <Dialog onClose={handleClose} open={open} maxWidth={'xl'}>
            <DialogTitle style={{ backgroundColor: PAPER, color: 'white' }}>Select Models</DialogTitle>
            <DialogContent style={{ backgroundColor: PAPER, paddingRight: 0 }}>
                <br />
                <TextField
                    sx={{
                        color: 'white', // Color del texto y placeholder
                        '& .MuiOutlinedInput-root': { // Selecciona el contenedor del TextField
                            '& fieldset': { // Estilos para el borde del TextField
                                borderColor: 'white', // Color del borde
                            },
                            '&:hover fieldset': { // Estilos para el borde del TextField al pasar el ratón por encima
                                borderColor: 'white', // Color del borde al pasar el ratón por encima
                            },
                            '&.Mui-focused fieldset': { // Estilos para el borde del TextField cuando está enfocado
                                borderColor: 'white', // Color del borde cuando está enfocado
                            },
                            '& input': { // Estilos para el texto dentro del TextField
                                color: 'white', // Color del texto dentro del TextField
                            },
                            '& input::placeholder': { // Estilos para el placeholder dentro del TextField
                                color: 'rgba(255, 255, 255, 0.5)', // Color del placeholder
                            },
                        },
                    }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    variant="outlined"
                    placeholder='Search by name' />
                <br /><br />
                <List sx={{ height: '50vh', overflow: 'auto', width: '60vw', paddingRight: '1vw' }}>
                    <Container columnSpacing={1}>
                        {filteredData.map((item) => (
                            <Item xs={4} md={4} lg={4} xl={3} key={item._id}>
                                <ListItem disableGutters >
                                    <ListItemButton style={{
                                        borderRadius: 4,
                                        backgroundColor: selectedValue.includes(item._id) ? PRIMARYCOLORTransparent : 'rgba(255,255,255,0.1)'
                                    }} onClick={() => handleListItemClick(item._id)}>
                                        {item.image ? <ListItemAvatar>
                                            <Avatar sx={{ width: 45, height: 45, bgcolor: blue[100], color: blue[600] }} src={item.image} />
                                        </ListItemAvatar> : null}
                                        <ListItemText primary={item.name} style={{ color: 'white' }} />
                                    </ListItemButton>
                                </ListItem>
                            </Item>
                        ))}

                    </Container>

                </List>
                <br />
                <Container justifyContent={"flex-end"} style={{ paddingRight: '2vw' }}>
                    <Item xs={2}>
                        <ButtonBlue onClick={() => onClose()}>
                            Aceptar
                        </ButtonBlue>
                    </Item>
                </Container>

            </DialogContent>


        </Dialog>
    );
}
interface SimpleDialogDemoProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    data: any[],
    selectedValue: any,
    setSelectedValue: React.Dispatch<React.SetStateAction<string>>
}

const SelectDialog: React.FC<SimpleDialogDemoProps> =
    ({ open, setOpen, data, selectedValue, setSelectedValue }) => {

        const handleClose = () => {
            setOpen(false);

        };

        return (
            <div>
                <SimpleDialog
                    setSelectedValue={setSelectedValue}
                    data={data}
                    selectedValue={selectedValue}
                    open={open}
                    onClose={handleClose}
                />
            </div>
        );
    }
export default SelectDialog