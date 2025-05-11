export const props = (url: string) => {
    return {
        url,
        title: "Home",
        description: "Home page",
        navigation: {
            toBidoof: {
                href: `${process.env.VITE_BASE}bidoof`,
                text: "Bidoof"
            },
            toErrorExample: {
                href: `${process.env.VITE_BASE}error-example`,
                text: "Error Example"
            }
        }
    }
}
export type Props = ReturnType<typeof props>