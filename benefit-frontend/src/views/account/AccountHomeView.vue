<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import PageIntro from '@/components/layout/PageIntro.vue'
import { openAppAlert } from '@/components/ui/Alert.vue'
import http from '@/plugins/axios'
import accountIcon from '@iconify-icons/mdi/account-circle-outline'
import clipboardListIcon from '@iconify-icons/mdi/clipboard-list-outline'
import heartIcon from '@iconify-icons/mdi/heart-outline'
import giftIcon from '@iconify-icons/mdi/gift-outline'
import messageIcon from '@iconify-icons/mdi/message-text-outline'
import feedbackIcon from '@iconify-icons/mdi/comment-text-outline'

const route = useRoute()
const router = useRouter()

const accountMenus = [
    { to: '/account', label: '關於我', icon: accountIcon },
    { to: '/account/listings', label: '我的刊登', icon: clipboardListIcon },
    { to: '/account/favorites', label: '我的收藏', icon: heartIcon },
    { to: '/account/benefits', label: '我的特典', icon: giftIcon },
    { to: '/account/messages', label: '訊息中心', icon: messageIcon },
    { to: '/account/feedback', label: '意見回饋', icon: feedbackIcon },
]

const isHome = computed(() => route.name === 'account-home')

function isCurrentMenu(menu) {
    if (menu.to === '/account/messages') {
        return route.path === '/account/messages' || route.path.startsWith('/account/messages/')
    }

    return route.path === menu.to
}

function goToMenu(menu) {
    if (isCurrentMenu(menu)) return
    router.push(menu.to)
}

const user = ref(null)
const isLoading = ref(true)
const isDeactivating = ref(false)

const accountLinks = [
    {
        title: '修改個人資料',
        description: '更新暱稱、電子郵件等基本資料',
        icon: 'mdi:account-edit-outline',
        to: '/account/profile',
    },
    {
        title: '我的刊登',
        description: '查看自己的刊登內容',
        icon: 'mdi:clipboard-list-outline',
        to: '/account/listings',
    },
    {
        title: '我的收藏',
        description: '查看已收藏的刊登與內容',
        icon: 'mdi:heart-outline',
        to: '/account/favorites',
    },
    {
        title: '我的特典',
        description: '管理自己的特典紀錄',
        icon: 'mdi:gift-outline',
        to: '/account/benefits',
    },
    {
        title: '我的訊息',
        description: '前往會員私訊功能',
        icon: 'mdi:message-text-outline',
        to: '/account/messages',
    },
    {
        title: '意見回饋',
        description: '提交問題或建議，查看處理進度與管理員回覆',
        icon: 'mdi:comment-text-outline',
        to: '/account/feedback',
    },
]

// 只在「關於我」載入會員資料，子頁不重複請求
watch(
    isHome,
    async (home) => {
        if (!home || user.value) return

        isLoading.value = true

        try {
            const response = await http.get('/users/me')
            user.value = response.data
        } catch (error) {
            await openAppAlert({
                variant: 'error',
                title: '無法取得會員資料',
                text: error.response?.data?.message || '請重新登入後再試一次。',
                confirmText: '確定',
                cancelText: '',
            })
        } finally {
            isLoading.value = false
        }
    },
    { immediate: true },
)

// 停用目前登入會員的帳號
async function deactivateAccount() {
    if (user.value?.status !== 'ACTIVE' || isDeactivating.value) {
        return
    }

    const result = await openAppAlert({
        variant: 'warning',
        title: '確定要停用帳號嗎？',
        text: '停用後，你仍然可以登入帳號，也可以重新啟用帳號。',
        confirmText: '確定停用',
        cancelText: '取消',
    })

    if (!result.isConfirmed) {
        return
    }

    isDeactivating.value = true

    try {
        const response = await http.patch('/users/me/status', {
            status: 'INACTIVE',
        })

        // 只更新會員資料，不登出、不清除 Token、不跳轉
        user.value = response.data

        await openAppAlert({
            variant: 'success',
            title: '帳號已停用',
            text: '帳號狀態已更新為停用，你仍然可以登入並重新啟用帳號。',
            confirmText: '確定',
            cancelText: '',
        })
    } catch (error) {
        await openAppAlert({
            variant: 'error',
            title: '停用失敗',
            text: error.response?.data?.message || '無法停用帳號，請稍後再試。',
            confirmText: '確定',
            cancelText: '',
        })
    } finally {
        isDeactivating.value = false
    }
}

// 重新啟用目前登入會員的帳號
async function reactivateAccount() {
    if (user.value?.status !== 'INACTIVE' || isDeactivating.value) {
        return
    }

    const result = await openAppAlert({
        variant: 'confirm',
        title: '重新啟用帳號？',
        text: '確認後，帳號狀態將恢復為使用中。',
        confirmText: '確認啟用',
        cancelText: '取消',
    })

    if (!result.isConfirmed) {
        return
    }

    isDeactivating.value = true

    try {
        const response = await http.patch('/users/me/status', {
            status: 'ACTIVE',
        })

        // 只更新會員資料，不登出、不清除 Token、不跳轉
        user.value = response.data

        await openAppAlert({
            variant: 'success',
            title: '帳號已重新啟用',
            text: '你的帳號現在已恢復為使用中。',
            confirmText: '確定',
            cancelText: '',
        })
    } catch (error) {
        await openAppAlert({
            variant: 'error',
            title: '重新啟用失敗',
            text: error.response?.data?.message || '無法重新啟用帳號，請稍後再試。',
            confirmText: '確定',
            cancelText: '',
        })
    } finally {
        isDeactivating.value = false
    }
}
</script>

<template>
    <div class="account-layout">
        <PageIntro
            kicker="✦ MEMBER CENTER"
            lead="會員"
            mark="中心"
            description="管理你的會員資料，整理屬於你的特典收藏旅程。"
            :icon-left="giftIcon"
            :icon-right="accountIcon"
            :icon-top="heartIcon"
        />

        <div v-if="isHome" class="container py-4 py-md-5">
        <div class="mb-4">
            <p class="text-uppercase small fw-bold mb-2 account-eyebrow">
                MY ACCOUNT
            </p>

            <h1 class="fw-bold mb-2">關於我</h1>

            <p class="text-secondary mb-0">
                管理你的會員資料，整理屬於你的特典收藏旅程。
            </p>
        </div>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">載入中</span>
            </div>
            <p class="text-secondary mt-3">正在載入會員資料...</p>
        </div>

        <template v-else-if="user">
            <section class="card account-profile-card mb-4">
                <div class="card-body p-4 p-md-5">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="account-avatar">
                            <Icon icon="mdi:account-circle-outline" />
                        </div>

                        <div>
                            <h2 class="h4 fw-bold mb-1">
                                {{ user.name || user.account || '會員' }}
                            </h2>

                            <span class="badge account-badge">
                                {{ user.role === 'ADMIN' ? '管理員' : '一般會員' }}
                            </span>
                        </div>
                    </div>

                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <div class="account-info">
                                <span class="account-label">會員編號</span>
                                <p class="mb-0">{{ user.usersId }}</p>
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <div class="account-info">
                                <span class="account-label">登入帳號</span>
                                <p class="mb-0">{{ user.account || '尚未設定' }}</p>
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <div class="account-info">
                                <span class="account-label">電子郵件</span>
                                <p class="mb-0 text-break">
                                    {{ user.email || '尚未設定' }}
                                </p>
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <div class="account-info">
                                <span class="account-label">帳號狀態</span>
                                <p class="mb-0">
                                    {{
                                        user.status === 'ACTIVE'
                                            ? '使用中'
                                            : user.status === 'INACTIVE'
                                                ? '已停用'
                                                : user.status
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- 帳號停用／重新啟用 -->
                    <div class="mt-4">
                        <button
                            v-if="user.status === 'ACTIVE'"
                            type="button"
                            class="btn account-deactivate-button"
                            :disabled="isDeactivating"
                            @click="deactivateAccount"
                        >
                            <span
                                v-if="isDeactivating"
                                class="spinner-border spinner-border-sm me-1"
                                aria-hidden="true"
                            ></span>

                            <Icon
                                v-else
                                icon="mdi:account-cancel-outline"
                                class="me-1"
                            />

                            {{ isDeactivating ? '處理中...' : '停用我的帳號' }}
                        </button>

                        <button
                            v-else-if="user.status === 'INACTIVE'"
                            type="button"
                            class="btn account-primary-button"
                            :disabled="isDeactivating"
                            @click="reactivateAccount"
                        >
                            <span
                                v-if="isDeactivating"
                                class="spinner-border spinner-border-sm me-1"
                                aria-hidden="true"
                            ></span>

                            <Icon
                                v-else
                                icon="mdi:account-check-outline"
                                class="me-1"
                            />

                            {{ isDeactivating ? '處理中...' : '重新啟用帳號' }}
                        </button>
                    </div>
                </div>
            </section>

            <section>
                <h2 class="h5 fw-bold mb-3">會員功能</h2>

                <div class="row g-3">
                    <div
                        v-for="item in accountLinks"
                        :key="item.to"
                        class="col-12 col-sm-6 col-lg-4"
                    >
                        <RouterLink
                            :to="item.to"
                            class="account-link-card"
                        >
                            <div class="account-link-icon">
                                <Icon :icon="item.icon" />
                            </div>

                            <div class="flex-grow-1">
                                <h3 class="h6 fw-bold mb-2">
                                    {{ item.title }}
                                </h3>

                                <p class="small text-secondary mb-0">
                                    {{ item.description }}
                                </p>
                            </div>

                            <Icon
                                icon="mdi:chevron-right"
                                class="account-chevron"
                            />
                        </RouterLink>
                    </div>
                </div>
            </section>
        </template>
        </div>

        <div v-else class="account-content">
            <aside class="account-sidebar">
                <h3 class="sidebar-title">會員功能</h3>

                <nav aria-label="會員中心選單" class="sidebar-menu">
                    <button
                        v-for="menu in accountMenus"
                        :key="menu.to"
                        type="button"
                        class="sidebar-item"
                        :class="{ active: isCurrentMenu(menu) }"
                        :disabled="isCurrentMenu(menu)"
                        :aria-current="isCurrentMenu(menu) ? 'page' : undefined"
                        @click="goToMenu(menu)"
                    >
                        <span class="sidebar-icon">
                            <Icon :icon="menu.icon" />
                        </span>

                        <span>{{ menu.label }}</span>
                    </button>
                </nav>
            </aside>

            <div class="account-panel">
                <RouterView />
            </div>
        </div>
    </div>
</template>

<style scoped>
.account-layout {
    width: min(1120px, calc(100% - 32px));
    margin: 0 auto;
    padding: 8px 0 40px;
}

.account-content {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
}

.account-sidebar,
.account-panel {
    min-width: 0;
    border: 1px solid #f4d9b9;
    border-radius: 16px;
    background: #fffdf9;
    padding: 20px;
}

.sidebar-title {
    margin: 0 0 16px;
    font-size: 1.05rem;
    font-weight: 700;
}

.sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: #344054;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
}

.sidebar-item:hover:not(:disabled) {
    background: #fff4dc;
}

.sidebar-item.active,
.sidebar-item:disabled {
    background: #fff0c2;
    border-color: #ffda8a;
    color: #805b16;
    font-weight: 700;
    cursor: default;
}

.sidebar-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.account-panel {
    min-height: 300px;
}

.account-eyebrow {
    color: #805b16;
    letter-spacing: 0.12em;
}

.account-profile-card {
    background: var(--c-card);
    border: 1px solid var(--c-border);
    border-radius: 1.25rem;
    box-shadow: var(--shadow-soft);
}

.account-avatar {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff0c9;
    color: #805b16;
    border-radius: 1rem;
    font-size: 2.5rem;
}

.account-badge {
    color: #805b16;
    background: #fff0c9;
}

.account-info {
    height: 100%;
    padding: 1rem;
    background: #fffaf1;
    border: 1px solid var(--c-border);
    border-radius: 0.75rem;
    overflow-wrap: anywhere;
}

.account-label {
    display: block;
    margin-bottom: 0.4rem;
    color: var(--c-muted);
    font-size: 0.875rem;
}

.account-primary-button {
    padding: 0.7rem 1.1rem;
    color: #292b35;
    background: #ffcf70;
    border: none;
    border-radius: 0.75rem;
    font-weight: 700;
}

.account-primary-button:hover:not(:disabled) {
    background: #f6bd50;
    color: #292b35;
}

.account-primary-button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.account-deactivate-button {
    padding: 0.7rem 1.1rem;
    color: #b42318;
    background: #fff;
    border: 1px solid #f0b8b4;
    border-radius: 0.75rem;
    font-weight: 700;
}

.account-deactivate-button:hover:not(:disabled) {
    color: #fff;
    background: #b42318;
    border-color: #b42318;
}

.account-deactivate-button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.account-link-card {
    height: 100%;
    min-height: 125px;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1.1rem;
    color: var(--c-ink);
    text-decoration: none;
    background: var(--c-card);
    border: 1px solid var(--c-border);
    border-radius: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

.account-link-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-soft);
}

.account-link-icon {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #805b16;
    background: #fff0c9;
    border-radius: 0.75rem;
    font-size: 1.5rem;
}

.account-chevron {
    flex-shrink: 0;
    color: var(--c-muted);
    font-size: 1.25rem;
}

@media (max-width: 768px) {
    .account-content {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .account-sidebar,
    .account-panel {
        padding: 16px;
    }

    .sidebar-menu {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .sidebar-item {
        padding: 10px;
        font-size: 0.9rem;
    }
}
</style>