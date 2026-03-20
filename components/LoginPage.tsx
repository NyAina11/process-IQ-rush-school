import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { decodeJwtPayload, setAuthToken } from '../services/session';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');

    const roleIcons: Record<string, React.ReactElement> = {
        etudiant: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3.333 1.667 8.667 1.667 12 0v-5"/>
            </svg>
        ),
        formateur: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
        ),
        entreprise: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M9 21V7l6-4v18M9 21H3V10l6-3M15 21h6V10l-6-3"/>
            </svg>
        ),
        pedagogique: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
        ),
        commercial: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
        ),
    };

    const roleConfig: Record<string, { label: string; color: string }> = {
        etudiant:    { label: 'Étudiant',            color: '#6B3CD2' },
        formateur:   { label: 'Formateur',           color: '#059669' },
        entreprise:  { label: 'Entreprise',          color: '#0284C7' },
        pedagogique: { label: 'Service pédagogique', color: '#D97706' },
        commercial:  { label: 'Commercial',          color: '#DC2626' },
    };
    const activeRole = roleParam && roleConfig[roleParam] ? roleConfig[roleParam] : null;

    const [formData, setFormData] = useState({ email: '', password: '' });
    const passwordRef = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const [previousUser, setPreviousUser] = useState<{ name: string; email: string } | null>(null);
    const [showPreviousAccount, setShowPreviousAccount] = useState(true);

    useEffect(() => {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        if (savedName && savedEmail) {
            setPreviousUser({ name: savedName, email: savedEmail });
            // If coming from a role pill, skip "Bon retour" mode
            // but pre-fill the email silently
            if (roleParam) {
                setShowPreviousAccount(false);
                setFormData(prev => ({ ...prev, email: savedEmail }));
            } else {
                setFormData(prev => ({ ...prev, email: savedEmail }));
            }
        }
        // Clear background scroll lock just in case
        document.body.style.overflow = '';
    }, [roleParam]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof typeof fieldErrors]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
        if (error) setError(null);
    };

    const validate = () => {
        const errors: { email?: string; password?: string } = {};
        if (!formData.email) {
            errors.email = 'Adresse e-mail requise.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Adresse e-mail invalide.';
        }
        if (!formData.password) {
            errors.password = 'Mot de passe requis.';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await api.login(formData.email, formData.password);
            setAuthToken(data.access_token);
            localStorage.removeItem('token');

            const payload = decodeJwtPayload(data.access_token);
            const tokenRole = payload?.role === 'student' ? 'eleve' : payload?.role;
            const finalRole = (data.role || tokenRole || activeRole) as string;

            localStorage.setItem('userRole', finalRole);
            localStorage.setItem('userEmail', data.email || formData.email);
            localStorage.setItem('userName', data.name || '');

            if (finalRole === 'super_admin') navigate('/admission');
            else if (finalRole === 'commercial') navigate('/commercial/dashboard');
            else if (finalRole === 'admission') navigate('/admission');
            else if (finalRole === 'rh') navigate('/rh/dashboard');
            else if (finalRole === 'eleve') navigate('/etudiant/dashboard');
            else navigate('/admission');
        } catch (err: any) {
            setError(err.message || 'Identifiants invalides');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <aside className="panel-brand" aria-label="ProcessIQ presentation">
                <div className="brand-glow-btm" aria-hidden="true"></div>
                <div className="bs bs-1" aria-hidden="true"></div>
                <div className="bs bs-2" aria-hidden="true"></div>
                <div className="bs bs-3" aria-hidden="true"></div>
                <div className="bs bs-4" aria-hidden="true"></div>

                <div className="brand-inner">
                    <Link to="/" className="brand-logo-wrap">
                        <img src="/images/logo-process-iq.png" alt="ProcessIQ" className="brand-logo" />
                        <span className="brand-logo-name">ProcessIQ</span>
                    </Link>

                    {/* Copy */}
                    <div className="brand-copy">
                        <p className="brand-eyebrow">Plateforme alternance</p>
                        <h2 className="brand-headline">
                            La plateforme qui <strong>libere l'alternance</strong> de la paperasse
                        </h2>
                        <p className="brand-desc">
                            Gerez vos conventions, suivis pédagogiques et conformités en un seul endroit. Moins d'administratif, plus de résultats.
                        </p>
                    </div>
                </div>
            </aside>

            <main className="panel-form" role="main">
                <Link to="/" className="form-back" aria-label="Retour a l'accueil">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Retour a l'accueil
                </Link>

                <div className="form-inner">
                    {previousUser && showPreviousAccount && !roleParam ? (
                        <div className="previous-account-card">
                            <h1 className="form-heading">Bon retour !</h1>
                            <p className="form-sub">Connectez-vous à votre espace ProcessIQ</p>

                            <div className="user-profile-preview">
                                <div className="user-avatar">
                                    {previousUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{previousUser.name}</span>
                                    <span className="user-email">{previousUser.email}</span>
                                </div>
                            </div>

                            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                                <div className="field-group">
                                    <label className="field-label" htmlFor="password">Mot de passe</label>
                                    <div className="field-wrap">
                                        <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        <input
                                            className={`field-input ${fieldErrors.password ? 'error' : ''}`}
                                            type={showPassword ? 'text' : 'password'}
                                            id="password-card"
                                            name="password"
                                            ref={passwordRef}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            className="field-toggle"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                {showPassword ? (
                                                    <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                                ) : (
                                                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                    {fieldErrors.password && <span className="field-error" role="alert">{fieldErrors.password}</span>}
                                </div>

                                <button type="submit" className="btn-submit" disabled={loading}>
                                    <span>{loading ? 'Connexion…' : `Se connecter en tant qu'utilisateur admin`}</span>
                                </button>
                            </form>

                            <button
                                className="btn-use-another"
                                onClick={() => {
                                    setShowPreviousAccount(false);
                                    setFormData({ email: '', password: '' });
                                }}
                            >
                                Utiliser un autre compte
                            </button>
                        </div>
                    ) : (
                        <>
                            {activeRole && (
                                <div className="role-badge" style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '100px',
                                    background: `${activeRole.color}18`,
                                    border: `1.5px solid ${activeRole.color}40`,
                                    color: activeRole.color,
                                    fontFamily: 'var(--font-ui)',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    marginBottom: '1rem',
                                    letterSpacing: '0.02em',
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>{roleParam && roleIcons[roleParam]}</span>
                                    <span>Connexion en tant que : {activeRole.label}</span>
                                </div>
                            )}
                            <h1 className="form-heading">{activeRole ? `Bienvenue, ${activeRole.label} !` : 'Bienvenue'}</h1>
                            <p className="form-sub">{activeRole ? `Connectez-vous à votre espace ${activeRole.label} ProcessIQ` : 'Connectez-vous à votre espace ProcessIQ'}</p>

                            {error && <div className="server-error" role="alert">{error}</div>}

                            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                                {/* Email */}
                                <div className="field-group">
                                    <label className="field-label" htmlFor="email">Adresse email</label>
                                    <div className="field-wrap">
                                        <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            className={`field-input ${fieldErrors.email ? 'error' : ''}`}
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="votre@email.fr"
                                            autoComplete="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {fieldErrors.email && <span className="field-error" role="alert">{fieldErrors.email}</span>}
                                </div>

                                {/* Mot de passe */}
                                <div className="field-group">
                                    <label className="field-label" htmlFor="password">Mot de passe</label>
                                    <div className="field-wrap">
                                        <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        <input
                                            className={`field-input ${fieldErrors.password ? 'error' : ''}`}
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            ref={passwordRef}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            className="field-toggle"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                {showPassword ? (
                                                    <>
                                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                                                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                                        <line x1="1" y1="1" x2="23" y2="23" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </>
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                    {fieldErrors.password && <span className="field-error" role="alert">{fieldErrors.password}</span>}
                                </div>

                                {/* Mot de passe oublié */}
                                <div className="forgot-row">
                                    <a href="#" className="forgot-link">Mot de passe oublié&nbsp;?</a>
                                </div>

                                {/* Bouton connexion */}
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    <span>{loading ? 'Connexion…' : 'Se connecter'}</span>
                                </button>
                            </form>

                            {previousUser && (
                                <button
                                    className="btn-back-to-previous"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, email: previousUser.email, password: '' }));
                                        passwordRef.current?.focus();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    Se connecter en tant qu'utilisateur admin
                                </button>
                            )}
                        </>
                    )}

                    <div className="form-divider"><span>ou</span></div>
                    <Link to="/register" className="btn-demo">Demander une demo gratuite</Link>
                    <p className="form-register">
                        Pas encore de compte ?
                        <Link to="/register"> Creer un compte</Link>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
