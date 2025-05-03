# Backend

De backend is een Express-app waarbij als ORM Prisma wordt gebruikt.

Om de app te starten, voer de volgende stappen uit:

1. **Installeer de dependencies:**
   ```bash
   npm install
   ```
2. **Update de database:**
   ```bash
   npx prisma migrate dev
   ```

3. **Start de ontwikkelserver:**
   ```bash
   npm run dev
   ```