import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import FrontLayout from '@/layouts/FrontLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const AdminCrawlerView = () => import('@/views/admin/crawler/AdminCrawlerView.vue')
const AdminCrawlerLogView = () => import('@/views/admin/crawler/AdminCrawlerLogView.vue')
const AdminCinemaView = () => import('@/views/admin/cinema-movie/AdminCinemaView.vue')
const AdminCinemaDetail = () => import('@/views/admin/cinema-movie/AdminCinemaDetail.vue')
const AdminCinemaForm = () => import('@/views/admin/cinema-movie/AdminCinemaForm.vue')
const AdminMovieView = () => import('@/views/admin/cinema-movie/AdminMovieView.vue')
const AdminMovieDetail = () => import('@/views/admin/cinema-movie/AdminMovieDetail.vue')
const AdminMovieForm = () => import('@/views/admin/cinema-movie/AdminMovieForm.vue')
const AdminCrawlerReviewView = () => import('@/views/admin/cinema-movie/AdminCrawlerReviewView.vue')
const AdminBenefitReportView = () => import('@/views/admin/benefit/AdminBenefitReportView.vue')
const AdminBenefitView = () => import('@/views/admin/benefit/AdminBenefitView.vue')
const AdminInventoryReportView = () => import('@/views/admin/benefit/AdminInventoryReportView.vue')
const AdminExcelExportView = () => import('@/views/admin/excel/AdminExcelExportView.vue')
const BenefitView = () => import('@/views/benefit/BenefitView.vue')
const BenefitDetailView = () => import('@/views/benefit/BenefitDetailView.vue')
const CollectionView = () => import('@/views/benefit/CollectionView.vue')
const MyReportView = () => import('@/views/benefit/MyReportView.vue')
const BenefitReportFormView = () => import('@/views/benefit/BenefitReportFormView.vue')
const CalendarView = () => import('@/views/calendar/CalendarView.vue')
const ReminderView = () => import('@/views/calendar/ReminderView.vue')
const RankingView = () => import('@/views/ranking/RankingView.vue')
const CinemaView = () => import('@/views/cinema-movie/CinemaView.vue')
const MapView = () => import('@/views/map/MapView.vue')
const MovieView = () => import('@/views/cinema-movie/MovieView.vue')
const LoginView = () => import('@/views/auth/LoginView.vue')
const RegisterView = () => import('@/views/auth/RegisterView.vue')
const ForgotPasswordView = () => import('@/views/auth/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/auth/ResetPasswordView.vue')
const AccountHomeView = () => import('@/views/account/AccountHomeView.vue')
const AccountProfileView = () => import('@/views/account/AccountProfileView.vue')
const AccountBenefitsView = () => import('@/views/account/AccountBenefitsView.vue')
const AccountFeedbackView = () => import('@/views/account/AccountFeedbackView.vue')
const AdminUsersView = () => import('@/views/admin/member/AdminUsersView.vue')
const AdminLoginLogsView = () => import('@/views/admin/member/AdminLoginLogsView.vue')
const AdminFeedbackView = () => import('@/views/admin/member/AdminFeedbackView.vue')
const MessageInboxView = () => import('@/views/messages/MessageInboxView.vue')
const MessageConversationView = () => import('@/views/messages/MessageConversationView.vue')
const ExchangeView = () => import('@/views/exchange/ExchangeView.vue')
const ExchangeMyFavoritesView = () => import('@/views/exchange/ExchangeMyFavoritesView.vue')
const ExchangeMyListingsView = () => import('@/views/exchange/ExchangeMyListingsView.vue')


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 會員認證：獨立頁面，不套用 FrontLayout 或 AdminLayout
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },
    {
      path: '/',
      component: FrontLayout,
      children: [
        {
          path: '',
          redirect: '/map',
        },
        {
          path: 'benefits',
          name: 'benefits',
          component: BenefitView,
        },
        {
          path: 'benefits/:id',
          name: 'benefit-detail',
          component: BenefitDetailView,
        },
        {
          path: 'collection',
          name: 'collection',
          component: CollectionView
        },
        {
          path: 'my-reports',
          name: 'my-reports',
          component: MyReportView,
          meta: { requiresAuth: true },
        },
        {
          path: 'report-benefit',
          name: 'report-benefit',
          component: BenefitReportFormView,
          meta: { requiresAuth: true },
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: CalendarView,
        },
        {
          path: 'reminders',
          name: 'reminders',
          component: ReminderView,
          meta: { requiresAuth: true },
        },
        {
          path: 'ranking',
          name: 'ranking',
          component: RankingView,
        },
        {
          path: 'movies',
          name: 'movies',
          component: MovieView,
        },
        {
          path: 'cinemas',
          name: 'cinemas',
          component: CinemaView,
        },
        {
          path: 'map',
          name: 'map',
          component: MapView,
        },
        {
          path: 'members/:id',
          name: 'member-public',
          component: () => import('@/views/member/MemberPublicView.vue'),
        },
        {
          path: 'exchange',
          name: 'exchange',
          component: ExchangeView,
        },
        {
          path: 'ticket',
          name: 'ticket',
          component: ExchangeView,
        },
        {
          path: 'account',
          component: AccountHomeView,
          meta: { requiresAuth: true },
          children: [
            {
              path: '',
              name: 'account-home',
              component: { render: () => null },
              meta: { requiresAuth: true },
            },
            {
              path: 'profile',
              name: 'account-profile',
              component: AccountProfileView,
              meta: { requiresAuth: true },
            },
            {
              path: 'benefits',
              name: 'account-benefits',
              component: AccountBenefitsView,
              meta: { requiresAuth: true },
            },
            {
              path: 'listings',
              name: 'account-listings',
              component: ExchangeMyListingsView,
              meta: { requiresAuth: true },
            },
            {
              path: 'favorites',
              name: 'account-favorites',
              component: ExchangeMyFavoritesView,
              meta: { requiresAuth: true },
            },
            {
              path: 'feedback',
              name: 'account-feedback',
              component: AccountFeedbackView,
              meta: { requiresAuth: true },
            },
            {
              path: 'messages',
              name: 'account-messages',
              component: MessageInboxView,
              meta: { requiresAuth: true },
            },
            {
              path: 'messages/:conversationId',
              name: 'message-conversation',
              component: MessageConversationView,
              meta: { requiresAuth: true },
            },
          ],
        },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      redirect: '/admin/crawler',
      children: [
        {
          path: 'benefit-reports',
          name: 'admin-benefit-reports',
          component: AdminBenefitReportView
        },
        {
          path: 'benefits',
          name: 'admin-benefits',
          component: AdminBenefitView
        },
        {
          path: 'inventory-reports',
          name: 'admin-inventory-reports',
          component: AdminInventoryReportView
        },
        {
          path: 'users',
          name: 'admin-users',
          component: AdminUsersView,
        },
        {
          path: 'login-logs',
          name: 'admin-login-logs',
          component: AdminLoginLogsView,
        },
        {
          path: 'feedback',
          name: 'admin-feedback',
          component: AdminFeedbackView,
        },
        {
          path: 'crawler',
          name: 'admin-crawler',
          component: AdminCrawlerView,
        },
        {
          path: 'crawler-logs',
          name: 'admin-crawler-logs',
          component: AdminCrawlerLogView,
        },
        {
          path: 'cinemas-movies/reviews',
          name: 'admin-reviews',
          component: AdminCrawlerReviewView,
        },
        {
          path: 'cinemas-movies/reviews/:id',
          redirect: { name: 'admin-reviews' },
        },
        {
          path: 'cinemas',
          name: 'admin-cinemas',
          component: AdminCinemaView,
        },
        {
          path: 'cinemas/new',
          name: 'admin-cinema-create',
          component: AdminCinemaForm,
        },
        {
          path: 'cinemas/:id',
          name: 'admin-cinema-detail',
          component: AdminCinemaDetail,
        },
        {
          path: 'cinemas/:id/edit',
          redirect: (to) => ({ name: 'admin-cinema-detail', params: { id: to.params.id } }),
        },
        {
          path: 'movies',
          name: 'admin-movies',
          component: AdminMovieView,
        },
        {
          path: 'movies/new',
          name: 'admin-movie-create',
          component: AdminMovieForm,
        },
        {
          path: 'movies/:id',
          name: 'admin-movie-detail',
          component: AdminMovieDetail,
        },
        {
          path: 'movies/:id/edit',
          redirect: (to) => ({ name: 'admin-movie-detail', params: { id: to.params.id } }),
        },
        {
          path: 'excel',
          name: 'admin-excel',
          component: AdminExcelExportView,
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuth()

  // 每次切換路由時，重新讀取最新的登入資訊
  auth.refreshAuth()

  // 管理後台：必須登入，而且是啟用中的管理員
  if (to.matched.some((record) => record.path === '/admin')) {
    if (!auth.isLoggedIn.value) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }

    if (!auth.isAdmin.value) {
      return { name: 'map' }
    }
  }

  // 其他需要登入的頁面
  if (to.meta.requiresAuth && !auth.isLoggedIn.value) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  return true
})

export default router
