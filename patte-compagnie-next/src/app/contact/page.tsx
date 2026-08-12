import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <section className="contact-section">
        <div className="container">
          <div className="paw-trail"><span id="paw1"></span><span id="paw2"></span><span id="paw3"></span><span>Contact</span></div>
          <h1>Une question ? Contactez-nous</h1>
          <p className="lead" style={{maxWidth: "50ch"}}>Notre équipe vous répond avec plaisir pour toute question sur nos produits, une commande ou un conseil pour votre compagnon.</p>

          <div className="contact-grid">
            <div className="panel contact-card">
              <h3>Email</h3>
              <p><a href="#" data-contact-email>contact@patte-compagnie.tn</a></p>
            </div>
            <div className="panel contact-card">
              <h3>Téléphone</h3>
              <p><a href="#" data-contact-telephone>+216 00 000 000</a></p>
            </div>
            <div className="panel contact-card">
              <h3>Adresse</h3>
              <p data-contact-adresse>Tunis, Tunisie</p>
            </div>
          </div>

          <section className="panel contact-form-panel">
            <h2>Envoyez-nous un message</h2>
            <p className="panel-sub">Remplissez le formulaire : votre application de messagerie s'ouvrira avec le message déjà prêt à envoyer.</p>

            <form id="contact-form">
              <div className="field">
                <label htmlFor="c-nom">Nom</label>
                <input type="text" id="c-nom" placeholder="Votre nom" required />
              </div>
              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input type="email" id="c-email" placeholder="vous@exemple.com" required />
              </div>
              <div className="field">
                <label htmlFor="c-téléphone">Téléphone</label>
                <input type="tel" id="c-téléphone" placeholder="Votre numéro de téléphone" required />
              </div>
              <div className="field">
                <label htmlFor="c-adresse">Adresse</label>
                <input type="text" id="c-adresse" placeholder="Votre adresse" required />
              </div>
              <div className="field">
                <label htmlFor="c-message">Message</label>
                <textarea id="c-message" placeholder="Votre question ou votre message…" required></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Envoyer le message</button>
              </div>
              <p className="feedback-msg" id="contact-feedback"></p>
            </form>
          </section>
        </div>
      </section>

      <footer className="site-footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h4>Patte &amp; Compagnie</h4>
              <p>Votre animalerie de quartier, en ligne. Produits sélectionnés pour le bien-être de vos compagnons à quatre pattes, à plumes ou à écailles.</p>
            </div>
            <div>
              <h4>Boutique</h4>
              <ul>
                <li><Link href="/catalogue">Catalogue</Link></li>
                <li><Link href="/categories">Catégories</Link></li>
                <li><Link href="/admin">Espace vendeur</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><Link href="/contact" data-contact-email>contact@patte-compagnie.tn</Link></li>
                <li data-contact-telephone>+216 00 000 000</li>
                <li data-contact-adresse>Tunis, Tunisie</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Patte &amp; Compagnie — Site de démonstration</span>
            <Link href="/admin">Accès vendeur →</Link>
          </div>
        </div>
      </footer>
    </>
  );
}