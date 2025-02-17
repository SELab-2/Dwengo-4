const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// JWT token genereren
const generateToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Registreer een nieuwe leerling
// @route   POST /student/auth/register
// @access  Public
const registerStudent = asyncHandler(async (req, res) => {
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

   const existingStudent = await prisma.student.findUnique({ where: { email } });
   if (existingStudent) {
      res.status(400);
      throw new Error("Gebruiker bestaat al");
   }

   const hashedPassword = await bcrypt.hash(password, 10);

   await prisma.student.create({
      data: {
         email,
         password: hashedPassword,
      },
   });

   res.status(201).json({ message: "Leerling succesvol geregistreerd" });
});

// @desc    Inloggen van een leerling
// @route   POST /student/auth/login
// @access  Public
const loginStudent = asyncHandler(async (req, res) => {
   const { email, password } = req.body;

   if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400);
      throw new Error("Voer een geldig e-mailadres in");
   }

   const student = await prisma.student.findUnique({ where: { email } });

   if (student && (await bcrypt.compare(password, student.password))) {
      res.json({
         message: "Succesvol ingelogd",
         token: generateToken(student.id),
      });
   } else {
      res.status(401);
      throw new Error("Ongeldig e-mailadres of wachtwoord");
   }
});

module.exports = {
   registerStudent,
   loginStudent,
};
