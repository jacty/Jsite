export const config = {
    alias:{
        "@assets":"./src/assets/",
        "@com":"./src/components/",
        "@data":"./src/data/",
        "@Jeact":"./src/lib/Jeact"
    },
    plugins: ["@snowpack/plugin-sass"],
    mount:{
        src:'/',
    },
    exclude:['**/src/lib/Dev/**','**/src/lib/Pup/**'],
    buildOptions:{
        jsxFactory:'J',
    }
}