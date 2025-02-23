const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// JWT token genereren
const generateToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Registreer een nieuwe leerkracht
// @route   POST /teacher/auth/register
// @access  Public
const registerTeacher = asyncHandler(async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      res.status(400);
      throw new Error("Vul alle velden in");
   }

   if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400);
      throw new Error("Voer een geldig e-mailadres in");
   }

   if (password.length < 6) {
      res.status(400);
      throw new Error("Het wachtwoord moet minstens 6 karakters lang zijn");
   }

   const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
   if (existingTeacher) {
      res.status(400);
      throw new Error("Gebruiker bestaat al");
   }

   const hashedPassword = await bcrypt.hash(password, 10);

   await prisma.teacher.create({
      data: {
         email,
         password: hashedPassword,
      },
   });

   res.status(201).json({ message: "Leerkracht succesvol geregistreerd" });
});

// @desc    Inloggen van een leerkracht
// @route   POST /teacher/auth/login
// @access  Public
const loginTeacher = asyncHandler(async (req, res) => {
   const { email, password } = req.body;

   if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400);
      throw new Error("Voer een geldig e-mailadres in");
   }

   const teacher = await prisma.teacher.findUnique({ where: { email } });

   console.log(teacher)

   if (teacher && (await bcrypt.compare(password, teacher.password))) {
      res.json({
         message: "Succesvol ingelogd",
         token: generateToken(teacher.id),
      });
   } else {
      res.status(401);
      throw new Error("Ongeldig e-mailadres of wachtwoord");
   }
});

module.exports = {
   registerTeacher,
   loginTeacher,
};
