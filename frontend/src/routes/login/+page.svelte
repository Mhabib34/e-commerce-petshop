<script lang="ts">
    import { goto } from "$app/navigation";
    import { useQueryClient } from "@tanstack/svelte-query";
    import { useLogin } from "$lib/mutations/auth";
    import { Eye, EyeOff } from "lucide-svelte";

    const queryClient = useQueryClient();
    const loginMutation = useLogin();

    let email = $state("");
    let password = $state("");
    let errorMsg = $state("");
    let showPassword = $state(false);
    let rememberMe = $state(false);

    function submit() {
        errorMsg = "";
        loginMutation.mutate(
            { email, password },
            {
                onSuccess: (data) => {
                    if (data.data?.token) {
                        localStorage.setItem("token", data.data.token);
                    }
                    queryClient.invalidateQueries({ queryKey: ["me"] });
                    if (data.data?.user?.role === "ADMIN") {
                        goto("/admin");
                    } else {
                        goto("/");
                    }
                },
                onError: (error: Error & { response?: { data?: { message?: string } } }) => {
                    errorMsg =
                        error?.response?.data?.message ||
                        "Email atau password salah";
                },
            }
        );
    }

    import { PUBLIC_APP_NAME } from '$env/static/public';
</script>

<svelte:head>
    <title>Login - {PUBLIC_APP_NAME} Pet Admin</title>
    <meta name="description" content="Masuk ke panel admin {PUBLIC_APP_NAME} untuk mengelola toko pet shop Anda." />
</svelte:head>

<div class="login-page">
    <!-- Paw decorations -->
    <svg class="paw-top-left" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="70" cy="60" rx="22" ry="26" fill="#E8D5C4" opacity="0.5"/>
        <ellipse cx="120" cy="45" rx="18" ry="22" fill="#E8D5C4" opacity="0.4"/>
        <ellipse cx="45" cy="110" rx="16" ry="20" fill="#E8D5C4" opacity="0.35"/>
        <ellipse cx="95" cy="100" rx="30" ry="35" fill="#E8D5C4" opacity="0.45"/>
    </svg>
    <svg class="paw-top-right" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="70" cy="60" rx="22" ry="26" fill="#E8D5C4" opacity="0.4"/>
        <ellipse cx="120" cy="45" rx="18" ry="22" fill="#E8D5C4" opacity="0.35"/>
        <ellipse cx="45" cy="110" rx="16" ry="20" fill="#E8D5C4" opacity="0.3"/>
        <ellipse cx="95" cy="100" rx="30" ry="35" fill="#E8D5C4" opacity="0.4"/>
    </svg>
    <svg class="paw-bottom-right" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="70" cy="60" rx="22" ry="26" fill="#E8D5C4" opacity="0.5"/>
        <ellipse cx="120" cy="45" rx="18" ry="22" fill="#E8D5C4" opacity="0.4"/>
        <ellipse cx="45" cy="110" rx="16" ry="20" fill="#E8D5C4" opacity="0.35"/>
        <ellipse cx="95" cy="100" rx="30" ry="35" fill="#E8D5C4" opacity="0.45"/>
    </svg>

    <!-- Login Card -->
    <div class="login-card">
        <!-- Logo -->
        <div class="logo-section">
            <div class="logo-icon">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                    <ellipse cx="12" cy="8" rx="4.5" ry="5.5" fill="#8B2E2E"/>
                    <ellipse cx="28" cy="8" rx="4.5" ry="5.5" fill="#8B2E2E"/>
                    <ellipse cx="6" cy="20" rx="3.5" ry="4.5" fill="#8B2E2E"/>
                    <ellipse cx="34" cy="20" rx="3.5" ry="4.5" fill="#8B2E2E"/>
                    <ellipse cx="20" cy="24" rx="10" ry="11" fill="#8B2E2E"/>
                </svg>
            </div>
            <h1 class="logo-title">{PUBLIC_APP_NAME}</h1>
            <p class="logo-subtitle">Pet Admin Center</p>
        </div>

        <!-- Form header -->
        <div class="form-header">
            <h2>Admin Login</h2>
            <p>Masuk untuk mengelola toko</p>
        </div>

        <!-- Error message -->
        {#if errorMsg}
            <div class="error-alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.5v4a.75.75 0 01-1.5 0v-4a.75.75 0 011.5 0z"/>
                </svg>
                {errorMsg}
            </div>
        {/if}

        <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
            <!-- Email -->
            <div class="form-group">
                <label for="login-email">Email</label>
                <div class="input-wrapper">
                    <span class="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <path d="M22 4L12 13 2 4"/>
                        </svg>
                    </span>
                    <input
                        type="email"
                        bind:value={email}
                        id="login-email"
                        required
                        placeholder="admin@letshop.id"
                    />
                </div>
            </div>

            <!-- Password -->
            <div class="form-group">
                <div class="label-row">
                    <label for="login-password">Password</label>
                    <a href="/login" class="forgot-link">Lupa Password?</a>
                </div>
                <div class="input-wrapper">
                    <span class="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                    </span>
                    <input
                        type={showPassword ? "text" : "password"}
                        bind:value={password}
                        id="login-password"
                        required
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        class="toggle-password"
                        onclick={() => (showPassword = !showPassword)}
                    >
                        {#if showPassword}
                            <EyeOff size={18} />
                        {:else}
                            <Eye size={18} />
                        {/if}
                    </button>
                </div>
            </div>

            <!-- Remember me -->
            <div class="remember-row">
                <label class="checkbox-label">
                    <input type="checkbox" bind:checked={rememberMe} />
                    <span>Ingat saya</span>
                </label>
            </div>

            <!-- Submit -->
            <button
                type="submit"
                disabled={loginMutation.isPending}
                class="submit-btn"
                id="login-submit"
            >
                {loginMutation.isPending ? "Memproses..." : "Masuk"}
                {#if !loginMutation.isPending}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                {/if}
            </button>
        </form>

        <!-- Footer -->
        <div class="card-footer">
            <p>Butuh bantuan? <a href="/register" class="support-link">Hubungi IT Support</a></p>
        </div>
    </div>
</div>

<style>
    .login-page {
        min-height: 100vh;
        background-color: #FFF5EE;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        font-family: 'Nunito', sans-serif;
        padding: 2rem 1rem;
    }

    /* Paw decorations */
    .paw-top-left {
        position: absolute;
        top: -20px;
        left: -20px;
        width: 180px;
        height: 180px;
        transform: rotate(-15deg);
        opacity: 0.7;
    }
    .paw-top-right {
        position: absolute;
        top: 40px;
        right: 40px;
        width: 140px;
        height: 140px;
        transform: rotate(25deg);
        opacity: 0.6;
    }
    .paw-bottom-right {
        position: absolute;
        bottom: -10px;
        right: -10px;
        width: 170px;
        height: 170px;
        transform: rotate(45deg);
        opacity: 0.7;
    }

    .login-card {
        background: white;
        border-radius: 24px;
        padding: 2.5rem 2.5rem 2rem;
        width: 100%;
        max-width: 420px;
        box-shadow: 0 4px 40px rgba(139, 46, 46, 0.06);
        position: relative;
        z-index: 10;
        animation: cardSlideUp 0.5s ease-out;
    }

    @keyframes cardSlideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .logo-section {
        text-align: center;
        margin-bottom: 1.5rem;
    }
    .logo-icon {
        width: 56px;
        height: 56px;
        background: #FFF5EE;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 0.75rem;
    }
    .logo-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: #8B2E2E;
        margin: 0;
        letter-spacing: -0.02em;
    }
    .logo-subtitle {
        font-size: 0.85rem;
        color: #666;
        margin: 0.15rem 0 0;
        font-weight: 500;
    }

    .form-header {
        text-align: center;
        margin-bottom: 1.75rem;
    }
    .form-header h2 {
        font-size: 1.05rem;
        font-weight: 700;
        color: #333;
        margin: 0;
    }
    .form-header p {
        font-size: 0.8rem;
        color: #888;
        margin: 0.2rem 0 0;
        font-weight: 500;
    }

    .error-alert {
        background: #FEF2F2;
        border: 1px solid #FECACA;
        color: #DC2626;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        animation: shakeX 0.4s ease-in-out;
    }

    @keyframes shakeX {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    .form-group {
        margin-bottom: 1.25rem;
    }
    .form-group label {
        display: block;
        font-size: 0.8rem;
        font-weight: 700;
        color: #444;
        margin-bottom: 0.5rem;
    }
    .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .label-row label {
        margin-bottom: 0;
    }
    .forgot-link {
        font-size: 0.75rem;
        color: #D4634E;
        font-weight: 700;
        text-decoration: none;
        transition: color 0.2s;
    }
    .forgot-link:hover {
        color: #8B2E2E;
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }
    .input-icon {
        position: absolute;
        left: 14px;
        color: #BBB;
        display: flex;
        align-items: center;
        pointer-events: none;
        transition: color 0.2s;
    }
    .input-wrapper:focus-within .input-icon {
        color: #8B2E2E;
    }
    .input-wrapper input {
        width: 100%;
        padding: 0.8rem 3rem 0.8rem 2.8rem;
        background: #FFF9F5;
        border: 1.5px solid #F0E0D6;
        border-radius: 14px;
        font-size: 0.85rem;
        color: #333;
        transition: all 0.2s;
        font-family: 'Nunito', sans-serif;
        font-weight: 500;
        outline: none;
    }
    .input-wrapper input::placeholder {
        color: #C4B0A0;
        font-weight: 500;
    }
    .input-wrapper input:focus {
        border-color: #D4A48A;
        background: #FFFCFA;
        box-shadow: 0 0 0 3px rgba(139, 46, 46, 0.08);
    }

    .toggle-password {
        position: absolute;
        right: 14px;
        background: none;
        border: none;
        color: #BBB;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 4px;
        transition: color 0.2s;
    }
    .toggle-password:hover {
        color: #8B2E2E;
    }

    .remember-row {
        margin-bottom: 1.5rem;
    }
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.8rem;
        color: #666;
        font-weight: 600;
    }
    .checkbox-label input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: #8B2E2E;
        border-radius: 4px;
        cursor: pointer;
    }

    .submit-btn {
        width: 100%;
        padding: 0.9rem;
        background: linear-gradient(135deg, #F07B5F 0%, #E8604A 100%);
        color: white;
        border: none;
        border-radius: 14px;
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s;
        font-family: 'Nunito', sans-serif;
        box-shadow: 0 4px 15px rgba(240, 123, 95, 0.3);
    }
    .submit-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #E8604A 0%, #D4534A 100%);
        box-shadow: 0 6px 20px rgba(240, 123, 95, 0.4);
        transform: translateY(-1px);
    }
    .submit-btn:active:not(:disabled) {
        transform: translateY(0);
    }
    .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .submit-btn svg {
        transition: transform 0.2s;
    }
    .submit-btn:hover:not(:disabled) svg {
        transform: translateX(3px);
    }

    .card-footer {
        text-align: center;
        margin-top: 1.75rem;
        padding-top: 1.25rem;
        border-top: 1px solid #F5EDE7;
    }
    .card-footer p {
        font-size: 0.8rem;
        color: #999;
        margin: 0;
        font-weight: 600;
    }
    .support-link {
        color: #4A90A4;
        text-decoration: none;
        font-weight: 700;
        transition: color 0.2s;
    }
    .support-link:hover {
        color: #357082;
        text-decoration: underline;
    }

    @media (max-width: 480px) {
        .login-card {
            padding: 2rem 1.5rem 1.5rem;
        }
    }
</style>