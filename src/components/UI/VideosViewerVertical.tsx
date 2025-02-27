import { NextPage } from 'next'
import { AddVideo } from '@/types/ApiTypes'
import { Container, Item } from './Container'
import SecuenceFade from '../animation/SecuenceFade'
import CardVideo from '../CardVideo'
import { Background } from '@/constant/Colors'
import CardVideoVertical from '../CardVideovertical'

interface Props { ad?: boolean; videos: AddVideo[], v?: boolean }
interface Props { }

const VideosViewerVertical: NextPage<Props> = ({ videos, ad, v }) => {
    return <div style={{ width: '100%', }}>
        <Container>
            {videos.length > 0 ? videos.map((video: any, index) => {
                return <Item xs={12} key={video._id}>
                    <div>
                        <SecuenceFade index={index}>
                            <CardVideoVertical data={video} ad={ad} />
                        </SecuenceFade>
                    </div>
                </Item>
            }) : null}


        </Container>
    </div>
}

export default VideosViewerVertical