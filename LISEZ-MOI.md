# Patte & Compagnie — Guide rapide

## Les fichiers

- `index.html` — la page d'accueil (présentation, liens vers les autres pages).
- `catalogue.html` — la liste de tous les produits, avec recherche et filtres.
- `categories.html` — les univers animaliers (chiens, chats, oiseaux, rongeurs, poissons).
- `produit.html` — la fiche détaillée d'un produit (photo, description, ajout au panier).
- `panier.html` — le panier du client et la validation de commande.
- `contact.html` — les coordonnées de la boutique.
- `compte.html` — inscription/connexion client et historique de commandes personnel.
- `admin.html` — **l'espace vendeur**, où vous ajoutez/modifiez/supprimez des produits, sans écrire de code.
- `style.css`, `script.js`, `catalogue.js`, `categories.js`, `contact.js`, `panier.js`, `produit.js`, `compte.js`, `admin.js`, `data.js`, `icons.js` — le fonctionnement du site, à ne pas modifier sauf si vous êtes à l'aise avec ça.

## Comptes clients

Les visiteurs peuvent créer un compte (nom, email, mot de passe) depuis `compte.html` pour retrouver l'historique de leurs commandes. Ce n'est pas obligatoire : sans compte, la commande fonctionne quand même (elle apparaît comme « Invité » dans l'espace vendeur).

Une fois connecté, le client peut aussi ajouter des fiches pour ses animaux (nom, espèce, race, date de naissance, photo) dans la section « Mes animaux » de son compte — à la manière de l'espace client de Maxi Zoo.

⚠️ Comme tout le reste du site, ces comptes sont stockés dans le navigateur (`localStorage`), sans serveur ni vraie sécurité : les mots de passe ne sont pas chiffrés. Ne pas utiliser tel quel pour un vrai site public sans ajouter un backend.

## Comment ajouter un produit (pour le vendeur)

1. Ouvrez `admin.html` dans votre navigateur (double-cliquez dessus, ou allez sur `monsite.com/admin.html` une fois en ligne).
2. Entrez le code d'accès : **patte2026** (vous pouvez demander à le changer dans `admin.js`, ligne `ADMIN_CODE`).
3. Remplissez le formulaire à gauche : nom, prix, quantité en stock, **animal**, **sous-catégorie**, description, photo.
   - Le menu « Sous-catégorie » change automatiquement selon l'animal choisi.
4. Cliquez sur **Enregistrer le produit**. Il apparaît aussitôt dans le tableau à droite et sur la boutique publique.
5. Pour changer un prix rapidement : modifiez le chiffre directement dans la colonne « Prix » du tableau.
6. Pour modifier ou supprimer un produit : utilisez les deux icônes dans la colonne « Actions ».

## Les catégories et sous-catégories déjà prévues

| Animal | Sous-catégories |
|---|---|
| Chiens | Alimentation, Friandises, Hygiène & Santé, Accessoires, Couchages & Transport, Jouets |
| Chats | Alimentation, Litières, Friandises, Hygiène & Santé, Accessoires, Jouets |
| Oiseaux | Alimentation, Friandises, Hygiène & Santé, Cages & Accessoires |
| Rongeurs | Alimentation, Litières & Accessoires, Friandises, Hygiène & Santé |
| Poissons | Alimentation, Aquariophilie & Matériel, Entretien de l'eau |

Pour ajouter, renommer ou supprimer une sous-catégorie : ouvrez `data.js`, repérez le bloc `SUBCATEGORIES`, et modifiez la liste de l'animal concerné. Chaque ligne suit ce modèle :
```js
{ id: "identifiant-technique", label: "Texte affiché aux clients" }
```
L'`id` ne doit pas contenir d'espaces ni d'accents ; le `label` peut être écrit librement.

## ⚠️ Point important à comprendre : où sont stockées les données ?

Ce site garde les produits dans la mémoire de **votre navigateur** (ce qu'on appelle le `localStorage`).
Cela veut dire :

- Si vous ajoutez des produits sur l'ordinateur de la boutique, ils resteront là tant que vous ne videz pas l'historique du navigateur.
- **Si vous ouvrez `admin.html` sur un autre ordinateur ou un autre navigateur, vous ne verrez pas les mêmes produits.**
- Si le site est mis en ligne pour de vrais clients, chaque visiteur a sa propre mémoire de navigateur — il faut donc que le catalogue soit envoyé une fois pour toutes aux visiteurs.

### Solution simple : Exporter / Importer

Dans l'espace vendeur, deux boutons en bas du tableau :

- **Exporter le catalogue** → télécharge un fichier `catalogue-produits.json` (une sauvegarde de tous vos produits).
- **Importer un catalogue** → recharge un fichier `catalogue-produits.json` précédemment exporté.

Utilisez-les pour :
- faire une sauvegarde régulière de votre catalogue,
- transférer votre catalogue d'un ordinateur à un autre,
- ou fournir le fichier à la personne qui héberge le site pour qu'elle l'intègre au site en ligne.

### Pour un vrai site en ligne avec plusieurs vendeurs/appareils

Ce site est une base de démonstration fonctionnelle, idéale pour tester et pour un usage sur un seul poste.
Pour un usage professionnel avec plusieurs personnes qui gèrent le catalogue depuis des appareils différents,
il faudra à terme relier le site à une vraie base de données en ligne (par exemple via un service comme Firebase,
Supabase, ou un petit serveur). Dites-le-moi si vous voulez que je prépare cette version — je peux l'ajouter par-dessus
ce que vous avez déjà.

## Mettre le site en ligne

Ces fichiers fonctionnent sur n'importe quel hébergement web simple (y compris gratuit) :
- Glisser-déposer le dossier sur **Netlify Drop** (netlify.com/drop) — le plus simple, aucune configuration.
- GitHub Pages, Vercel, ou un hébergement mutualisé classique fonctionnent aussi.

## Personnaliser

- Couleurs, polices : en haut du fichier `style.css` (variables `--cream`, `--forest`, `--coral`…).
- Nom de la boutique, textes : directement dans `index.html`.
- Catégories de produits : liste `CATEGORIES` dans `data.js`.