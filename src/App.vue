<template>
  <v-app>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import { auth } from "@/firebase/firebase";

export default {
  data() {
    return {
      userData: null
    };
  },
  methods: {
    async signOut() {
      try {
        await auth.signOut(); // If using Firebase Auth
        localStorage.removeItem('user');
        this.userData = null;
        this.$router.push("/");
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }
  },
  async mounted() {
    // Fetch user data from local storage
    const user = localStorage.getItem('user');
    if (user) {
      this.userData = JSON.parse(user);
    }
  }
};
</script>

<style>
/* Add styles here */
</style>
