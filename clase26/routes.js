const getRoot = (req, res) => {
    res.send('Welcome');
}

const getLogin = (req, res) => {
    if (req.authenticated()) {
        let user = req.user;
        console.log('user logged');
        
        res.render('profileUser', {user});
    } else {
        console.log('user not logged');
        res.render('/login');
    }
}

const getSignup = (req, res) => {
    res.send('Welcome');
}

const postLogin = (req, res) => {
    const user = req.user;
    res.render('/')
}

const postRegister = (req, res) => {
    const user = req.user;

    res.render('/');
}
