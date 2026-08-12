"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      type: "intro",
      title: "Tout pour le bonheur de votre compagnon",
      description: "Alimentation, jeux, accessoires et soins pour chiens, chats, oiseaux, rongeurs et poissons — sélectionnés avec attention par notre équipe.",
      buttons: [
        { text: "Découvrir le catalogue", href: "/catalogue", primary: true },
        { text: "Voir les catégories", href: "/categories", primary: false }
      ]
    },
    {
      type: "category",
      tag: "Univers Chien",
      title: "Croquettes, friandises & accessoires",
      description: "Tout ce qu'il faut pour votre fidèle compagnon, sélectionné avec soin.",
      image: "chien/4d09c818dfdb66872f91de47c23a1fa0.jpg",
      href: "/catalogue?cat=chien",
      shiftDown: true
    },
    {
      type: "category",
      tag: "Univers Chat",
      title: "Alimentation, litières & jouets",
      description: "Pensé pour le bien-être et le confort de votre chat au quotidien.",
      image: "chats/b63e8c3ca7c64b4581e692572a953ec5.jpg",
      href: "/catalogue?cat=chat",
      shiftDown: true
    },
    {
      type: "category",
      tag: "Univers Oiseau",
      title: "Cages, alimentation & accessoires",
      description: "Le confort de vos oiseaux, du canari au perroquet.",
      image: "oiseuax/oisaux.jpg",
      href: "/catalogue?cat=oiseau",
      shiftDown: true
    },
    {
      type: "category",
      tag: "Univers Rongeurs & Co.",
      title: "Cages, litières & friandises",
      description: "Pour hamsters, lapins, cochons d'Inde et compagnie.",
      image: "souris/souris-1024x1024.jpg",
      href: "/catalogue?cat=rongeur",
      shiftDown: false
    },
    {
      type: "category",
      tag: "Univers Aquariophilie",
      title: "Alimentation & matériel",
      description: "Pour un aquarium sain et des poissons en pleine forme.",
      image: "poisson/poisson-clown-a-trois-bandes.jpg",
      href: "/catalogue?cat=poisson",
      shiftDown: false
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <>
    <section className="hero-carousel" id="hero-carousel">
      <div className="hero-track" id="hero-track" style={{
        transform: `translateX(-${currentSlide * 100}%)`,
        transition: "transform 0.5s ease-in-out"
      }}>
        {/* Intro Slide */}
        <div className="hero-slide hero-slide-photo">
          <div className="paw-field"></div>
          <div className="container hero-slide-inner">
            <div>
              <div className="paw-trail">
                <span></span><span></span><span></span>
                <span>Boutique animalière</span>
              </div>
              <h1>Tout pour le bonheur de votre compagnon</h1>
              <p className="lead">Alimentation, jeux, accessoires et soins pour chiens, chats, oiseaux, rongeurs et poissons — sélectionnés avec attention par notre équipe.</p>
              <div className="hero-cta">
                <Link href="/catalogue" className="btn btn-primary">Découvrir le catalogue</Link>
                <Link href="/categories" className="btn btn-outline">Voir les catégories</Link>
              </div>
            </div>
            <div className="hero-art">
              <img src="famille-animaux.jpg" alt="Chien, chat, hamster et oiseau, nos compagnons" style={{maxWidth: "100%", height: "auto"}} />
            </div>
          </div>
        </div>

        {/* Category Slides */}
        {slides.slice(1).map((s, idx) => (
          <div key={idx} className="hero-slide hero-slide-photo-cat" style={{
            backgroundImage: `url('${(s as any).image}')`,
            backgroundPosition: (s as any).shiftDown ? "center 20%" : "center"
          }}>
            <div className="hero-slide-scrim"></div>
            <div className="container hero-slide-inner-photo">
              <div className="hero-slide-text">
                <span className="hero-slide-tag">{(s as any).tag}</span>
                <h2>{(s as any).title}</h2>
                <p className="lead">{(s as any).description}</p>
                <Link href={(s as any).href || "/"} className="btn btn-primary">Découvrir</Link>
              </div>
              <div className="hero-slide-promos"></div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="hero-nav hero-prev" id="hero-prev" onClick={prevSlide} aria-label="Image précédente">‹</button>
      <button type="button" className="hero-nav hero-next" id="hero-next" onClick={nextSlide} aria-label="Image suivante">›</button>

      <div className="hero-dots" id="hero-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`hero-dot ${idx === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Aller à la slide ${idx + 1}`}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "2px solid white",
              background: idx === currentSlide ? "white" : "transparent",
              cursor: "pointer",
              margin: "0 6px"
            }}
          ></button>
        ))}
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
