const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const protectTeacher = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Zoek de gebruiker (Teacher) en stel deze in op req.user
            const teacher = await prisma.teacher.findUnique({
                where: { userId: decoded.id },
            });

            if (!teacher) {
                res.status(401);
                throw new Error("Leerkracht niet gevonden.");
            }

            req.user = teacher;
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error("Niet geautoriseerd, token mislukt.");
        }
    } else {
        res.status(401);
        throw new Error("Geen token, niet geautoriseerd.");
    }
});

module.exports = { protectTeacher };
