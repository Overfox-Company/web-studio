import { NextPage } from 'next'
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Background, GRAY, PRIMARYCOLOR, PRIMARYCOLORTransparent } from '@/constant/Colors';
import { Dispatch, SetStateAction, useContext, useState } from 'react'
import styled from '@emotion/styled';
import { ButtonBlue, ButtonBlueOutlined } from '@/components/UI/Buttons';
import { AppContext } from '@/context/AppContext';
import ApiController from '@/controller/ApiController';
const Title = styled.h2({
    color: 'white',
    fontSize: 36
})
const Text = styled.p({
    color: 'white'
})
interface Props {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}


const Feedback: NextPage<Props> = ({ open, setOpen }) => {
    const { setSnackbarOpen } = useContext(AppContext);
    const [loadingButton, setLoadingButton] = useState(false)
    const [value, setValue] = useState('')
    const senFeedback = async () => {
        setLoadingButton(true)
        console.log(value)
        const result = await ApiController.addFeedback({ message: value })
        console.log(result)
        const { message, status } = result.data
        if (status === 200) {
            setOpen(false)
            setValue("")
        }

        setSnackbarOpen({ message, type: status === 200 ? 'success' : 'error' })

        setLoadingButton(false)
    }
    return (

        <div style={{}}>
            <Drawer
                style={{ overflow: 'hidden', height: '100vh', display: 'fixed', zIndex: 999999999 }}
                anchor={"right"}
                open={open}
                onClose={() => setOpen(false)}
            >
                <Box
                    sx={{

                        height: '100%',
                        padding: 4,
                        backgroundColor: Background,
                        width: { xs: '100vw', md: 450 }
                    }}
                >

                    <Title>
                        Tell us what we can improve
                    </Title>
                    <br />
                    <Text>
                        We want to offer you the best service, so we would like to know where we can improve, don &apos; t worry this form is totally anonymous just tell us what you think about our site.
                    </Text>
                    <br />
                    <textarea
                        style={{
                            width: '100%',
                            borderRadius: 8,
                            border: `solid 1px ${PRIMARYCOLOR}`,
                            outline: 'none',
                            padding: 12,
                            resize: 'none'
                        }}

                        onChange={(e) => setValue(e.target.value)}
                        value={value}
                        rows={18}
                        placeholder='What is your recomendation' />
                    <br />
                    <br />
                    <ButtonBlue
                        onClick={() => senFeedback()}
                        loading={loadingButton}

                    >
                        Send Feedback
                    </ButtonBlue>

                    <br />
                    <ButtonBlueOutlined onClick={() => setOpen(false)}>
                        cancel
                    </ButtonBlueOutlined>
                </Box>
            </Drawer>
        </div >

    )
}

export default Feedback