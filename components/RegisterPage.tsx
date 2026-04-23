import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        organisation: '',
        role: '',
        taille: '',
        password: '',
        confirm: '',
        cgu: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
        if (errors[name]) {
            const newErrors = { ...errors };
            delete newErrors[name];
            setErrors(newErrors);
        }
    };

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.prenom.trim()) newErrors.prenom = "Prénom requis.";
            if (!formData.nom.trim()) newErrors.nom = "Nom requis.";
            if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email invalide.";
            if (!formData.telephone.trim()) newErrors.telephone = "Téléphone requis.";
        } else if (currentStep === 2) {
            if (!formData.organisation.trim()) newErrors.organisation = "Organisation requise.";
            if (!formData.role) newErrors.role = "Rôle requis.";
        } else if (currentStep === 3) {
            if (formData.password.length < 8) newErrors.password = "Minimum 8 caractères.";
            if (formData.password !== formData.confirm) newErrors.confirm = "Les mots de passe ne correspondent pas.";
            if (!formData.cgu) newErrors.cgu = "Vous devez accepter les CGU.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setLoading(true);
        try {
            await api.register({
                email: formData.email,
                password: formData.password,
                name: `${formData.prenom} ${formData.nom}`,
                role: formData.role,
                phone: formData.telephone,
                organization: formData.organisation
            });
            setIsSuccess(true);
        } catch (err: any) {
            setErrors({ server: err.message || "Erreur lors de l'inscription" });
        } finally {
            setLoading(false);
        }
    };

    const pwdStrength = useMemo(() => {
        const pwd = formData.password;
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return Math.min(4, Math.ceil(score * 4 / 5));
    }, [formData.password]);

    const strengthLabel = useMemo(() => {
        if (!formData.password) return 'Entrez un mot de passe';
        const labels = ['', 'Faible', 'Faible', 'Correct', 'Fort', 'Très fort'];
        return labels[pwdStrength] || 'Très fort';
    }, [formData.password, pwdStrength]);

    const strengthClass = useMemo(() => {
        if (pwdStrength <= 1) return 'weak';
        if (pwdStrength <= 2) return 'medium';
        return 'strong';
    }, [pwdStrength]);

    return (
        <div className="register-page">
            <div className="page-bg" aria-hidden="true"></div>
            <div className="vline" aria-hidden="true"></div>
            <div className="shape s1" aria-hidden="true"></div>
            <div className="shape s2" aria-hidden="true"></div>
            <div className="shape s3" aria-hidden="true"></div>
            <div className="shape s4" aria-hidden="true"></div>
            <div className="shape s5" aria-hidden="true"></div>

            <div className="auth-wrapper">
                <div className="auth-card" role="main">
                    {!isSuccess ? (
                        <>
                            {/* Logo */}
                            <div className="auth-brand">
                                <img src="/images/logo-process-iq.png" alt="ProcessIQ" className="auth-logo" />
                                <span className="auth-brand-name">ProcessIQ</span>
                            </div>

                            <div className="auth-divider" aria-hidden="true"></div>

                            <h1 className="auth-heading">Créer un compte</h1>
                            <p className="auth-sub">Rejoignez ProcessIQ en quelques étapes</p>

                            {/* Steps Indicator */}
                            <div className="steps" role="list" aria-label="Étapes d'inscription">
                                <div className={`step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`} role="listitem">
                                    <div className="step-num" aria-hidden="true">1</div>
                                    <span className="step-label">Identité</span>
                                </div>
                                <div className={`step-connector ${step > 1 ? 'done' : ''}`} aria-hidden="true"></div>
                                <div className={`step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`} role="listitem">
                                    <div className="step-num" aria-hidden="true">2</div>
                                    <span className="step-label">Organisation</span>
                                </div>
                                <div className={`step-connector ${step > 2 ? 'done' : ''}`} aria-hidden="true"></div>
                                <div className={`step ${step === 3 ? 'active' : ''}`} role="listitem">
                                    <div className="step-num" aria-hidden="true">3</div>
                                    <span className="step-label">Sécurité</span>
                                </div>
                            </div>

                            <form className="reg-form" onSubmit={handleSubmit} noValidate>
                                {/* Step 1: Identity */}
                                {step === 1 && (
                                    <div className="form-step active">
                                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.01em', marginBottom: '-0.2rem' }}>Vos informations personnelles</h2>
                                        <div className="form-row">
                                            <div className="field-group">
                                                <label className="field-label" htmlFor="prenom">Prénom <span className="req">*</span></label>
                                                <input
                                                    className={`field-input ${errors.prenom ? 'error' : ''}`}
                                                    type="text"
                                                    id="prenom"
                                                    name="prenom"
                                                    placeholder="Votre prénom"
                                                    value={formData.prenom}
                                                    onChange={handleChange}
                                                    autoComplete="given-name"
                                                    required
                                                />
                                                {errors.prenom && <span className="field-error visible">{errors.prenom}</span>}
                                            </div>
                                            <div className="field-group">
                                                <label className="field-label" htmlFor="nom">Nom <span className="req">*</span></label>
                                                <input
                                                    className={`field-input ${errors.nom ? 'error' : ''}`}
                                                    type="text"
                                                    id="nom"
                                                    name="nom"
                                                    placeholder="Votre nom"
                                                    value={formData.nom}
                                                    onChange={handleChange}
                                                    autoComplete="family-name"
                                                    required
                                                />
                                                {errors.nom && <span className="field-error visible">{errors.nom}</span>}
                                            </div>
                                        </div>

                                        <div className="field-group">
                                            <label className="field-label" htmlFor="email">Adresse email <span className="req">*</span></label>
                                            <input
                                                className={`field-input ${errors.email ? 'error' : ''}`}
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="votre.email@exemple.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                autoComplete="email"
                                                required
                                            />
                                            {errors.email && <span className="field-error visible">{errors.email}</span>}
                                        </div>

                                        <div className="field-group">
                                            <label className="field-label" htmlFor="telephone">Téléphone <span className="req">*</span></label>
                                            <input
                                                className={`field-input ${errors.telephone ? 'error' : ''}`}
                                                type="tel"
                                                id="telephone"
                                                name="telephone"
                                                placeholder="+33 6 12 34 56 78"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                                autoComplete="tel"
                                                required
                                            />
                                            {errors.telephone && <span className="field-error visible">{errors.telephone}</span>}
                                        </div>

                                        <div className="form-nav">
                                            <button type="button" className="btn-next" onClick={nextStep}>
                                                <span>Suivant</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Organisation */}
                                {step === 2 && (
                                    <div className="form-step active">
                                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.01em', marginBottom: '-0.2rem' }}>Votre établissement</h2>
                                        <div className="field-group">
                                            <label className="field-label" htmlFor="organisation">Organisation <span className="req">*</span></label>
                                            <input
                                                className={`field-input ${errors.organisation ? 'error' : ''}`}
                                                type="text"
                                                id="organisation"
                                                name="organisation"
                                                placeholder="Nom de votre établissement / entreprise"
                                                value={formData.organisation}
                                                onChange={handleChange}
                                                autoComplete="organization"
                                                required
                                            />
                                            {errors.organisation && <span className="field-error visible">{errors.organisation}</span>}
                                        </div>

                                        <div className="field-group">
                                            <label className="field-label" htmlFor="role">Votre rôle <span className="req">*</span></label>
                                            <select
                                                className={`field-select ${errors.role ? 'error' : ''}`}
                                                id="role"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="" disabled>Sélectionnez votre rôle</option>
                                                <option value="etudiant">Étudiant / Alternant</option>
                                                <option value="admission">Administration / CFA</option>
                                                <option value="commercial">Commercial / Entreprise</option>
                                                <option value="rh">Responsable RH</option>
                                                <option value="autre">Autre</option>
                                            </select>
                                            {errors.role && <span className="field-error visible">{errors.role}</span>}
                                        </div>

                                        <div className="field-group">
                                            <label className="field-label" htmlFor="taille">Taille de l'établissement</label>
                                            <select
                                                className="field-select"
                                                id="taille"
                                                name="taille"
                                                value={formData.taille}
                                                onChange={handleChange}
                                            >
                                                <option value="" disabled>Nombre d'alternants</option>
                                                <option value="moins50">Moins de 50</option>
                                                <option value="50-200">50 à 200</option>
                                                <option value="200-500">200 à 500</option>
                                                <option value="plus500">Plus de 500</option>
                                            </select>
                                        </div>

                                        <div className="form-nav">
                                            <button type="button" className="btn-prev" onClick={prevStep}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
                                                Retour
                                            </button>
                                            <button type="button" className="btn-next" onClick={nextStep}>
                                                <span>Suivant</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Security */}
                                {step === 3 && (
                                    <div className="form-step active">
                                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.01em', marginBottom: '-0.2rem' }}>Sécurisez votre compte</h2>

                                        {errors.server && (
                                            <div style={{ color: '#C94040', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{errors.server}</div>
                                        )}

                                        <div className="field-group">
                                            <label className="field-label" htmlFor="password">Mot de passe <span className="req">*</span></label>
                                            <div className="field-wrap">
                                                <input
                                                    className={`field-input ${errors.password ? 'error' : ''}`}
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    name="password"
                                                    placeholder="Minimum 8 caractères"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                <button
                                                    className="field-toggle"
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                                >
                                                    {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                                                </button>
                                            </div>
                                            <div className="pwd-strength" aria-live="polite">
                                                <div className="pwd-bars">
                                                    {[1, 2, 3, 4].map(b => (
                                                        <div key={b} className={`pwd-bar ${b <= pwdStrength ? strengthClass : ''}`}></div>
                                                    ))}
                                                </div>
                                                <span className="pwd-strength-label" style={{ color: strengthClass === 'weak' ? '#E05050' : strengthClass === 'medium' ? 'var(--gold-deep)' : '#4CAF74' }}>
                                                    {strengthLabel}
                                                </span>
                                            </div>
                                            {errors.password && <span className="field-error visible">{errors.password}</span>}
                                        </div>

                                        <div className="field-group">
                                            <label className="field-label" htmlFor="confirm">Confirmer le mot de passe <span className="req">*</span></label>
                                            <div className="field-wrap">
                                                <input
                                                    className={`field-input ${errors.confirm ? 'error' : ''}`}
                                                    type={showConfirm ? "text" : "password"}
                                                    id="confirm"
                                                    name="confirm"
                                                    placeholder="Répétez votre mot de passe"
                                                    value={formData.confirm}
                                                    onChange={handleChange}
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                <button
                                                    className="field-toggle"
                                                    type="button"
                                                    onClick={() => setShowConfirm(!showConfirm)}
                                                    aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                                >
                                                    {showConfirm ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                                                </button>
                                            </div>
                                            {errors.confirm && <span className="field-error visible">{errors.confirm}</span>}
                                        </div>

                                        <label className="checkbox-group" htmlFor="cgu">
                                            <input
                                                className="checkbox-input"
                                                type="checkbox"
                                                id="cgu"
                                                name="cgu"
                                                checked={formData.cgu}
                                                onChange={handleChange}
                                                required
                                            />
                                            <span className="checkbox-label">
                                                J'accepte les <a href="#">Conditions Générales d'Utilisation</a> et la <a href="#">Politique de confidentialité</a> de ProcessIQ.
                                            </span>
                                        </label>
                                        {errors.cgu && <span className="field-error visible">{errors.cgu}</span>}

                                        <div className="form-nav">
                                            <button type="button" className="btn-prev" onClick={prevStep}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
                                                Retour
                                            </button>
                                            <button type="submit" className="btn-submit-reg" disabled={loading}>
                                                <span>{loading ? "Création…" : "Créer mon compte"}</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="form-success" role="status" aria-live="polite">
                            <div className="success-icon">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h3 className="success-title">Compte créé !</h3>
                            <p className="success-text">
                                Votre espace ProcessIQ est prêt.<br />
                                Vérifiez votre boîte mail pour activer votre compte.
                            </p>
                            <Link to="/login" className="btn-go">
                                Se connecter
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                            </Link>
                        </div>
                    )}

                    <div className="auth-footer">
                        Déjà un compte&nbsp;? <Link to="/login">Se connecter</Link>
                    </div>
                </div>

                <Link to="/landing" className="back-link-reg">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
};

export default RegisterPage;
