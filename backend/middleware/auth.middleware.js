const isAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.status(401).json({ message: "Authentication required" });
    }
};

export { isAuthenticated };