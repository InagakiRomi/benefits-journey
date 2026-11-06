<script setup>
import { Icon } from '@iconify/vue'
import filmstripIcon from '@iconify-icons/mdi/filmstrip'
import mapMarkerIcon from '@iconify-icons/mdi/map-marker-outline'
import giftIcon from '@iconify-icons/mdi/gift-outline'
import ticketIcon from '@iconify-icons/mdi/ticket-confirmation-outline'
</script>

<template>
    <div class="auth-page">
        <div class="auth-stage">
            <aside class="auth-hero">
                <RouterLink to="/map" class="hero-brand">
                    <span class="hero-mark" aria-hidden="true">
                        <Icon :icon="filmstripIcon" />
                    </span>
                    <span>特典地圖</span>
                </RouterLink>

                <div class="hero-copy">
                    <p class="hero-kicker">Benefits Journey</p>
                    <h2>把每一張特典，收進你的收藏旅程</h2>
                    <p>登入後接著看地圖、追場次，也把想換的票券留在這裡。</p>
                </div>

                <ul class="hero-points">
                    <li>
                        <span class="point-icon" aria-hidden="true"><Icon :icon="mapMarkerIcon" /></span>
                        <span>在地圖上找附近特典</span>
                    </li>
                    <li>
                        <span class="point-icon" aria-hidden="true"><Icon :icon="giftIcon" /></span>
                        <span>收藏電影與提醒檔期</span>
                    </li>
                    <li>
                        <span class="point-icon" aria-hidden="true"><Icon :icon="ticketIcon" /></span>
                        <span>刊登並交換票券特典</span>
                    </li>
                </ul>
            </aside>

            <section class="auth-card">
                <slot />
            </section>
        </div>
    </div>
</template>

<style scoped>
.auth-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    background:
        radial-gradient(circle at 8% 0%, rgb(255 200 87 / 42%), transparent 28%),
        radial-gradient(circle at 100% 8%, rgb(126 167 232 / 28%), transparent 26%),
        radial-gradient(circle at 78% 100%, rgb(255 112 73 / 16%), transparent 28%),
        #fff6ea;
}

.auth-stage {
    width: min(980px, 100%);
    margin: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 640px;
    border-radius: 1.75rem;
    overflow: hidden;
    background: var(--c-card);
    border: 1.5px solid var(--c-border);
}

.auth-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2rem;
    padding: 2.5rem 2.75rem 2.25rem;
    color: var(--c-ink);
    background: transparent;
    border-right: 1.5px solid var(--c-border);
    overflow: hidden;
}

.hero-brand {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    width: fit-content;
    color: var(--c-ink);
    font-family: var(--font-latin);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-decoration: none;
}

.hero-brand:hover {
    color: #c47a12;
}

.hero-mark {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.9rem;
    color: #1e2b45;
    background: #ffc857;
    font-size: 1.45rem;
}

.hero-copy {
    position: relative;
    z-index: 1;
}

.hero-kicker {
    margin: 0 0 0.55rem;
    color: #c47a12;
    font-family: var(--font-latin);
    font-size: var(--text-min);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.hero-copy h2 {
    max-width: 11em;
    margin: 0 0 0.85rem;
    color: var(--c-ink);
    font-size: clamp(1.7rem, 2.4vw, 2.15rem);
    line-height: 1.35;
}

.hero-copy p:last-child {
    max-width: 18em;
    margin: 0;
    color: var(--c-muted);
    font-size: var(--text-min);
}

.hero-points {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

.hero-points li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--c-ink);
    font-size: var(--text-min);
}

.point-icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.75rem;
    color: #c47a12;
    background: #fff6ea;
    border: 1px solid var(--c-border);
    font-size: 1.15rem;
}

@media (max-width: 860px) {
    .auth-page {
        padding: 0.75rem;
    }

    .auth-stage {
        grid-template-columns: 1fr;
        min-height: 0;
    }

    .auth-hero {
        gap: 0.85rem;
        padding: 1.25rem 1.15rem 1.1rem;
        border-right: none;
        border-bottom: 1.5px solid var(--c-border);
    }

    .hero-copy h2 {
        max-width: none;
        font-size: 1.35rem;
        overflow-wrap: anywhere;
    }

    .hero-copy p:last-child,
    .hero-points {
        display: none;
    }
}
</style>

<style>
.auth-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2.5rem 2.35rem 2rem;
}

.auth-heading {
    margin-bottom: 1.6rem;
}

.auth-kicker {
    margin: 0 0 0.55rem;
    color: #c47a12;
    font-family: var(--font-latin);
    font-size: var(--text-min);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.auth-heading h1 {
    margin: 0 0 0.35rem;
    font-size: 2rem;
}

.auth-heading p:last-child {
    margin: 0;
    color: var(--c-muted);
    font-size: var(--text-min);
}

.auth-card .field {
    margin-bottom: 1.05rem;
}

.auth-card .field-label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
}

.auth-card .form-label {
    margin-bottom: 0.4rem;
    font-weight: 700;
}

.auth-card .required-star {
    color: #dc3545;
    font-weight: 800;
}

.auth-card .field-control {
    position: relative;
}

.auth-card .field-icon {
    position: absolute;
    top: 50%;
    left: 0.95rem;
    color: #a78445;
    font-size: 1.2rem;
    transform: translateY(-50%);
    pointer-events: none;
}

.auth-card .auth-input {
    min-height: 52px;
    padding-left: 2.7rem;
    border: 1px solid #ead7b4;
    border-radius: 0.9rem;
    background: #fffaf2;
    font-size: var(--text-control);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.auth-card .auth-input:hover:not(:disabled) {
    border-color: #e0c48a;
    background: #fff;
}

.auth-card .auth-input:focus {
    border-color: #e0ae45;
    background: #fff;
    box-shadow: 0 0 0 4px rgb(255 200 87 / 22%);
}

.auth-card .password-field .auth-input {
    padding-right: 3rem;
}

.auth-card .password-toggle {
    position: absolute;
    top: 50%;
    right: 0.4rem;
    display: grid;
    place-items: center;
    width: 2.35rem;
    height: 2.35rem;
    padding: 0;
    border: 1px solid #e4c98a;
    border-radius: 0.7rem;
    background: #fff;
    color: #1e2b45;
    font-size: 1.25rem;
    transform: translateY(-50%);
    cursor: pointer;
}

.auth-card .password-toggle:hover:not(:disabled) {
    background: #1e2b45;
    border-color: #1e2b45;
    color: #ffc857;
}

.auth-card .password-toggle:focus-visible {
    outline: 2px solid #d9a441;
    outline-offset: 2px;
}

.auth-card .password-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.45;
}

.auth-card .field-hint {
    margin-top: 0.4rem;
    color: var(--c-muted);
    font-size: var(--text-min);
}

.auth-card .text-link {
    color: #c2410c;
    font-size: var(--text-min);
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 0.18em;
}

.auth-card .auth-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    min-height: 52px;
    margin-top: 0.35rem;
    color: #fff;
    background: #ff7049;
    border: none;
    border-radius: 0.95rem;
    font-size: var(--text-control);
    font-weight: 800;
    letter-spacing: 0.04em;
    transition: background-color 0.2s ease;
}

.auth-card .auth-button:hover:not(:disabled) {
    background: #f25532;
}

.auth-card .auth-button:disabled {
    opacity: 0.72;
}

.auth-card .auth-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgb(255 255 255 / 35%);
    border-top-color: #fff;
    border-radius: 50%;
    animation: auth-spin 0.7s linear infinite;
}

@keyframes auth-spin {
    to {
        transform: rotate(360deg);
    }
}

.auth-card .auth-divider {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    margin: 1.35rem 0 1rem;
    color: var(--c-muted);
    font-size: var(--text-min);
}

.auth-card .auth-divider::before,
.auth-card .auth-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #ead7b4, transparent);
}

.auth-card .google-login-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.auth-card .google-button-container {
    display: flex;
    justify-content: center;
    width: 100%;
    min-height: 44px;
    overflow: hidden;
    border-radius: 0.95rem;
}

.auth-card .google-error {
    margin: 0;
    color: #b42318;
    font-size: var(--text-min);
    text-align: center;
}

.auth-card .auth-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 1.35rem;
    color: var(--c-muted);
    font-size: var(--text-min);
}

.auth-card .auth-footer a {
    color: #c2410c;
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 0.18em;
}

.auth-card .text-link:hover,
.auth-card .auth-footer a:hover {
    color: #9a3412;
}

.auth-card .back-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    align-self: stretch;
    min-height: 48px;
    margin-top: 0.9rem;
    padding: 0.45rem 1rem;
    border: 1.5px solid #1e2b45;
    border-radius: 0.95rem;
    background: #fff;
    color: #1e2b45;
    font-size: var(--text-min);
    font-weight: 800;
    text-decoration: none;
}

.auth-card .back-link:hover {
    background: #1e2b45;
    color: #fff;
}

@media (max-width: 860px) {
    .auth-card {
        padding: 1.5rem 1.2rem 1.35rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .auth-card .auth-spinner {
        animation: none;
    }
}
</style>
