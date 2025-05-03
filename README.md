# Dwengo - groep 4

## Informatie project

- Mock-up op [Figma](https://www.figma.com/design/A8yBKOe1BxgrV3vTWLLOms/Dwengo?node-id=0-1&t=Blc6awHrRmzETtLX-1)
- [UML](docs/uml.md) + [use-cases](docs/use_cases.md)
- [Groepsindeling](docs/groepsindeling.md)

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

### Databank lokaal opzetten

6. **Navigeer naar de backend-map**  
   Ga naar de `dwengo_backend`-map:
   ```bash
   cd dwengo_backend
   ```

7. **Voer Prisma-migraties uit**  
   Migreer de database met het volgende commando:
   ```bash
   npx prisma migrate dev
   ```

**Prisma Studio**  
Met Prisma Studio kun je de database bekijken en bewerken. Om Prisma Studio te starten, gebruik je het volgende
commando:

   ```bash
   npx prisma studio
   ```
