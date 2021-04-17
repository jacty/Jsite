module.exports = {
    alias:{
        "@assets":"./src/assets/",
        "@com":"./src/components/",
        "@data":"./src/data/",
        "@Jeact":"./src/lib/Jeact"
    },
    plugins: ["@snowpack/plugin-sass","@snowpack/plugin-typescript"],
    mount:{
        src:'/',
    },
    buildOptions:{
        jsxFactory:'J',
    }
}