module.exports = {
    alias:{
        "@assets":"./src/assets/",
        "@com":"./src/components/",
        "@data":"./src/data/",
        "@lib":"./src/lib/"
    },
    plugins: ["@snowpack/plugin-sass"],
    mount:{
        src:'/',
    }
}