'use client'
import { AddVideo } from '@/types/ApiTypes'
import { NextPage } from 'next'
import { Container, Item } from './Container'
import SecuenceFade from '../animation/SecuenceFade'
import CardVideo from '../CardVideo'
import { Background } from '@/constant/Colors'

interface Props { ad?: boolean; videos: AddVideo[], lg?: boolean }

const VideosViewer: NextPage<Props> = ({ videos, ad, lg }) => {


    return <div style={{
        width: '100%',
        //justifyContent: !lg ? 'space-between' : 'space-between',
        display: 'flex', flexWrap: 'wrap', gap: !lg ? 4 : 12
    }}>

        {videos.length > 0 ? videos.map((video: any, index) => {
            return <div key={index}>
                <SecuenceFade index={index}>
                    <CardVideo data={video} ad={ad} lg={lg} />
                </SecuenceFade>
            </div>

        }) : null}

        {/* <Container columnSpacing={1} rowSpacing={1} >


            {videos.length > 0 ? videos.map((video: any, index) => {
                return <Item xs={12} sm={6} md={3} lg={v ? 4 : 3} key={video._id}>
                    <div>
                        <SecuenceFade index={index}>
                            <CardVideo data={video} ad={ad} />
                        </SecuenceFade>
                    </div>
                </Item>
            }) : null}


        </Container>*/}
    </div >
}

export default VideosViewer