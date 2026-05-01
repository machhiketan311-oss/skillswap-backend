const User = require("../models/User");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        res.send("User Registered Successfully");

    } catch (err) {
        res.status(500).send(err);
    }
};