# Dwengo - groep 4

## Korte samenvatting *tech stack*
Onze backend maakt gebruik van [Express](https://expressjs.com/), waarbij [Prisma](https://www.prisma.io/) als ORM dient.
Onze frontend is een [React-app](https://react.dev/) die wordt gebouwd door middel van [Vite](https://vite.dev/). De routing wordt afgehandeld door [React Router](https://reactrouter.com/). [Tailwind CSS](https://tailwindcss.com/) wordt gebruikt voor de opmaak van onze pagina's.

## Instructies voor het opzetten van een ontwikkelomgeving

1. **Installeer Docker Engine**  
   Volg de instructies op de officiële Docker
   Engine-pagina: [Docker Engine Installatie](https://docs.docker.com/engine/install/).

2. **Start Docker Compose**  
   Start de benodigde containers met het volgende commando:
   ```bash
   sudo docker compose up -d
   ```

3. **Maak een `.env`-bestand**  
   Plaats de .env-bestanden in de root-, frontend- en backend-folders en gebruik [.env.template](.env.template) als
   basis.

   > **Opmerking:**  
   > De waarde van `DATABASE_URL` bepaalt of je de lokale of remote database gebruikt. De link voor de remote database
   is te vinden in de pinned messages op Discord.

4. Voer vervolgens volgende stappen uit in zowel de frontend-folder, alsook in de backend-folder. Naar deze folders gaan via
   de command line doe je als volgt:
   ```bash
   cd frontend
   ```
   of
   ```bash
   cd dwengo_backend
   ```
   
   **Commando's om in beide folders uit te voeren:**
      - **Installeer de dependencies:**
        ```bash
        npm install
        ```

   **Commando's die enkel in de backend-folder moeten uitgevoerd worden:**
      - Update de database indien een lokale databank wordt gebruikt.
         ```bash
         npx prisma migrate dev
         ```

   **Run vervolgens in beide folders nog volgend commando:**
      - Start de development server
         ```bash
         npm run dev
         ```

**Prisma Studio**  
Met Prisma Studio kun je de database bekijken en bewerken. Om Prisma Studio te starten, gebruik je het volgende
commando:

   ```bash
   npx prisma studio
   ```
