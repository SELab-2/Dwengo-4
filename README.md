# Dwengo-4

## Instructies voor lokale databank/prisma running te krijgen

1. installeer docker engine (https://docs.docker.com/engine/install/)
2. Maak een .env file in de root van het project en in `dwengo_backend`
3. in je .env file steek het volgende `DATABASE_URL="postgresql://selab2:selab2@localhost:2002/selab2?schema=public"` (note: deze link bepaald of je de remote of lokale databank gebruikt, @sel2-4 is de remote dus pas de env file aan accordingly)
4. Run `cd dwengo_backend`
5. Run `prisma migrate dev`
6. Run `npx prisma studio`. Dit zal je een link geven waar je prisma studio kunt raadplegen in je browser, Als je de tabellen ziet staan als volgt zit je goed :)

![alt text](image.png)
