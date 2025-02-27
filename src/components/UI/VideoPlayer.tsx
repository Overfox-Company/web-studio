
import styled from '@emotion/styled'
import { FaPlay } from "react-icons/fa6";
import { motion } from 'framer-motion';
import { useState } from 'react';
import Slider from '@mui/material/Slider';
import LinearProgress from '@mui/material/LinearProgress';
interface Props extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src: string;
    thumbnail: string
}

const Video = styled.div({
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
});
const VideoPlayer: React.FC<Props> = ({ src, thumbnail, ...props }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Video
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ width: '100%', height: '100%', maxWidth: 1400 }}>

                <video src={src} poster={thumbnail}{...props} muted style={{ width: '100%' }} />
            </div>
            {/*

            <motion.div
                initial={{ y: -20 }}
                animate={{ y: isHovered ? -20 : 40 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{
                    bottom: 0,
                    zIndex: 8,
                    height: 40,
                    padding: 20,
                    width: '100%',
                    position: 'absolute',
                    backgroundColor: 'rgba(20,20,20,0.7)',
                }}
            >
                <Slider aria-label="Volume" size="small" />
                {//<LinearProgress variant="determinate" value={50} style={{ borderRadius: 50 }} />
                }
                <FaPlay style={{ fontSize: 20 }} />
            </motion.div>*/}
        </Video>
    );
}

export default VideoPlayer