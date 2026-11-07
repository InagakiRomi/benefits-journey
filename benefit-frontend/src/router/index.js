import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import FrontLayout from '@/layouts/FrontLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminCrawlerView from '@/views/admin/crawler/AdminCrawlerView.vue'
import AdminCrawlerLogView from '@/views/admin/crawler/AdminCrawlerLogView.vue'
import AdminCinemaView from '@/views/admin/cinema-movie/AdminCinemaView.vue'
import AdminCinemaDetail from '@/views/admin/cinema-movie/AdminCinemaDetail.vue'
import AdminCinemaForm from '@/views/admin/cinema-movie/AdminCinemaForm.vue'
import AdminMovieView from '@/views/admin/cinema-movie/AdminMovieView.vue'
import AdminMovieDetail from '@/views/admin/cinema-movie/AdminMovieDetail.vue'
import AdminMovieForm from '@/views/admin/cinema-movie/AdminMovieForm.vue'
import AdminCrawlerReviewView from '@/views/admin/cinema-movie/AdminCrawlerReviewView.vue'
import AdminBenefitReportView from '@/views/admin/benefit/AdminBenefitReportView.vue'
import AdminBenefitView from '@/views/admin/benefit/AdminBenefitView.vue'
import AdminInventoryReportView from '@/views/admin/benefit/AdminInventoryReportView.vue'
import AdminExcelExportView from '@/views/admin/excel/AdminExcelExportView.vue'
import BenefitView from '@/views/benefit/BenefitView.vue'
import BenefitDetailView from '@/views/benefit/BenefitDetailView.vue'
import CollectionView from '@/views/benefit/CollectionView.vue'
import MyReportView from '@/views/benefit/MyReportView.vue'
import BenefitReportFormView from '@/views/benefit/BenefitReportFormView.vue'
import CalendarView from '@/views/calendar/CalendarView.vue'
import ReminderView from '@/views/calendar/ReminderView.vue'
import RankingView from '@/views/ranking/RankingView.vue'
import CinemaView from '@/views/cinema-movie/CinemaView.vue'
import MapView from '@/views/map/MapView.vue'
import MovieView from '@/views/cinema-movie/MovieView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import AccountHomeView from '@/views/account/AccountHomeView.vue'
import AccountProfileView from '@/views/account/AccountProfileView.vue'
import AccountBenefitsView from '@/views/account/AccountBenefitsView.vue'
import AccountFeedbackView from '@/views/account/AccountFeedbackView.vue'
import AdminUsersView from '@/views/admin/member/AdminUsersView.vue'
import AdminLoginLogsView from '@/views/admin/member/AdminLoginLogsView.vue'
import AdminFeedbackView from '@/views/admin/member/AdminFeedbackView.vue'
import MessageInboxView from '@/views/messages/MessageInboxView.vue'
import MessageConversationView from '@/views/messages/MessageConversationView.vue'
import ExchangeView from '@/views/exchange/ExchangeView.vue'
import ExchangeMyFavoritesView from '@/views/exchange/ExchangeMyFavoritesView.vue'
import ExchangeMyListingsView from '@/views/exchange/ExchangeMyListingsView.vue'
import MemberPublicView from '@/views/member/MemberPublicView.vue'


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
          component: MemberPublicView,
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
