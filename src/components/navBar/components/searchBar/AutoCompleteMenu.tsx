import AvatarName from '@/components/UI/AvatarName'
import { Item, Container, } from '@/components/UI/Container'
import { AppContext } from '@/context/AppContext'
import { Button, IconButton } from '@mui/material'
import { NextPage } from 'next'
import { FC, useContext, useEffect, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PRIMARYCOLOR } from '@/constant/Colors'
import { theme } from '@/constant/Theme'
import { useRouter } from 'next/navigation'
import formatToSlug from '@/utils/formatUrl'

interface Props { }

const AutoCompleteMenu: FC<{ search: string, setSearch: any, showMenu: boolean, setShowMenu: any }> = ({ search, setSearch, showMenu, setShowMenu }) => {
    const { models, tags } = useContext(AppContext)
    const [resultsModels, setResultsModels] = useState<any[]>([])
    const [resultsTags, setResultsTags] = useState<any[]>([])
    const router = useRouter()
    const Search = () => {

        if (search) {
            // Filtrar modelos por nombre
            const matchingModels = models.filter(model => model.name.toLowerCase().includes(search.toLowerCase()));

            // Filtrar etiquetas por nombre
            const matchingTags = tags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()));

            // Concatenar resultados de modelos y etiquetas
            // const combinedResults = [...matchingModels, ...matchingTags];
            setResultsModels(matchingModels);
            setResultsTags(matchingTags)
        }
        else {
            setResultsModels([]);
            setResultsTags([])
        }

    }
    const handleClick = (result: any) => {
        setSearch(result.name)
        setShowMenu(false)
        if (result.image) {
            router.push(`/model/${formatToSlug(result.name)}-${result._id}`)
        } else {
            router.push(`/tag/${formatToSlug(result.name)}-${result._id}`)
        }
    }
    useEffect(() => {
        Search()
    }, [search])
    return showMenu ? <div style={{
        zIndex: 999999,
        position: 'absolute',
        width: '100%',
        top: '150%',
        maxHeight: '60vh',
        overflow: 'auto',
        backgroundColor: 'rgba(55,55,55,1)',
        borderRadius: 4,
    }}><Container>
            <ThemeProvider theme={theme}>
                {resultsModels.length > 0 ? <Item xs={12}>
                    <div style={{ width: '100%', paddingLeft: '1vw', margin: '20px 0' }}>
                        <p style={{ fontSize: 20, fontWeight: 500, }}>Models</p>
                    </div>

                </Item>
                    : null}
                {resultsModels.length > 0 ? resultsModels.map((result, index) => {
                    return <Item xs={12} md={6} key={result._id}>
                        <Button style={{ width: '100%' }} onClick={() => handleClick(result)}>
                            <AvatarName name={result.name} image={result.image} />
                        </Button>
                    </Item>
                }) : null}

                {resultsTags.length > 0 ? <Item xs={12}>
                    <div style={{ width: '100%', paddingLeft: '1vw', margin: '20px 0' }}>
                        <p style={{ fontSize: 20, fontWeight: 500, }}>#Tags</p>
                    </div>

                </Item>
                    : null}
                {resultsTags.length > 0 ? resultsTags.map((result, index) => {
                    return <Item xs={12} md={6} key={result._id}>
                        <Button style={{ width: '100%' }} onClick={() => handleClick(result)}>
                            <AvatarName name={result.name} image={result.image} />
                        </Button>
                    </Item>
                }) : null}
            </ThemeProvider>

        </Container>

    </div> : null
}

export default AutoCompleteMenu