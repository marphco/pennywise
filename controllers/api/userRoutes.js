const router = require('express').Router();
const { User, Budget, Goals } = require('../../models');

router.post('/', async (req, res) => {
    try {
        const userData = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;
            res.status(200).json({ user: userData, message: 'You are now signed up!' });
        });
    } catch (err) {
        if (err) {
            res.status(400).json({ message: 'Email already in use.' });
        } else {
            res.status(400).json(err);
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({ where: { email: req.body.email } });
        if (!userData) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }

        const validPassword = await userData.checkPassword(req.body.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;
            res.json({ user: userData, message: 'You are now logged in!' });
        });
    } catch (err) {
        res.status(400).json(err);
    }
});

router.post('/signup', async (req, res) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });

        req.session.save(() => {
            req.session.user_id = newUser.id;
            req.session.logged_in = true;
            res.json({ user: newUser, message: 'You are now signed up and logged in!' });
        });
    } catch (err) {
        if (err) {
            res.status(400).json({ message: 'Email already in use.' });
        } else {
            res.status(500).json(err);
        }
    }
});

router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

router.get('/', async(req, res) => {
    try {
        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Budget }, { model: Goals }]
        })
        res.json(userData)
    } catch (error) {
        res.status(500).json(error)        
    }
})

module.exports = router;
