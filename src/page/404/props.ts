export const props = (url: string)=>{
    console.log(url)
    return {
        title: `404 - ${url}`,
        description: `Page not found - ${url}`,
        url,    
        navigation: {
            back: {
                href: `${import.meta.env.BASE_URL === "" ? "/" : import.meta.env.BASE_URL}`,
                text: "Back"
            }
        }
    }
}
export type Props = ReturnType<typeof props>    