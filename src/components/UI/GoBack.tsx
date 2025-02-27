import Image from "next/image";
import React, { FC, useContext } from "react";
import { Title } from "./Text";
import { Button, IconButton } from "@mui/material";
import { AppContext } from "@/context/AppContext";

const GoBack = ({ }) => {
    const { openSideBar, setOpenSidebar } = useContext(AppContext)
    return (
        <IconButton onClick={() => {
            console.log(!openSideBar)
            setOpenSidebar(!openSideBar)
        }
        }
            style={{
                backgroundColor: "white",
                height: 34,
                transition: 'transform 0.3s',
                transform: `rotate(${openSideBar ? 0 : -180}deg)`
            }}
        >
            <Image src={'/ArrowBlack.svg'} alt="" width={18} height={18} />
        </IconButton>
    )
}
export default GoBack;