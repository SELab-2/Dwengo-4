const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// Functie om een JWT-token te genereren
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Registreer een nieuwe leerkracht
// @route   POST /teacher/auth/register
// @access  Public
const registerTeacher = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Controleer of alle velden ingevuld zijn
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Vul alle velden in");
  }

  // Basisvalidatie voor e-mail
  if (!/\S+@\S+\.\S+/.test(email)) {
    res.status(400);
    throw new Error("Voer een geldig e-mailadres in");
  }

  // Controleer of het wachtwoord lang genoeg is
  if (password.length < 6) {
    res.status(400);
    throw new Error("Het wachtwoord moet minstens 6 karakters lang zijn");
  }

  // Controleer of er al een gebruiker bestaat met dit e-mailadres
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400);
    throw new Error("Gebruiker bestaat al");
  }

  // Hash het wachtwoord
  const hashedPassword = await bcrypt.hash(password, 10);

  // Maak eerst een User-record aan met role "TEACHER"
  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "TEACHER",
    },
  });

  // Maak vervolgens het gekoppelde Teacher-record
  await prisma.teacher.create({
    data: {
      userId: newUser.id,
    },
  });

  res.status(201).json({ message: "Leerkracht succesvol geregistreerd" });
});

// @desc    Inloggen van een leerkracht
// @route   POST /teacher/auth/login
// @access  Public
const loginTeacher = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Basisvalidatie voor e-mail
  if (!/\S+@\S+\.\S+/.test(email)) {
    res.status(400);
    throw new Error("Voer een geldig e-mailadres in");
  }

  // Zoek de gebruiker en controleer of deze een leerkracht is
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "TEACHER") {
    res.status(401);
    throw new Error("Ongeldig e-mailadres of wachtwoord");
  }

  // Haal het gekoppelde Teacher-record op
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: { user: true },
  });

  // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
  if (teacher && (await bcrypt.compare(password, teacher.user.password))) {
    res.json({
      message: "Succesvol ingelogd",
      token: generateToken(teacher.userId),
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
