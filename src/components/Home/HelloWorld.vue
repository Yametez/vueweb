<template>
  <v-card class="pa-5 mx-auto mt-10" max-width="400">
    <v-overlay :value="loading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>
    <div v-if="!userData && !loading">
      <v-card-title class="text-center">{{ isRegistering ? 'Register' : 'Login' }}</v-card-title>
      <v-form @submit.prevent="checklogin">
        <v-text-field v-model="username" label="Username" outlined></v-text-field>
        <v-text-field v-model="password" label="Password" type="password" outlined></v-text-field>
        <v-text-field v-if="isRegistering" v-model="firstName" label="First Name" outlined></v-text-field>
        <v-text-field v-if="isRegistering" v-model="lastName" label="Last Name" outlined></v-text-field>
        <v-text-field v-if="isRegistering" v-model="phone" label="Phone" outlined></v-text-field>
        <v-text-field v-if="isRegistering" v-model="email" label="Email" outlined></v-text-field>
        <v-btn type="submit" color="primary" class="mx-auto mt-4" block>
          {{ isRegistering ? 'Register' : 'Login' }}
        </v-btn>
      </v-form>
      <v-btn @click="toggleRegister" color="primary" dark class="mx-auto mt-4" style="width: 100%;">
        {{ isRegistering ? 'Switch to Login' : 'Register' }}
      </v-btn>
      <v-btn @click="signInWithGoogle" color="white" dark class="mx-auto mt-4" style="width: 100%;">
        <v-img>
          <img src="@/assets/search.png" alt="Search Icon" width="24">
        </v-img>
      </v-btn>
    </div>
    <div v-else>
      <span v-if="userData.displayName">{{ userData.displayName }}</span>
      <span v-else>{{ userData.username }}</span>
      <span class="mr-2"></span>
      <v-btn @click="signOut" color="red" dark>
        Sign Out
      </v-btn>
    </div>
    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs, on }">
        <v-btn color="white" text v-bind="attrs" v-on="on" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import axios from "axios";
import { auth, db } from "@/firebase/firebase";
import { GoogleAuthProvider } from "firebase/auth";

// Function to fetch CSRF Token from cookies (if stored there)
function getCsrfToken() {
  const csrfToken = document.cookie
    .split("; ")
    .find(row => row.startsWith("csrf_access_token"))
    ?.split("=")[1];

  return csrfToken;
}

export default {
  data() {
    return {
      email: "",
      password: "",
      username: "",
      firstName: "",
      lastName: "",
      phone: "",
      userData: null,
      snackbar: false,
      snackbarMessage: "",
      snackbarColor: "success",
      loading: false,
      isRegistering: false,
      packages: [],
      user: null,
            IP: "https://ab66-2001-fb1-3a-7e10-6138-b2b0-a0f0-5d9a.ngrok-free.app/",
      // IP: "http://localhost:5000"
    };
  },
  methods: {
    async signInWithGoogle() {
      this.loading = true;
      const provider = new GoogleAuthProvider();
      try {
        const result = await auth.signInWithPopup(provider);
        await db.ref("users/" + result.user.uid).set({
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        });

        this.getUserData(result.user.uid);
        this.showSnackbar("Login successful.");
        this.fetchPackages();

        // Redirect to PackageSelector.vue after successful login
        this.$router.push("/PackageSelector");
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async getUserData(uid) {
      try {
        const snapshot = await db.ref("users/" + uid).once("value");
        this.userData = snapshot.val();
        this.user = snapshot.val(); // Set user variable upon successful login
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    async login() {
      this.loading = true;

      try {
        const response = await axios.post(this.IP+'/api/login', {
          userName: this.username,
          passwd: this.password
        }, {
          headers: {
            'X-CSRFToken': getCsrfToken()
          }
        });

        if (response.status === 200) {
          this.userData = response.data;
          this.showSnackbar('Login successful.');
          this.fetchPackages();

          // Redirect to PackageSelector.vue after successful login
          this.$router.push('/PackageSelector');
        } else {
          this.showSnackbar('Invalid username or password.');
        }
      } catch (error) {
        console.error('Error signing in:', error);
        this.showSnackbar('Invalid username or password.');
      } finally {
        this.loading = false;
      }
    },
    async register() {
      this.loading = true;

      try {
        const response = await axios.post(this.IP+'/api/register', {
          username: this.username,
          email: this.email,
          passwd: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
          phone: this.phone
        });

        if (response.status === 200) {
          await db.ref('users/' + response.data.user_id).set({
            username: this.username,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            phone: this.phone,
            record_status: 'N'
          });

          this.userData = {
            username: this.username,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            phone: this.phone,
            user_id: response.data.user_id
          };
          this.showSnackbar('Registration successful.');
          this.isRegistering = false;
          this.fetchPackages();

          // Redirect to PackageSelector.vue after successful registration
          this.$router.push('/PackageSelector');
        } else {
          this.showSnackbar('Failed to register.');
        }
      } catch (error) {
        console.error('Error registering:', error);
        this.showSnackbar('Failed to register.');
      } finally {
        this.loading = false;
      }
    },
    async fetchPackages() {
      try {
        const response = await axios.get(this.IP+"/package/get",);
        this.packages = response.data;
        console.log('respone',response)
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    },
    toggleRegister() {
      this.isRegistering = !this.isRegistering;
    },
    showSnackbar(message) {
      this.snackbarMessage = message;
      this.snackbar = true;
    },
    checklogin() {
      if (this.isRegistering) {
        this.register();
      } else {
        this.login();
      }
    },
    async signOut() {
      // Sign out logic for both Firebase and local auth
      await auth.signOut();
      this.userData = null;
      this.user = null;
      this.showSnackbar("Sign out successful.");
      this.$router.push("/login");
    }
  },
};
</script>

<style scoped>
.ml-4 {
  margin-left: 16px;
}
</style>
