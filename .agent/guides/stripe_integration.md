# Guide Stripe : Créer des Liens de Paiement

## 🎯 Fonctionnement

Vous pouvez maintenant **générer automatiquement un lien de paiement sécurisé Stripe** pour chaque paiement en attente.

### Étape 1 : Aller dans la page Paiements
- Naviguez vers `/dashboard/finances/paiements`

### Étape 2 : Créer un paiement
1. Cliquez sur **"+ Saisir un paiement"**
2. Sélectionnez le client
3. Entrez le montant et la date d'échéance
4. Cliquez sur **"Enregistrer"**
   → Le paiement est créé avec le statut `PENDING` (En attente)

### Étape 3 : Générer le lien Stripe
1. Cliquez sur la ligne du paiement pour ouvrir le drawer
2. Cliquez sur le bouton bleu **"💳 Générer un lien de paiement Stripe"**
3. Le lien est **automatiquement copié** dans votre presse-papier
4. Envoyez ce lien au client (email, WhatsApp, SMS...)

### Étape 4 : Le client paie
- Le client clique sur le lien
- Il arrive sur une page de paiement Stripe hébergée (sécurisée)
- Il entre ses informations de carte bancaire
- Stripe prend la commission (environ 1,5% + 0,25€)

### Étape 5 : Mise à jour automatique
Dès que le paiement est validé par Stripe :
- Le webhook de votre application reçoit la notification
- Le statut passe automatiquement de `PENDING` → `PAID` ✅
- La date de paiement est enregistrée
- Le chiffre d'affaires dans la page "Paiements" se met à jour instantanément

---

## 🧪 Test en Mode Test

Actuellement, vous utilisez les **clés de test** Stripe (`sk_test_...`).

### Pour tester un paiement :
1. Générez un lien de paiement
2. Ouvrez le lien dans votre navigateur
3. Utilisez une **carte de test Stripe** :
   - N° : `4242 4242 4242 4242`
   - Date d'expiration : N'importe quelle date future (ex: `12/34`)
   - CVC : N'importe quel 3 chiffres (ex: `123`)
   - Code postal : N'importe lequel

4. Validez le paiement → Vous serez redirigé vers la page Paiements avec un message de succès
5. **Le webhook devrait se déclencher automatiquement** et marquer le paiement comme PAID

---

## 🔧 Configuration du Webhook (Pour Production)

Actuellement, le webhook peut fonctionner en **mode local non-sécurisé** (pour dev uniquement).

### Pour activer la sécurité en production :
1. Allez dans [Stripe Dashboard > Développeurs > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Cliquez sur **"Ajouter un point de terminaison"**
3. URL : `https://votre-domaine.com/api/webhooks/stripe`
4. Événements à écouter :
   - `checkout.session.completed`
   - `checkout.session.expired` (optionnel)
   - `payment_intent.payment_failed` (optionnel)
5. Stripe génère un **Secret de signature** (`whsec_...`)
6. Copiez-le et ajoutez-le dans votre `.env` :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_VotreSecretGenere
   ```

---

## 📊 Avantages de cette intégration
✅ **Simplicité** : Plus besoin de gérer manuellement les paiements CB  
✅ **Traçabilité** : Tout est synchronisé automatiquement  
✅ **Sécurité** : Stripe gère la conformité PCI DSS (pas vous)  
✅ **Expérience Client** : Interface de paiement professionnelle et mobile-friendly  
✅ **Réconciliation Auto** : Votre chiffre d'affaires se met à jour en temps réel

---

Si vous avez des questions, n'hésitez pas !
