<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AuthShell from '@/components/auth/AuthShell.vue'
import lockIcon from '@iconify-icons/mdi/lock-outline'
import eyeIcon from '@iconify-icons/mdi/eye-outline'
import eyeOffIcon from '@iconify-icons/mdi/eye-off-outline'
import arrowLeftIcon from '@iconify-icons/mdi/arrow-left'
import { openAppAlert } from '@/components/ui/Alert.vue'
import http from '@/plugins/axios'

    const route = useRoute()
    const router = useRouter()

    // 自動讀取郵件連結中的 Token
    const token = computed(() => {
    const value = route.query.token
    return typeof value === 'string' ? value : ''
    })

    const password = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const isLoading = ref(false)

    async function handleResetPassword() {
    if (!token.value) {
        await openAppAlert({
        variant: 'error',
        title: '重設連結無效',
        text: '網址中沒有重設密碼 Token，請重新申請密碼重設。',
        confirmText: '前往忘記密碼',
        cancelText: '',
        })

        await router.push('/forgot-password')
        return
    }

    if (!password.value || !confirmPassword.value) {
        const missingFields = []

        if (!password.value) missingFields.push('新密碼')
        if (!confirmPassword.value) missingFields.push('確認密碼')

        await openAppAlert({
        variant: 'warning',
        title: '尚有欄位未填寫',
        text: `${missingFields.join('、')}還沒填寫完成。`,
        confirmText: '返回填寫',
        cancelText: '',
        })
        return
    }

    if (
        password.value.length < 8 ||
        password.value.length > 16
    ) {
        await openAppAlert({
        variant: 'warning',
        title: '密碼長度不符',
        text: '新密碼長度須為 8～16 碼。',
        confirmText: '重新輸入',
        cancelText: '',
        })
        return
    }

    if (password.value !== confirmPassword.value) {
        await openAppAlert({
        variant: 'warning',
        title: '密碼不一致',
        text: '兩次輸入的密碼不同，請重新確認。',
        confirmText: '重新輸入',
        cancelText: '',
        })
        return
    }

    try {
        isLoading.value = true

        await http.post('/auth/password/reset', {
        token: token.value,
        newPassword: password.value,
        })

        await openAppAlert({
        variant: 'success',
        title: '密碼重設成功',
        text: '請使用新密碼重新登入。',
        confirmText: '前往登入',
        cancelText: '',
        })

        await router.push('/login')
    } catch (error) {
        const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        '重設密碼失敗，連結可能已過期或已經使用，請重新申請。'

        await openAppAlert({
        variant: 'error',
        title: '重設密碼失敗',
        text: message,
        confirmText: '我知道了',
        cancelText: '',
        })
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <AuthShell>
        <div class="auth-heading">
            <p class="auth-kicker">密碼協助</p>
            <h1>重設密碼</h1>
            <p>請設定新的登入密碼，完成後即可重新登入。</p>
        </div>

        <form @submit.prevent="handleResetPassword">
            <div class="field">
                <label for="password" class="form-label">
                    新密碼 <span class="required-star">*</span>
                </label>
                <div class="field-control password-field">
                    <Icon :icon="lockIcon" class="field-icon" aria-hidden="true" />
                    <input
                        id="password"
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control auth-input"
                        placeholder="請輸入 8～16 碼新密碼"
                        autocomplete="new-password"
                        minlength="8"
                        maxlength="16"
                        :disabled="isLoading"
                        required
                    />
                    <button
                        type="button"
                        class="password-toggle"
                        :aria-pressed="showPassword"
                        :aria-label="showPassword ? '隱藏新密碼' : '顯示新密碼'"
                        :disabled="isLoading"
                        @click="showPassword = !showPassword"
                    >
                        <Icon :icon="showPassword ? eyeOffIcon : eyeIcon" aria-hidden="true" />
                    </button>
                </div>
                <div class="field-hint">密碼長度須為 8～16 碼。</div>
            </div>

            <div class="field">
                <label for="confirmPassword" class="form-label">
                    確認新密碼 <span class="required-star">*</span>
                </label>
                <div class="field-control password-field">
                    <Icon :icon="lockIcon" class="field-icon" aria-hidden="true" />
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        class="form-control auth-input"
                        placeholder="請再次輸入新密碼"
                        autocomplete="new-password"
                        minlength="8"
                        maxlength="16"
                        :disabled="isLoading"
                        required
                    />
                    <button
                        type="button"
                        class="password-toggle"
                        :aria-pressed="showConfirmPassword"
                        :aria-label="showConfirmPassword ? '隱藏確認密碼' : '顯示確認密碼'"
                        :disabled="isLoading"
                        @click="showConfirmPassword = !showConfirmPassword"
                    >
                        <Icon :icon="showConfirmPassword ? eyeOffIcon : eyeIcon" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <button
                type="submit"
                class="btn auth-button w-100"
                :disabled="isLoading"
            >
                <span v-if="isLoading" class="auth-spinner" aria-hidden="true"></span>
                {{ isLoading ? '重設中...' : '確認重設密碼' }}
            </button>
        </form>

        <RouterLink to="/login" class="back-link">
            <Icon :icon="arrowLeftIcon" aria-hidden="true" />
            返回登入
        </RouterLink>
    </AuthShell>
</template>
