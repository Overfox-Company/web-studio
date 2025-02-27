import React, { FC } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Snackbars: FC<any> = ({ open, setOpen }) => {


    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen({ message: '', type: '' });
    };

    return (
        <Stack spacing={2} sx={{ width: '100%' }}>
            <Snackbar open={open.message ? true : false} autoHideDuration={5000} onClose={handleClose}>
                <Alert style={{ display: 'flex', alignItems: 'center' }} onClose={handleClose} severity={open.type} sx={{ width: '100%', fontSize: 18 }}>
                    {open.message}
                </Alert>
            </Snackbar>
        </Stack>
    );
}
export default Snackbars