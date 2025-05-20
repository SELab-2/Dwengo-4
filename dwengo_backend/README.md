# Backend testen

Om de testen te runnen, zorg eerst dat je de databank lokaal bent aan het runnen zoals uitgelegd in de README.md in de project root.
Dan kan je met `npm run test:int` alle testen in deze folder runnen.
Met `npm run test:int:ui` kan je ook gebruik maken van de gui van vitest. Het handigste hieraan is dat je gemakkelijk een bepaalde test in een test file kan aanduiden om te runnen.
Met `npm run coverage` zie je een overzicht van de code coverage bij het testen.
met `npm run test:unit`, `test:unit:ui` en `coverage:unit` kan je dit ook doen voor de unit testen 

PAS OP: bij het runnen van de integratie testen wordt steeds eerst alle data uit de databank verwijderd!
Zorg dus dat je dit enkel runt als er geen data in de databank zit die je wilt houden.

