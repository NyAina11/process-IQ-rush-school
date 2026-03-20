import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Monitor, Building2, BookOpen, Briefcase } from 'lucide-react';
import { getAuthToken } from '../services/session';
import './LandingPage.css';

const LandingPage: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [advCurrent, setAdvCurrent] = useState(0);
    const advTotal = 3;
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const token = getAuthToken() || localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        setIsLoggedIn(!!token);
        setUserRole(role);
    }, []);

    const getDashboardLink = () => {
        if (userRole === 'super_admin') return "/admission";
        if (userRole === 'commercial') return "/commercial/dashboard";
        if (userRole === 'admission') return "/admission";
        if (userRole === 'rh') return "/rh/dashboard";
        if (userRole === 'eleve') return "/etudiant/dashboard";
        return "/admission";
    };


    useEffect(() => {
        // Nav scroll effect
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        // Intersection Observer (scroll animations)
        const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => observer.observe(el));

        // Initial reveal for elements in viewport
        const timer = setTimeout(() => {
            revealEls.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.95) {
                    el.classList.add('visible');
                }
            });
        }, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            clearTimeout(timer);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Carousel logic
    useEffect(() => {
        const resetAdvAuto = () => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setAdvCurrent(prev => (prev + 1) % advTotal);
            }, 5500);
        };
        resetAdvAuto();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [advTotal]);

    const advGoTo = (index: number) => {
        setAdvCurrent((index + advTotal) % advTotal);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
    };

    return (
        <div className="landing-page">
            {/* 1. NAVIGATION */}
            <nav id="nav" className={scrolled ? 'scrolled' : ''} role="navigation" aria-label="Navigation principale">
                <div className="container">
                    <div className="nav-inner">
                        <Link to="/" className="nav-brand" aria-label="ProcessIQ — Accueil">
                            <div className="nav-crest">
                                <img src="/images/logo-process-iq.png" alt="ProcessIQ" />
                            </div>
                            <div className="nav-brand-text">
                                <strong>ProcessIQ</strong>
                                <span>Gestion de l'alternance</span>
                            </div>
                        </Link>

                        <div className="nav-links" role="list">
                            <a href="#solution" role="listitem">Solution</a>
                            <a href="#segments" role="listitem">Segments</a>
                            <a href="#advantages" role="listitem">Avantages</a>
                            <a href="#footer" role="listitem">Contact</a>
                        </div>

                        <div className="nav-right">
                            <div className="nav-lang">
                                <span className="active">FR</span>
                                <span className="nav-separator">/</span>
                                <span>EN</span>
                            </div>
                            <Link to="/login" className="nav-connexion">Connexion</Link>
                            <Link to="/contact" className="nav-cta">Demander une démo</Link>
                        </div>

                        <button
                            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
                            aria-label="Menu"
                            aria-expanded={mobileMenuOpen}
                            onClick={toggleMobileMenu}
                        >
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen} role="dialog">
                <a href="#solution" onClick={toggleMobileMenu}>Solution</a>
                <a href="#segments" onClick={toggleMobileMenu}>Segments</a>
                <a href="#advantages" onClick={toggleMobileMenu}>Avantages</a>
                <a href="#footer" onClick={toggleMobileMenu}>Contact</a>
                <div className="mobile-menu-actions">
                    <Link to="/login" className="btn btn-secondary" onClick={toggleMobileMenu}>Connexion</Link>
                    <Link to="/contact" className="btn btn-primary" onClick={toggleMobileMenu}>Demander une démo</Link>
                </div>
            </div>

            {/* JE SUIS bar */}
            <div className="je-suis-bar">
                <div className="container">
                    <div className="hero-roles">
                        <span className="hero-roles-label">JE SUIS</span>
                        <div className="hero-roles-pills">
                            <Link to="/login?role=etudiant" className="hero-role-pill">
                                <GraduationCap size={15} strokeWidth={1.6} />
                                Étudiant
                            </Link>
                            <Link to="/login?role=formateur" className="hero-role-pill">
                                <Monitor size={15} strokeWidth={1.6} />
                                Formateur
                            </Link>
                            <Link to="/login?role=entreprise" className="hero-role-pill">
                                <Building2 size={15} strokeWidth={1.6} />
                                Entreprise
                            </Link>
                            <Link to="/login?role=pedagogique" className="hero-role-pill">
                                <BookOpen size={15} strokeWidth={1.6} />
                                Service pédagogique
                            </Link>
                            <Link to="/login?role=commercial" className="hero-role-pill">
                                <Briefcase size={15} strokeWidth={1.6} />
                                Commercial
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. HERO */}
            <section id="hero" aria-label="ProcessIQ — Présentation">
                <div className="hero-bg" aria-hidden="true"></div>
                <div className="hero-line" aria-hidden="true"></div>
                <div className="hero-line-2" aria-hidden="true"></div>
                <div className="hero-shape-1" aria-hidden="true"></div>
                <div className="hero-shape-2" aria-hidden="true"></div>
                <div className="hero-shape-3" aria-hidden="true"></div>

                <div className="container">
                    <div className="hero-content">
                        <div className="hero-eyebrow reveal">
                            <span className="hero-eyebrow-line"></span>
                            <span className="label">Solution SaaS · Alternance & Stage · France</span>
                        </div>
                        <h1 className="hero-headline reveal delay-1">
                            La plateforme<br />
                            qui <em>libère</em><br />
                            l'alternance
                        </h1>
                        <p className="hero-sub reveal delay-2">
                            ProcessIQ centralise et automatise la gestion administrative, le suivi pédagogique et la communication entre tous les acteurs de l'alternance.
                        </p>
                        <div className="hero-actions reveal delay-3">
                            <a href="#solution" className="btn btn-primary">
                                Découvrir la solution <span className="btn-arrow">→</span>
                            </a>
                            <Link to="/contact" className="btn btn-secondary">
                                Demander une démo
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Rotating badge */}
                <div className="hero-badge reveal delay-4" aria-hidden="true">
                    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path id="circle-path" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" fill="none" />
                        <text fill="rgb(107,60,210)" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10.5" letterSpacing="3">
                            <textPath href="#circle-path">PROCESSIQ · ALTERNANCE · STAGE ·</textPath>
                        </text>
                    </svg>
                    <div className="hero-badge-center">
                        <strong>All-in-1</strong>
                        <span>Plateforme</span>
                    </div>
                </div>
            </section>

            {/* 3. STATS BAR */}
            <section id="stats" aria-label="Chiffres du marché">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item reveal">
                            <div className="stat-number">1M+</div>
                            <div className="stat-label">Contrats d'alternance par an</div>
                        </div>
                        <div className="stat-item reveal delay-1">
                            <div className="stat-number">15Md€</div>
                            <div className="stat-label">Budget formation professionnelle</div>
                        </div>
                        <div className="stat-item reveal delay-2">
                            <div className="stat-number">85%</div>
                            <div className="stat-label">Taux d'insertion professionnelle</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. PROBLEMS */}
            <section id="problems" className="section" aria-label="Problèmes de l'alternance">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label reveal">
                            <span className="label" style={{ color: 'var(--primary)' }}>État des lieux</span>
                        </div>
                        <h2 className="section-title reveal delay-1">Les Problèmes Majeurs<br />de l'Alternance Aujourd'hui</h2>
                        <p className="section-subtitle reveal delay-2">
                            Un secteur essentiel à l'économie française, freiné par des obstacles structurels que ProcessIQ a été conçu pour résoudre.
                        </p>
                    </div>

                    <div className="problems-grid">
                        <article className="problem-card reveal">
                            <span className="problem-number">60%</span>
                            <div className="problem-accent"></div>
                            <h3 className="problem-title">Charge Administrative Écrasante</h3>
                            <p className="problem-desc">
                                Du temps des CFA consacré à l'administratif au détriment de la pédagogie. Multiplication des tâches répétitives et à faible valeur ajoutée.
                            </p>
                        </article>
                        <article className="problem-card reveal delay-1">
                            <span className="problem-number">30%</span>
                            <div className="problem-accent"></div>
                            <h3 className="problem-title">Suivi Pédagogique Négligé</h3>
                            <p className="problem-desc">
                                D'abandon en alternance. Communication difficile entre tuteurs, formateurs et alternants. Manque de visibilité sur la progression réelle.
                            </p>
                        </article>
                        <article className="problem-card reveal delay-2">
                            <span className="problem-number" style={{ fontSize: '2.5rem', letterSpacing: '-0.04em' }}>Silos</span>
                            <div className="problem-accent"></div>
                            <h3 className="problem-title">Multiplicité des Outils</h3>
                            <p className="problem-desc">
                                Données dispersées dans de multiples systèmes incompatibles. Ressaisies fréquentes, erreurs et perte de temps. Coûts IT élevés et complexité de gestion.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            {/* 5. VISION */}
            <section id="vision" className="section" aria-label="Notre vision">
                <div className="container">
                    <div className="vision-grid">
                        <div>
                            <div className="vision-label reveal">
                                <span className="label" style={{ color: 'var(--primary)' }}>Notre vision</span>
                            </div>
                            <h2 className="vision-heading reveal delay-1">Devenir la Plateforme<br />Intégrée de <em>Référence</em></h2>
                            <p className="vision-text reveal delay-2">
                                Pour la gestion complète de l'alternance et du stage en France, en unifiant administratif, pédagogie et communication dans une expérience fluide et moderne, accessible à tous les profils d'utilisateurs.
                            </p>
                            <blockquote className="vision-quote reveal delay-3">
                                <p>"Là où la concurrence reste en silos, ProcessIQ propose la seule solution all-in-one du marché — un avantage décisif et durable."</p>
                            </blockquote>
                            <p className="vision-text reveal delay-4">
                                Notre approche intégrée garantit une adoption rapide, une conformité réglementaire totale et des bénéfices mesurables dès les premiers mois.
                            </p>
                        </div>
                        <div className="metrics-panel reveal-right">
                            <div className="metrics-main">
                                <div className="metric-cell">
                                    <div className="metric-value">60%</div>
                                    <div className="metric-label">Gain de temps<br />administratif</div>
                                </div>
                                <div className="metric-cell">
                                    <div className="metric-value">-30%</div>
                                    <div className="metric-label">Réduction du<br />taux d'abandon</div>
                                </div>
                                <div className="metric-cell">
                                    <div className="metric-value">100%</div>
                                    <div className="metric-label">Conformité<br />réglementaire</div>
                                </div>
                                <div className="metric-cell">
                                    <div className="metric-value" style={{ fontSize: '1.8rem' }}>All-in-1</div>
                                    <div className="metric-label">Plateforme<br />intégrée</div>
                                </div>
                            </div>
                            <div className="metrics-accent">
                                <span className="metrics-accent-text">Bénéfices</span>
                                <span className="metrics-accent-sub">Mesurables</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. SOLUTION */}
            <section id="solution" className="section" aria-label="La solution ProcessIQ">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label reveal">
                            <span className="label" style={{ color: 'var(--primary)' }}>La solution</span>
                        </div>
                        <h2 className="section-title reveal delay-1">ProcessIQ : La Solution Complète</h2>
                        <p className="section-subtitle reveal delay-2">
                            Une plateforme unique couvrant l'intégralité du cycle de gestion, de la signature du contrat au suivi quotidien de chaque alternant.
                        </p>
                    </div>
                    <div className="solution-grid">
                        <article className="solution-card reveal">
                            <div className="solution-card-icon" aria-hidden="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="rgb(107,60,210)" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <h3 className="solution-card-title">Automatisation Administrative</h3>
                            <p className="solution-card-desc">
                                Éliminez les tâches répétitives et concentrez-vous sur l'essentiel. ProcessIQ prend en charge l'intégralité de la chaîne administrative.
                            </p>
                            <ul className="solution-list" aria-label="Fonctionnalités administratives">
                                <li>Génération automatique des contrats CERFA et conventions</li>
                                <li>Signature électronique intégrée et workflow d'approbation</li>
                                <li>Gestion automatisée des présences et absences</li>
                                <li>Reporting réglementaire automatique pour financeurs</li>
                            </ul>
                        </article>
                        <article className="solution-card reveal delay-1">
                            <div className="solution-card-icon" aria-hidden="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="rgb(107,60,210)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="solution-card-title">Suivi Pédagogique Intelligent</h3>
                            <p className="solution-card-desc">
                                Gardez une visibilité complète sur la progression de chaque alternant et intervenez avant que les signaux d'alerte ne deviennent des abandons.
                            </p>
                            <ul className="solution-list" aria-label="Fonctionnalités pédagogiques">
                                <li>Dashboard personnalisé par rôle (alternant, tuteur, formateur)</li>
                                <li>Suivi en temps réel de la progression et des compétences</li>
                                <li>Alertes précoces sur les risques d'abandon</li>
                                <li>Communication intégrée entre tous les acteurs</li>
                            </ul>
                        </article>
                    </div>
                </div>
            </section>

            {/* 7. SEGMENTS */}
            <section id="segments" className="section" aria-label="Segments de la plateforme">
                <div className="container">
                    <div className="segments-header">
                        <div className="segments-title-wrap">
                            <div className="vision-label reveal">
                                <span className="label" style={{ color: 'var(--primary)' }}>Proposition de valeur</span>
                            </div>
                            <h2 className="display-lg reveal delay-1" style={{ color: 'var(--dark)' }}>
                                Une solution pour<br /><em style={{ fontStyle: 'normal', fontWeight: 800, color: 'var(--primary)' }}>chaque acteur</em>
                            </h2>
                        </div>
                        <a href="#cta" className="btn btn-secondary reveal delay-2">
                            Demander une démo <span className="btn-arrow">→</span>
                        </a>
                    </div>
                    <div className="masonry-grid reveal">
                        <div className="masonry-item">
                            <div className="masonry-overlay">
                                <div className="masonry-overlay-content">
                                    <span>Écoles &amp; CFA</span>
                                    <p>Gain de temps administratif de 60%, conformité réglementaire et reporting automatisé.</p>
                                </div>
                            </div>
                        </div>
                        <div className="masonry-item">
                            <div className="masonry-overlay">
                                <div className="masonry-overlay-content">
                                    <span>Entreprises</span>
                                    <p>Démarches simplifiées et communication fluide avec les centres de formation.</p>
                                </div>
                            </div>
                        </div>
                        <div className="masonry-item">
                            <div className="masonry-overlay">
                                <div className="masonry-overlay-content">
                                    <span>Financeurs &amp; OPCO</span>
                                    <p>Traçabilité complète des fonds et reporting de conformité automatisé.</p>
                                </div>
                            </div>
                        </div>
                        <div className="masonry-item"><div className="masonry-overlay"><span>Tuteurs</span></div></div>
                        <div className="masonry-item"><div className="masonry-overlay"><span>Formateurs</span></div></div>
                        <div className="masonry-item">
                            <div className="masonry-overlay">
                                <div className="masonry-overlay-content">
                                    <span>Étudiants</span>
                                    <p>Visibilité sur leur progression et prévention de l'abandon.</p>
                                </div>
                            </div>
                        </div>
                        <div className="masonry-item">
                            <div className="masonry-overlay">
                                <div className="masonry-overlay-content">
                                    <span>Direction &amp; Administration</span>
                                    <p>Pilotage centralisé et reporting consolidé.</p>
                                </div>
                            </div>
                        </div>
                        <div className="masonry-item">
                            <div className="masonry-overlay">
                                <div className="masonry-overlay-content">
                                    <span>RH &amp; Partenaires</span>
                                    <p>Reporting RH intégré et valorisation de l'expérience alternant.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. ADVANTAGES */}
            <section id="advantages" className="section" aria-label="Nos avantages concurrentiels">
                <div className="container">
                    <div className="advantages-header">
                        <div className="section-label reveal">
                            <span className="label" style={{ color: 'rgba(232,201,122,0.55)' }}>Différenciation</span>
                        </div>
                        <h2 className="section-title reveal delay-1" style={{ color: 'var(--beige)' }}>Notre <em>Avantage</em><br />Concurrentiel</h2>
                    </div>
                    <div className="adv-carousel-container" aria-live="polite">
                        <div className="adv-carousel-track" style={{ transform: `translateX(-${advCurrent * 100}%)` }}>
                            <div className="adv-slide" role="group" aria-label="Avantage 1 sur 3">
                                <div className="adv-inner">
                                    <span className="adv-number" aria-hidden="true">01</span>
                                    <h3 className="adv-title">Approche Intégrée Unique</h3>
                                    <p className="adv-text">"Là où la concurrence reste en silos — Filiiz pour l'administratif, Halphonse pour le pédagogique — ProcessIQ propose la seule solution all-in-one du marché."</p>
                                    <span className="adv-badge">All-in-One · Marché unique</span>
                                </div>
                            </div>
                            <div className="adv-slide" role="group" aria-label="Avantage 2 sur 3">
                                <div className="adv-inner">
                                    <span className="adv-number" aria-hidden="true">02</span>
                                    <h3 className="adv-title">Expérience Utilisateur Optimale</h3>
                                    <p className="adv-text">"Interface intuitive pensée pour des utilisateurs non experts du numérique, garantissant une adoption rapide et massive dès le premier jour de déploiement."</p>
                                    <span className="adv-badge">UX · Adoption · Non-experts</span>
                                </div>
                            </div>
                            <div className="adv-slide" role="group" aria-label="Avantage 3 sur 3">
                                <div className="adv-inner">
                                    <span className="adv-number" aria-hidden="true">03</span>
                                    <h3 className="adv-title">Conformité &amp; Sécurité</h3>
                                    <p className="adv-text">"RGPD natif, hébergement France/UE, sécurisation des données sensibles et certification ISO 27001 en cours. Votre conformité est notre responsabilité."</p>
                                    <span className="adv-badge">RGPD · ISO 27001 · France/UE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="adv-controls" aria-label="Navigation des avantages">
                        <button className="adv-btn" aria-label="Avantage précédent" onClick={() => advGoTo(advCurrent - 1)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <div className="adv-dots" role="tablist">
                            {[0, 1, 2].map(i => (
                                <button key={i} className={`adv-dot ${advCurrent === i ? 'active' : ''}`} role="tab" aria-selected={advCurrent === i} aria-label={`Avantage ${i + 1}`} onClick={() => advGoTo(i)}></button>
                            ))}
                        </div>
                        <button className="adv-btn" aria-label="Avantage suivant" onClick={() => advGoTo(advCurrent + 1)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* 9. BUSINESS MODEL */}
            <section id="bizmodel" className="section" aria-label="Modèle économique">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label reveal">
                            <span className="label" style={{ color: 'var(--primary)' }}>Modèle</span>
                        </div>
                        <h2 className="section-title reveal delay-1">Modèle Économique<br />&amp; Go-to-Market</h2>
                        <p className="section-subtitle reveal delay-2">Un modèle SaaS récurrent conçu pour la croissance, avec une stratégie de lancement terrain construite autour de partenariats fondateurs.</p>
                    </div>
                    <div className="biz-grid">
                        <article className="biz-card reveal">
                            <span className="biz-card-num">01</span>
                            <h3 className="biz-card-title">Modèle SaaS Récurrent</h3>
                            <ul className="biz-list" aria-label="Éléments du modèle SaaS">
                                <li>Licence par établissement ou entreprise</li>
                                <li>Tarification modulaire avec les premiers établisseurs</li>
                                <li>Upsell : connecteurs premium, analytics avancées</li>
                                <li>Support optionnel et formation inclus</li>
                            </ul>
                        </article>
                        <article className="biz-card reveal delay-1">
                            <span className="biz-card-num">02</span>
                            <h3 className="biz-card-title">Stratégie de Lancement</h3>
                            <ul className="biz-list" aria-label="Éléments de la stratégie">
                                <li>Pilotes gratuits avec 3 à 5 partenaires fondateurs</li>
                                <li>Témoignages et cas d'usage concrets documentés</li>
                                <li>Partenariats avec réseaux d'écoles et CFA</li>
                                <li>Communication ciblée et présence événementielle</li>
                            </ul>
                        </article>
                    </div>
                </div>
            </section>

            {/* 10. CTA */}
            <section id="cta" aria-label="Appel à l'action">
                <div className="container">
                    <div className="cta-eyebrow reveal">
                        <span className="label">Rejoignez-nous</span>
                    </div>
                    <h2 className="cta-title reveal delay-1">Prêt à Révolutionner la Gestion<br />de l'<em>Alternance</em> ?</h2>
                    <p className="cta-sub reveal delay-2">Rejoignez les établissements qui font confiance à ProcessIQ pour simplifier et optimiser leur gestion de l'alternance et du stage.</p>
                    <div className="cta-actions reveal delay-3">
                        <Link to="/contact" className="btn btn-gold">Demander une démo <span className="btn-arrow">→</span></Link>
                        <Link to="/login" className="btn btn-outline-beige">Connexion</Link>
                    </div>
                </div>
            </section>

            {/* 11. FOOTER */}
            <footer id="footer" role="contentinfo">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="nav-brand" style={{ marginBottom: '0.5rem' }}>
                                <div className="nav-crest"><img src="/images/logo-process-iq.png" alt="ProcessIQ" /></div>
                                <div className="nav-brand-text"><strong>ProcessIQ</strong><span>Gestion de l'alternance</span></div>
                            </div>
                            <p className="footer-tagline">"La plateforme intégrée qui libère l'alternance et le stage de la paperasse et des silos."</p>
                            <div className="footer-social" aria-label="Réseaux sociaux">
                                <a href="#" className="footer-social-btn" aria-label="LinkedIn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                                <a href="#" className="footer-social-btn" aria-label="X (Twitter)">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="footer-col-title">La Plateforme</h3>
                            <ul className="footer-links">
                                <li><a href="#solution">Automatisation administrative</a></li>
                                <li><a href="#solution">Suivi pédagogique</a></li>
                                <li><a href="#segments">Segments</a></li>
                                <li><a href="#advantages">Avantages</a></li>
                                <li><a href="#bizmodel">Modèle &amp; tarifs</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="footer-col-title">Légal</h3>
                            <ul className="footer-links">
                                <li><a href="#">Mentions légales</a></li>
                                <li><a href="#">Politique de confidentialité</a></li>
                                <li><a href="#">RGPD &amp; données</a></li>
                                <li><a href="#">Conditions générales</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="footer-col-title">Contact</h3>
                            <div className="footer-contact-item">
                                <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span>contact@processiq.fr</span>
                            </div>
                            <div className="footer-contact-item">
                                <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span>+33 (0)1 00 00 00 00</span>
                            </div>
                            <a href="#cta" className="btn btn-primary" style={{ marginTop: '1.2rem', fontSize: '0.75rem', padding: '0.75rem 1.4rem' }}>Demander une démo →</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p className="footer-copy">© 2025 ProcessIQ. Tous droits réservés.</p>
                        <div className="footer-bottom-links">
                            <a href="#">Mentions légales</a><a href="#">Politique de confidentialité</a><a href="#">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

