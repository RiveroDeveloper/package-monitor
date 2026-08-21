<script setup lang="ts">
// External imports
import axios from 'axios';
import { onMounted, ref } from 'vue';

// Internal imports
import type { Role, UserInterface } from '@/interfaces/UserInterface';
import type { UpdateUserDTO } from '@/dtos/users/UpdateUserDTO';
import { UserService } from '@/services/UserService';

const users = ref<UserInterface[]>([]);
const isLoading = ref<boolean>(true);
const errorMessage = ref<string>('');

const editingUserId = ref<string | null>(null);
const editName = ref<string>('');
const editEmail = ref<string>('');
const editRole = ref<Role>('User');
const editAvatarUrl = ref<string>('');

async function refreshUsers(): Promise<void> {
  users.value = await UserService.getAll();
}

function startEdit(user: UserInterface): void {
  editingUserId.value = user.id;
  editName.value = user.name;
  editEmail.value = user.email;
  editRole.value = user.role;
  editAvatarUrl.value = user.avatarUrl ?? '';
  errorMessage.value = '';
}

async function saveEdit(userId: string): Promise<void> {
  errorMessage.value = '';
  const payload: UpdateUserDTO = {
    name: editName.value,
    email: editEmail.value,
    role: editRole.value,
  };
  if (editAvatarUrl.value) payload.avatarUrl = editAvatarUrl.value;

  try {
    await UserService.update(userId, payload);
    await refreshUsers();
    editingUserId.value = null;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const data = err.response.data as { message?: string | string[] };
      errorMessage.value = Array.isArray(data.message)
        ? data.message.join(' ')
        : (data.message ?? 'Unable to update user.');
    } else {
      errorMessage.value = 'Unable to update user.';
    }
  }
}

async function deleteUser(userId: string): Promise<void> {
  await UserService.delete(userId);
  await refreshUsers();
}

onMounted(async () => {
  try {
    await refreshUsers();
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section v-if="!isLoading" class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-body">
          Admin User Management
        </h1>
        <p class="text-soft mt-1">
          Manage system users, roles, and account access.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 rounded-xl border border-wire bg-panel">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-soft text-sm">Total Users</p>
            <h3 class="text-3xl font-bold mt-1 text-body">{{ users.length }}</h3>
          </div>
          <div class="p-2 bg-users-icon/20 rounded-lg text-users-icon">
            <span class="material-symbols-outlined">groups</span>
          </div>
        </div>
      </div>
      <div class="p-6 rounded-xl border border-wire bg-panel">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-soft text-sm">Admins</p>
            <h3 class="text-3xl font-bold mt-1 text-body">
              {{ users.filter((u) => u.role === 'Admin').length }}
            </h3>
          </div>
          <div class="p-2 bg-primary/20 rounded-lg text-primary">
            <span class="material-symbols-outlined">shield_person</span>
          </div>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="text-rose-400 text-sm font-medium">
      {{ errorMessage }}
    </p>

    <div class="bg-panel border border-wire rounded-xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-sheet text-faded text-xs uppercase font-bold">
          <tr>
            <th class="px-6 py-4">User</th>
            <th class="px-6 py-4">Role</th>
            <th class="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-wire-subtle">
          <template v-for="user in users" :key="user.id">
            <tr class="hover:bg-sheet/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="user.avatarUrl"
                    :src="user.avatarUrl"
                    :alt="user.name"
                    class="size-10 rounded-full object-cover bg-primary/20"
                  />
                  <div
                    v-else
                    class="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"
                  >
                    <span class="material-symbols-outlined text-sm">person</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-body">{{ user.name }}</p>
                    <p class="text-xs text-faded">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-xs font-bold text-primary">
                {{ user.role }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-panel border border-wire text-soft hover:bg-sheet"
                    title="Edit user"
                    @click="startEdit(user)"
                  >
                    <span class="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    title="Delete user"
                    @click="deleteUser(user.id)"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="editingUserId === user.id">
              <td colspan="3" class="px-6 py-0">
                <div class="py-4 space-y-3 border-t border-primary/20">
                  <h4 class="text-sm font-bold text-body">Edit User</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-soft mb-1">Name</label>
                      <input
                        v-model="editName"
                        type="text"
                        class="w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-soft mb-1">Email</label>
                      <input
                        v-model="editEmail"
                        type="email"
                        class="w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-soft mb-1">Role</label>
                      <select
                        v-model="editRole"
                        class="select-control w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                      </select>
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-xs font-semibold text-soft mb-1">Avatar URL</label>
                      <input
                        v-model="editAvatarUrl"
                        type="url"
                        class="w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="https://i.pravatar.cc/150?u=email"
                      />
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <button
                      class="bg-primary font-bold py-2 px-5 rounded-lg text-sm hover:bg-primary-dark transition-all"
                      @click="saveEdit(user.id)"
                    >
                      Save
                    </button>
                    <button
                      class="bg-panel border border-wire text-soft font-bold py-2 px-5 rounded-lg text-sm hover:bg-sheet transition-all"
                      @click="editingUserId = null"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>

  <section v-else class="flex items-center justify-center py-20">
    <p class="text-soft">Loading users...</p>
  </section>
</template>
