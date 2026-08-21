// External imports
import { createRouter, createWebHistory } from 'vue-router';

// Internal imports
import DashboardView from '@/views/home/DashboardView.vue';
import HomeView from '@/views/home/HomeView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import PackagesIndexView from '@/views/packages/PackagesIndexView.vue';
import PackagesShowView from '@/views/packages/PackagesShowView.vue';
import AdminPackagesView from '@/views/admin/packages/PackagesAdminView.vue';
import AdminWarehousesView from '@/views/admin/warehouses/WarehousesAdminView.vue';
import AdminUsersView from '@/views/admin/users/UsersAdminView.vue';
import SignUpView from '@/views/auth/SignupView.vue';
import UsersIndexView from '@/views/users/UsersIndexView.vue';
import WarehousesIndexView from '@/views/warehouses/WarehousesIndexView.vue';
import { useAuthStore } from '@/stores/authstore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Sign In', guestOnly: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
      meta: { title: 'Sign Up', guestOnly: true },
    },

    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Dashboard', requiresAuth: true },
    },

    {
      path: '/packages',
      name: 'packages',
      component: PackagesIndexView,
      meta: { title: 'Packages', requiresAuth: true },
    },
    {
      path: '/packages/:id',
      name: 'packages.show',
      component: PackagesShowView,
      meta: { title: 'Package Details', requiresAuth: true },
    },

    {
      path: '/warehouses',
      name: 'warehouses',
      component: WarehousesIndexView,
      meta: { title: 'Warehouses', requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersIndexView,
      meta: { title: 'Users', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/packages',
      name: 'admin.packages',
      component: AdminPackagesView,
      meta: { title: 'Admin Packages', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/warehouses',
      name: 'admin.warehouses',
      component: AdminWarehousesView,
      meta: { title: 'Admin Warehouses', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users',
      name: 'admin.users',
      component: AdminUsersView,
      meta: { title: 'Admin Users', requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // If the auth store has a token but no hydrated user yet, try to hydrate.
  if (authStore.token && !authStore.currentUser) {
    await authStore.loadCurrentUser();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'dashboard' };
  }
});

export default router;
