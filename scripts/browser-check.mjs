import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const origin = process.env.TEST_BASE_URL || "http://127.0.0.1:3101";
await mkdir("work/screenshots", { recursive: true });
for (const path of [
  "/",
  "/trades",
  "/analytics",
  "/journal",
  "/protocol",
  "/risk",
  "/progress",
  "/watchlist",
  "/settings",
  "/sources",
]) {
  await page.goto(origin + path, { waitUntil: "networkidle" });
  assert.ok(await page.locator("h1").count());
  assert.equal(
    await page.getByText("Données indisponibles.", { exact: false }).count(),
    0,
    `data error ${path}`,
  );
  if (path === "/")
    await page.screenshot({
      path: "work/screenshots/dashboard-desktop.png",
      fullPage: true,
    });
}
await page.goto(origin + "/journal", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Nouvelle fiche" }).click();
await page.getByLabel("Titre", { exact: true }).fill("Analyse navigateur BTC");
await page
  .getByLabel("Observation et raisonnement", { exact: true })
  .fill("Observation de test sans prise de position.");
await page.getByRole("button", { name: "Enregistrer une version" }).click();
await page.getByRole("button", { name: /Analyse navigateur BTC/ }).waitFor();
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: /Analyse navigateur BTC/ }).click();
assert.ok(
  await page
    .getByText("Observation de test sans prise de position.", { exact: true })
    .isVisible(),
);
await page.goto(origin + "/trades", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Nouvelle position" }).click();
await page.getByLabel("Actif", { exact: true }).fill("ETH");
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Nouvelle position" }).click();
assert.equal(
  await page.getByLabel("Actif", { exact: true }).inputValue(),
  "ETH",
);
// These contracts/accounts are created by multiasset-check on the isolated suite database.
for (const [symbol, price, quantity, direction] of [["BTC",60000,.01,"LONG"],["ETH",3000,1,"SHORT"],["SOL",100,1,"LONG"],["XAUUSD",2300,.1,"LONG"],["EURUSD",1.1,.1,"LONG"],["CUSTOMIDX",100,1,"LONG"]]) {
  await page.goto(origin + "/trades", {waitUntil:"networkidle"});
  await page.getByRole("button", {name:"Nouvelle position",exact:true}).click();
  await page.getByLabel("Compte de la position",{exact:true}).selectOption({label:"Compte fixtures multi-actifs · USD"});
  await page.getByLabel("Contrat enregistré",{exact:true}).selectOption({label:`${symbol} · ${symbol === "BTC" ? "Hyperliquid" : "Courtier de test"} · v1`});
  await page.getByLabel("Direction",{exact:true}).selectOption(direction);
  await page.getByLabel("Prix exécuté",{exact:true}).fill(String(price));
  await page.getByLabel("Quantité exécutée (contrats / lots)",{exact:true}).fill(String(quantity));
  await page.getByLabel("Stop initial (inconnu si vide)",{exact:true}).fill("");
  await page.getByLabel("Frais d’entrée (USD, vide = inconnus)",{exact:true}).fill("0");
  await page.getByLabel("Écart aux règles personnelles / trade hors stratégie",{exact:true}).fill("Test E2E : aucun stop initial, décision hors stratégie documentée.");
  await page.getByRole("button",{name:"Enregistrer l’entrée",exact:true}).click();
  await page.getByText("Position enregistrée. Complète les frais réellement payés dans le suivi.",{exact:true}).waitFor();
  await page.getByLabel("Événement",{exact:true}).selectOption("EXIT");
  await page.getByLabel("Prix",{exact:true}).fill(String(price + (direction === "SHORT" ? -1 : 1)));
  await page.getByLabel("Quantité",{exact:true}).fill(String(quantity));
  await page.getByLabel("Frais réels en USD (vide = inconnus)",{exact:true}).fill("0");
  await page.getByRole("button",{name:"Enregistrer l’événement",exact:true}).click();
  await page.getByText("Événement enregistré. Le résultat a été recalculé.",{exact:true}).waitFor();
  assert.ok(await page.getByRole("heading",{name:"03 / Après clôture",exact:true}).isVisible());
}
await page.goto(origin + "/sources?asset=EURUSD",{waitUntil:"networkidle"});
await page.getByRole("button",{name:/Euro FX Futures Contract Specs/}).click();
assert.ok(await page.getByText(/ne pas transposer ses spécifications au spot Forex/).isVisible());
await page.getByRole("button",{name:"Ajouter une recherche",exact:true}).click();
await page.getByLabel("Titre original exact",{exact:true}).fill("Recherche E2E personnelle");
await page.getByLabel("Lien original",{exact:true}).fill("https://www.ecb.europa.eu/");
await page.getByRole("button",{name:"Conserver la fiche",exact:true}).click();
await page.getByText("Recherche conservée dans une nouvelle version.",{exact:true}).waitFor();
await page.setViewportSize({ width: 390, height: 844 });
for (const path of ["/", "/trades", "/analytics", "/journal", "/risk"]) {
  await page.goto(origin + path, { waitUntil: "networkidle" });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
    `horizontal overflow ${path}`,
  );
  if (path === "/")
    await page.screenshot({
      path: "work/screenshots/dashboard-mobile.png",
      fullPage: true,
    });
}
assert.deepEqual(errors, []);
console.log(
  "PASS: 10 routes, no client exceptions, note persistence, draft persistence, five mobile layouts; six contract entry/close flows and personal research",
);
await browser.close();
