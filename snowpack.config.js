module.exports = {
    alias:{
        "@assets":"./src/assets/",
        "@com":"./src/components/",
        "@data":"./src/data/",
        "@Jeact":"./src/lib/Jeact"
    },
    plugins: ["@snowpack/plugin-sass"],
    exclude:['**/src/lib/Dev/**', '**/src/lib/Pup/**'],
    mount:{
        src:'/',
    },
    buildOptions:{
        jsxFactory:'J',
    }
}