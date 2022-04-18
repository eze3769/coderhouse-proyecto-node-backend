
const postLogin = (req, res) => {
    console.log("holalogin")
    const user = req.user;
    res.redirect('/')
}

const postRegister = (req, res) => {
    const user = req.user;
    console.log("hola");
    res.render('/');
}


export { postLogin, postRegister };