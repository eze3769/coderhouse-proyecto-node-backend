
const postLogin = (req, res) => {
    console.log("holalogin")
    res.redirect('/')
}

const postRegister = (req, res) => {
    const user = req.user;
    res.redirect('/');
}


export { postLogin, postRegister };