    <script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { Icon } from '@iconify/vue'
    import AuthShell from '@/components/auth/AuthShell.vue'
    import emailIcon from '@iconify-icons/mdi/email-outline'
    import arrowLeftIcon from '@iconify-icons/mdi/arrow-left'
    import { openAppAlert } from '@/components/ui/Alert.vue'
    import http from '@/plugins/axios'

    const router = useRouter()

    const email = ref('')
    const isLoading = ref(false)

    async function handleForgotPassword() {
    if (!email.value.trim()) {
        await openAppAlert({
        variant: 'warning',
        title: '請輸入電子郵件',
        text: '請填寫註冊時使用的電子郵件',
        confirmText: '確定',
        cancelText: '',
        })
        return
    }

    try {
        isLoading.value = true

        await http.post('/auth/password/forgot', {
        email: email.value.trim(),
        })

        await openAppAlert({
        variant: 'success',
        title: '已送出申請',
        text: '如果這個電子郵件符合重設條件，請留意相關通知。',
        confirmText: '返回登入',
        cancelText: '',
        })

        await router.push('/login')
    } catch (error) {
        const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        '目前無法處理重設密碼申請，請稍後再試。'

        await openAppAlert({
        variant: 'error',
        title: '申請失敗',
        text: message,
        confirmText: '重新操作',
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
            <h1>忘記密碼</h1>
            <p>請輸入註冊時使用的電子郵件，以申請重設密碼。</p>
        </div>

        <form @submit.prevent="handleForgotPassword">
            <div class="field">
                <label for="email" class="form-label">電子郵件</label>
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

            <button
                type="submit"
                class="btn auth-button w-100"
                :disabled="isLoading"
            >
                <span v-if="isLoading" class="auth-spinner" aria-hidden="true"></span>
                {{ isLoading ? '送出中...' : '申請重設密碼' }}
            </button>
        </form>

        <RouterLink to="/login" class="back-link">
            <Icon :icon="arrowLeftIcon" aria-hidden="true" />
            返回登入
        </RouterLink>
    </AuthShell>
</template>
