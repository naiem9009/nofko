import JWT from "jsonwebtoken"

export const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) return res.json({"error": "No access token"})

    JWT.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) return res.status(403).json({"error": "Access token is invalid"})
        req.user = user.id

        next()
        
    })
}

