<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { Icon } from '@iconify/vue'
    import { useAuth } from '@/composables/useAuth'
    import AuthShell from '@/components/auth/AuthShell.vue'
    import eyeIcon from '@iconify-icons/mdi/eye-outline'
    import eyeOffIcon from '@iconify-icons/mdi/eye-off-outline'
    import accountIcon from '@iconify-icons/mdi/account-outline'
    import lockIcon from '@iconify-icons/mdi/lock-outline'
    import arrowLeftIcon from '@iconify-icons/mdi/arrow-left'
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
                theme: 'filled_blue',
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
    <AuthShell>
                <div class="auth-heading">
                    <p class="auth-kicker">會員入口</p>
                    <h1>歡迎回來</h1>
                    <p>登入後繼續你的特典收藏</p>
                </div>

                <form @submit.prevent="handleLogin">
                    <div class="field">
                        <label for="account" class="form-label">帳號</label>
                        <div class="field-control">
                            <Icon :icon="accountIcon" class="field-icon" aria-hidden="true" />
                            <input
                                id="account"
                                v-model="account"
                                type="text"
                                class="form-control auth-input"
                                placeholder="請輸入帳號"
                                autocomplete="username"
                                :disabled="isLoading"
                                required
                            />
                        </div>
                    </div>

                    <div class="field">
                        <div class="field-label-row">
                            <label for="password" class="form-label">密碼</label>
                            <RouterLink to="/forgot-password" class="text-link">忘記密碼？</RouterLink>
                        </div>
                        <div class="field-control password-field">
                            <Icon :icon="lockIcon" class="field-icon" aria-hidden="true" />
                            <input
                                id="password"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                class="form-control auth-input"
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

                    <button
                        type="submit"
                        class="btn auth-button w-100"
                        :disabled="isLoading"
                    >
                        <span v-if="isLoading" class="auth-spinner" aria-hidden="true"></span>
                        {{ isLoading ? '登入中...' : '登入' }}
                    </button>
                </form>

                <div class="auth-divider">
                    <span>或使用以下方式登入</span>
                </div>

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

                <div class="auth-footer">
                    <span>還沒有帳號嗎？</span>
                    <RouterLink to="/register">立即註冊</RouterLink>
                </div>

                <RouterLink to="/map" class="back-link">
                    <Icon :icon="arrowLeftIcon" aria-hidden="true" />
                    返回地圖
                </RouterLink>
    </AuthShell>
</template>
