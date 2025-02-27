import React from 'react'
import { Container, Item } from './Container'
import styled, { keyframes } from 'styled-components';

const SideCard = styled.div({
    boxShadow: '10px 0 20px 0 rgba(180,180,188,0.1)',
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
})
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
const Skeleton = styled.div`
  width: 100%;
  height: 8vw;
  margin-top:0.2vw;
  background-color: rgb(220, 220, 220);
  border-radius: 8px;

  animation: ${fadeIn} 1.2s ease-in-out infinite alternate; // Aplica la animación
`;
const Loader = () => {
    return (
        <div style={{ backgroundColor: 'rgb(245,245,245)', position: 'fixed', height: '100vh', width: '100vw', zIndex: 9999 }}>
            <Container>
                <Item xs={2}>
                    <SideCard>
                        <Container justifyContent={"center"} alignItems='flex-start'>
                            <Item xs={11}>
                                <Skeleton />
                            </Item>
                            <Item xs={11}>
                                <br />
                                <Container justifyContent={"flex-start"}>
                                    <Item xs={10}>
                                        <Skeleton style={{ height: '2vw', marginTop: '0.8vw' }} />
                                    </Item>
                                    <Item xs={10}>
                                        <Skeleton style={{ height: '2vw', marginTop: '0.8vw' }} />
                                    </Item>
                                    <Item xs={10}>
                                        <Skeleton style={{ height: '2vw', marginTop: '0.8vw' }} />
                                    </Item>
                                    <Item xs={10}>
                                        <Skeleton style={{ height: '2vw', marginTop: '0.8vw' }} />
                                    </Item>
                                </Container>
                            </Item>
                        </Container>
                    </SideCard>
                </Item>
                <Item xs={10}>
                    <div style={{ padding: '2vw', height: '100vh' }}>
                        <Skeleton style={{ height: '100%' }} />
                    </div>
                </Item>
            </Container>
        </div>

    )
}
export default Loader