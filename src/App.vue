<template>
  <v-app>
    <v-app-bar app color="dark" dark>
      <v-img
        alt="icon1"
        class="shrink mr-2"
        contain
        src="./assets/w.png"
        transition="scale-transition"
        width="40"
      />
      <v-toolbar-title>LAB05 - Google Auth</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="user">
        <span class="mr-2">สวัสดีคุณ {{ user.displayName }} </span>
        <v-btn @click="signOut" color="red" dark>
          Sign Out
        </v-btn>
      </template>
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default {
  name: 'App',
  data() {
    return {
      user: null,
    };
  },
  methods: {
    signOut() {
      const auth = getAuth();
      signOut(auth).then(() => {
        console.log('User signed out');
        // ทำการเปลี่ยนเส้นทางหรือดำเนินการอื่นๆ หลังจากออกจากระบบสำเร็จ
        this.$router.push('*'); // เปลี่ยนเส้นทางไปยังหน้า login
      }).catch((error) => {
        console.error('Error signing out: ', error);
      });
    }
  },
  created() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.user = user;
    });
  }
};
</script>

<style>
/* เพิ่มสไตล์ที่ต้องการ */
</style>
