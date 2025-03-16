import jwt from 'jsonwebtoken'

const isAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.status(401).json({ message: "Authentication required" });
    }
};

const authenticate = async (req, res, next) => {
    const token = req.cookies.token
    if(!token)
        return res.status(400).json({message: "Access Denied"})
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        req.user = decoded
        next()
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export { isAuthenticated, authenticate };