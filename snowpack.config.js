module.exports = {
    "alias":{
        "@style":"./src/assets/styles",
    },
    "plugins": ["@snowpack/plugin-sass"],
    "mount":{
        "./src":'/'
    }
}