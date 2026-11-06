<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { Icon } from '@iconify/vue'
    import { useAuth } from '@/composables/useAuth'
    import filmstripIcon from '@iconify-icons/mdi/filmstrip'
    import eyeIcon from '@iconify-icons/mdi/eye-outline'
    import eyeOffIcon from '@iconify-icons/mdi/eye-off-outline'
    import { openAppAlert } from '@/components/ui/Alert.vue'
    import http from '@/plugins/axios'

    const router = useRouter()
    const auth = useAuth()

    const account = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const isLoading = ref(false)
    // Google 登入按鈕的掛載位置
    const googleButton = ref(null)

    // Google 登入設定錯誤訊息
    const googleConfigError = ref('')

    const handleLogin = async () => {
    if (!account.value.trim() || !password.value) {
        await openAppAlert({
        variant: 'warning',
        title: '請填寫完整',
        text: '請輸入帳號與密碼',
        confirmText: '確定',
        cancelText: '',
        })
        return
    }

    try {
        isLoading.value = true

        const response = await http.post('/auth/login', {
        account: account.value.trim(),
        password: password.value,
        })

        const data = response.data

        // 儲存 JWT Token，讓 Axios 自動附加到後續請求
        auth.login(data.token, data.user)

        await openAppAlert({
        variant: 'success',
        title: '登入成功',
        text: `歡迎回來，${data.user?.name || data.user?.account || '會員'}！`,
        confirmText: '開始使用',
        cancelText: '',
        })

        // 目前先導向地圖頁
        await router.push('/map')
    } catch (error) {
        const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        '帳號或密碼錯誤，請確認後再試一次'

        await openAppAlert({
        variant: 'error',
        title: '登入失敗',
        text: message,
        confirmText: '重新輸入',
        cancelText: '',
        })
    } finally {
        isLoading.value = false
    }
    }

    
/**
 * 載入 Google Identity Services
 */
function loadGoogleScript() {
    return new Promise((resolve, reject) => {
        // 如果 Google SDK 已經載入，就直接使用
        if (window.google?.accounts?.id) {
            resolve()
            return
        }

        // 避免重複插入 Google SDK
        let script = document.querySelector(
            'script[src="https://accounts.google.com/gsi/client"]'
        )

        if (!script) {
            script = document.createElement('script')
            script.src = 'https://accounts.google.com/gsi/client'
            script.async = true
            script.defer = true
        }

        script.addEventListener('load', resolve, { once: true })
        script.addEventListener(
            'error',
            () => reject(new Error('Google 登入元件載入失敗')),
            { once: true }
        )

        if (!script.isConnected) {
            document.head.appendChild(script)
        }
    })
}

/**
 * Google 登入成功後取得 credential，
 * 傳給後端驗證並取得本站 JWT
 */
const handleGoogleLogin = async (response) => {
    if (isLoading.value) return

    if (!response?.credential) {
        await openAppAlert({
            variant: 'error',
            title: 'Google 登入失敗',
            text: '未能取得 Google 登入憑證，請再試一次',
            confirmText: '確定',
            cancelText: '',
        })
        return
    }

    try {
        isLoading.value = true

        // 呼叫既有的 Spring Boot Google 登入 API
        const result = await http.post('/auth/google', {
            idToken: response.credential,
        })

        const data = result.data

        if (!data?.token || !data?.user) {
            throw new Error('後端回傳的登入資料不完整')
        }

        // 沿用原本的登入狀態與 Token 儲存機制
        auth.login(data.token, data.user)

        await openAppAlert({
            variant: 'success',
            title: '登入成功',
            text: `歡迎回來，${data.user.name || data.user.account || '會員'}！`,
            confirmText: '開始使用',
            cancelText: '',
        })

        // 沿用原本的登入後導向
        await router.push('/map')
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.response?.data?.detail ||
            error.message ||
            'Google 登入失敗，請稍後再試'

        await openAppAlert({
            variant: 'error',
            title: 'Google 登入失敗',
            text: message,
            confirmText: '重新嘗試',
            cancelText: '',
        })
    } finally {
        isLoading.value = false
    }
}

/**
 * 初始化 Google 登入按鈕
 */
onMounted(async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId) {
        googleConfigError.value =
            '尚未設定 Google OAuth Client ID，請先完成環境變數設定。'
        return
    }

    try {
        await loadGoogleScript()

        if (!googleButton.value) return

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleLogin,
        })

        window.google.accounts.id.renderButton(
            googleButton.value,
            {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: Math.min(
                    360,
                    Math.max(200, googleButton.value.clientWidth)
                ),
                locale: 'zh_TW',
            }
        )
    } catch (error) {
        googleConfigError.value =
            error.message || 'Google 登入元件載入失敗，請重新整理頁面。'
    }
})

</script>

<template>
    <div class="login-page">
        <section class="login-card">
        <div class="login-heading">
            <div class="login-icon">
            <Icon :icon="filmstripIcon" />
            </div>

            <h1>會員登入</h1>
            <p>登入特典地圖，繼續探索你的收藏旅程</p>
        </div>

        <form @submit.prevent="handleLogin">
            <div class="mb-3">
            <label for="account" class="form-label">帳號</label>
            <input
                id="account"
                v-model="account"
                type="text"
                class="form-control login-input"
                placeholder="請輸入帳號"
                autocomplete="username"
                :disabled="isLoading"
                required
            />
            </div>

            <div class="mb-4">
            <label for="password" class="form-label">密碼</label>
            <div class="password-field">
                <input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control login-input"
                    placeholder="請輸入密碼"
                    autocomplete="current-password"
                    :disabled="isLoading"
                    required
                />
                <button
                    type="button"
                    class="password-toggle"
                    :aria-pressed="showPassword"
                    :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
                    :disabled="isLoading"
                    @click="showPassword = !showPassword"
                >
                    <Icon :icon="showPassword ? eyeOffIcon : eyeIcon" aria-hidden="true" />
                </button>
            </div>
            </div>

            <div class="forgot-link">
            <RouterLink to="/forgot-password">
                忘記密碼？
            </RouterLink>
            </div>

            <button
            type="submit"
            class="btn login-button w-100"
            :disabled="isLoading"
            >
            {{ isLoading ? '登入中...' : '登入' }}
            </button>
        </form>

        <!-- 一般登入與 Google 登入的分隔線 -->
        <div class="login-divider">
            <span>或使用以下方式登入</span>
        </div>

        <!-- Google 官方登入按鈕會顯示在這裡 -->
        <div class="google-login-area">
            <div
                v-if="!googleConfigError"
                ref="googleButton"
                class="google-button-container"
            ></div>

            <p
                v-if="googleConfigError"
                class="google-error"
                role="alert"
            >
                {{ googleConfigError }}
            </p>
        </div>

        <div class="login-footer">
            <span>還沒有帳號嗎？</span>
            <RouterLink to="/register">立即註冊</RouterLink>
        </div>

        <RouterLink to="/map" class="back-link">
            返回地圖
        </RouterLink>
        </section>
    </div>
</template>

<style scoped>
    .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    }

    .login-card {
    width: 100%;
    max-width: 460px;
    padding: 2.5rem;
    background: var(--c-card);
    border: 1px solid var(--c-border);
    border-radius: 1.5rem;
    box-shadow: var(--shadow-soft);
    }

    .login-heading {
    text-align: center;
    margin-bottom: 2rem;
    }

    .login-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #805b16;
    background: #fff0c9;
    border-radius: 1.25rem;
    font-size: 2rem;
    }

    .login-heading h1 {
    margin-bottom: 0.5rem;
    }

    .login-heading p {
    margin: 0;
    color: var(--c-muted);
    font-size: var(--text-min);
    }

    .form-label {
    font-weight: 700;
    }

    .login-input {
    min-height: 48px;
    border-color: var(--c-border);
    border-radius: 0.75rem;
    font-size: var(--text-control);
    }

    .login-input:focus {
    border-color: #d9a441;
    box-shadow: 0 0 0 0.2rem rgb(217 164 65 / 18%);
    }

    .password-field {
    position: relative;
    }

    .password-field .login-input {
    padding-right: 3rem;
    }

    .password-toggle {
    position: absolute;
    top: 50%;
    right: 0.35rem;
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 0;
    border-radius: 0.6rem;
    background: transparent;
    color: #805b16;
    font-size: 1.25rem;
    transform: translateY(-50%);
    cursor: pointer;
    }

    .password-toggle:hover:not(:disabled) {
    background: #fff0c9;
    }

    .password-toggle:focus-visible {
    outline: 2px solid #d9a441;
    outline-offset: 2px;
    }

    .password-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.45;
    }

    .forgot-link {
    text-align: right;
    margin-top: -0.75rem;
    margin-bottom: 1.25rem;
    }

    .forgot-link a,
    .login-footer a,
    .back-link {
    color: #805b16;
    font-weight: 700;
    text-decoration: none;
    }

    .login-button {
    min-height: 48px;
    color: #292b35;
    background: #ffcf70;
    border: none;
    border-radius: 0.75rem;
    font-size: var(--text-control);
    font-weight: 800;
    }

    .login-button:hover:not(:disabled) {
    background: #f6bd50;
    }

    .login-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 1.5rem;
    font-size: var(--text-min);
    }

    .back-link {
    display: block;
    margin-top: 1.25rem;
    text-align: center;
    font-size: var(--text-min);
    }

    @media (max-width: 480px) {
    .login-card {
        padding: 1.5rem;
    }
    }

    .login-divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0;
    color: var(--c-muted);
    font-size: var(--text-min);
    }

    .login-divider::before,
    .login-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--c-border);
    }

    .google-login-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    }

    .google-button-container {
    display: flex;
    justify-content: center;
    width: 100%;
    min-height: 40px;
    }

    .google-error {
    margin: 0;
    color: #b42318;
    font-size: var(--text-min);
    text-align: center;
    }

</style>