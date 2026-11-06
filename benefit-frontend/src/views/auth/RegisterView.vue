<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AuthShell from '@/components/auth/AuthShell.vue'
import accountIcon from '@iconify-icons/mdi/account-outline'
import lockIcon from '@iconify-icons/mdi/lock-outline'
import emailIcon from '@iconify-icons/mdi/email-outline'
import badgeIcon from '@iconify-icons/mdi/badge-account-outline'
import cakeIcon from '@iconify-icons/mdi/cake-variant-outline'
import eyeIcon from '@iconify-icons/mdi/eye-outline'
import eyeOffIcon from '@iconify-icons/mdi/eye-off-outline'
import arrowLeftIcon from '@iconify-icons/mdi/arrow-left'
import { openAppAlert } from '@/components/ui/Alert.vue'
import http from '@/plugins/axios'

const router = useRouter()

const account = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const email = ref('')
const birthDate = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleRegister() {
    // 檢查必填欄位
    const missingFields = []

    if (!account.value.trim()) missingFields.push('帳號')
    if (!password.value) missingFields.push('密碼')
    if (!confirmPassword.value) missingFields.push('確認密碼')
    if (!email.value.trim()) missingFields.push('電子郵件')

    if (missingFields.length > 0) {
        await openAppAlert({
            variant: 'warning',
            title: '尚有必填欄位未完成',
            text: `${missingFields.join('、')}還沒填寫完成，請補齊後再送出。`,
            confirmText: '返回填寫',
            cancelText: '',
        })
        return
    }

    // 密碼長度限制：8～16 碼
    if (password.value.length < 8 || password.value.length > 16) {
        await openAppAlert({
            variant: 'warning',
            title: '密碼長度不符',
            text: '密碼長度須為 8～16 碼。',
            confirmText: '重新輸入',
            cancelText: '',
        })
        return
    }

    
    // 確認密碼必須與密碼一致
    if (password.value !== confirmPassword.value) {
        await openAppAlert({
            variant: 'warning',
            title: '密碼不一致',
            text: '兩次輸入的密碼不相同，請重新確認。',
            confirmText: '重新輸入',
            cancelText: '',
        })
        return
    }


    try {
        isLoading.value = true

        await http.post('/auth/register', {
            account: account.value.trim(),
            password: password.value,
            email: email.value.trim(),
            name: name.value.trim() || account.value.trim(),
            birthDate: birthDate.value || null,
        })

        await openAppAlert({
            variant: 'success',
            title: '註冊成功',
            text: '現在可以使用帳號登入了！',
            confirmText: '前往登入',
            cancelText: '',
        })

        await router.push('/login')
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.response?.data?.detail ||
            '註冊失敗，請確認資料是否正確或帳號是否已被使用'

        await openAppAlert({
            variant: 'error',
            title: '註冊失敗',
            text: message,
            confirmText: '返回修改',
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
            <p class="auth-kicker">加入會員</p>
            <h1>建立帳號</h1>
            <p><span class="required-star">*</span> 號欄位必填</p>
        </div>

        <form @submit.prevent="handleRegister">
            <div class="field">
                <label for="account" class="form-label">
                    帳號 <span class="required-star">*</span>
                </label>
                <div class="field-control">
                    <Icon :icon="accountIcon" class="field-icon" aria-hidden="true" />
                    <input
                        id="account"
                        v-model="account"
                        type="text"
                        class="form-control auth-input"
                        placeholder="請設定登入帳號"
                        autocomplete="username"
                        :disabled="isLoading"
                        required
                    />
                </div>
            </div>

            <div class="field">
                <label for="password" class="form-label">
                    密碼 <span class="required-star">*</span>
                </label>
                <div class="field-control password-field">
                    <Icon :icon="lockIcon" class="field-icon" aria-hidden="true" />
                    <input
                        id="password"
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control auth-input"
                        placeholder="請輸入 8～16 碼密碼"
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
                        :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
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
                    確認密碼 <span class="required-star">*</span>
                </label>
                <div class="field-control password-field">
                    <Icon :icon="lockIcon" class="field-icon" aria-hidden="true" />
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        class="form-control auth-input"
                        placeholder="請再次輸入密碼"
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

            <div class="field">
                <label for="email" class="form-label">
                    電子郵件 <span class="required-star">*</span>
                </label>
                <div class="field-control">
                    <Icon :icon="emailIcon" class="field-icon" aria-hidden="true" />
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        class="form-control auth-input"
                        placeholder="請輸入電子郵件"
                        autocomplete="email"
                        :disabled="isLoading"
                        required
                    />
                </div>
            </div>

            <div class="field">
                <label for="name" class="form-label">暱稱</label>
                <div class="field-control">
                    <Icon :icon="badgeIcon" class="field-icon" aria-hidden="true" />
                    <input
                        id="name"
                        v-model="name"
                        type="text"
                        class="form-control auth-input"
                        placeholder="請輸入顯示名稱（選填）"
                        autocomplete="name"
                        :disabled="isLoading"
                    />
                </div>
            </div>

            <div class="field">
                <label for="birthDate" class="form-label">生日</label>
                <div class="field-control">
                    <Icon :icon="cakeIcon" class="field-icon" aria-hidden="true" />
                    <input
                        id="birthDate"
                        v-model="birthDate"
                        type="date"
                        class="form-control auth-input"
                        autocomplete="bday"
                        :disabled="isLoading"
                    />
                </div>
            </div>

            <button
                type="submit"
                class="btn auth-button w-100"
                :disabled="isLoading"
            >
                <span v-if="isLoading" class="auth-spinner" aria-hidden="true"></span>
                {{ isLoading ? '註冊中...' : '建立帳號' }}
            </button>
        </form>

        <div class="auth-footer">
            <span>已經有帳號了嗎？</span>
            <RouterLink to="/login">返回登入</RouterLink>
        </div>

        <RouterLink to="/map" class="back-link">
            <Icon :icon="arrowLeftIcon" aria-hidden="true" />
            返回地圖
        </RouterLink>
    </AuthShell>
</template>

