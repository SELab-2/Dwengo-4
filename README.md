# Dwengo-4

## Informatie project

- Mock-up op [Figma](https://www.figma.com/design/A8yBKOe1BxgrV3vTWLLOms/Dwengo?node-id=0-1&t=Blc6awHrRmzETtLX-1)
- [UML](docs/uml.md) + [use-cases](docs/use_cases.md)
- [Groepsindeling](docs/groepsindeling.md)

## Instructies voor lokale databank/prisma running te krijgen

1. installeer docker engine (https://docs.docker.com/engine/install/)
2. Zorg dat je in de root van het project zit.
3. Run `sudo docker compose up -d`
4. Maak een .env file in de root van het project
5. in je .env file steek het volgende

```
POSTGRES_PASSWORD=passwor

DATABASE_URL="postgresql://selab2:passwor@localhost:2002/selab2?schema=public"
```

(note: deze link bepaald of je de remote of lokale databank gebruikt, De link voor de remote databank kan je vinden in pinned messages in discord)

6. Run `cp .env dwengo_backend`
7. Run `cd dwengo_backend`
8. Run `npx prisma migrate dev`
9. Run `npx prisma studio`. Dit zal je een link geven waar je prisma studio kunt raadplegen in je browser, Als je de tabellen ziet staan als volgt zit je goed :)

![alt text](image.png)
