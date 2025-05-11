export const props = (url: string)=>{
    return {
        title: `404 - ${url}`,
        description: `Page not found - ${url}`,
        url,    
        navigation: {
            back: {
                href: `${process.env.VITE_BASE}`,
                text: "Back"
            }
        }
    }
}
export type Props = ReturnType<typeof props>    