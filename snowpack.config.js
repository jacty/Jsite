module.exports = {
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
    buildOptions:{
        jsxFactory:'J',
    }
}