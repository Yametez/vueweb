<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-slide-y-transition>
      <v-card class="pa-5 elevation-10" max-width="400" elevation="3">
        <v-overlay :value="loading" :opacity="0.8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </v-overlay>

        <v-card-title class="text-center">
          {{ isRegistering ? "Register" : "Login" }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="checklogin">
            <v-text-field
              v-model="username"
              label="Username"
              outlined
              prepend-icon="mdi-account"
              dense
              required
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              outlined
              prepend-icon="mdi-lock"
              dense
              required
            ></v-text-field>

            <v-text-field
              v-if="isRegistering"
              v-model="firstName"
              label="First Name"
              outlined
              prepend-icon="mdi-account"
              dense
              required
            ></v-text-field>

            <v-text-field
              v-if="isRegistering"
              v-model="lastName"
              label="Last Name"
              outlined
              prepend-icon="mdi-account"
              dense
              required
            ></v-text-field>

            <v-text-field
              v-if="isRegistering"
              v-model="phone"
              label="Phone"
              outlined
              prepend-icon="mdi-phone"
              dense
              required
            ></v-text-field>

            <v-text-field
              v-if="isRegistering"
              v-model="email"
              label="Email"
              outlined
              prepend-icon="mdi-email"
              dense
              required
            ></v-text-field>

            <v-btn
              type="submit"
              color="primary"
              class="mx-auto mt-4 font-weight-bold"
              block
              rounded
              elevation="3"
              :loading="loading"
            >
              {{ isRegistering ? "Register" : "Login" }}
            </v-btn>
            <v-btn
              @click="toggleRegister"
              color="secondary"
              class="mx-auto mt-4"
              block
              rounded
              outlined
            >
              {{ isRegistering ? "Switch to Login" : "Register" }}
            </v-btn>
          </v-form>

          <div class="my-4 d-flex align-center">
            <v-divider></v-divider>
            <span class="mx-2 grey--text text--darken-1">OR</span>
            <v-divider></v-divider>
          </div>

          <v-btn
            @click="signInWithGoogle"
            color="white"
            class="mx-auto mt-4 google-btn"
            block
            rounded
            elevation="2"
          >
            <v-img
              src="@/assets/search.png"
              max-height="24"
              max-width="24"
              contain
              class="mr-2"
            ></v-img>
            Sign in with Google
          </v-btn>
        </v-card-text>

        <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
          {{ snackbarMessage }}
          <template v-slot:action="{ attrs, on }">
            <v-btn
              color="white"
              text
              v-bind="attrs"
              v-on="on"
              @click="snackbar = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </v-card>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
import axios from "axios";
import { auth, db } from "@/firebase/firebase";
import { GoogleAuthProvider } from "firebase/auth";

// Function to fetch CSRF Token from cookies (if stored there)
function getCsrfToken() {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_access_token"))
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
      IP: "https://ef6d-171-7-48-85.ngrok-free.app"
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
        this.showSnackbar("Login successful.", "success");
        this.fetchPackages();

        localStorage.setItem("user", JSON.stringify(this.userData));

        this.$router.push("/PackageSelector");
      } catch (error) {
        console.error(error);
        this.showSnackbar("An error occurred during Google login.", "error");
      } finally {
        this.loading = false;
      }
    },
    async getUserData(uid) {
      try {
        const snapshot = await db.ref("users/" + uid).once("value");
        this.userData = snapshot.val();
        this.user = snapshot.val();
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    async login() {
      this.loading = true;

      if (!this.username || !this.password) {
        this.showSnackbar("Please enter both username and password.", "error");
        this.loading = false;
        return;
      }

      try {
        const response = await axios.post(
          this.IP + "/api/login",
          {
            userName: this.username,
            passwd: this.password,
          },
          {
            headers: {
              "X-CSRFToken": getCsrfToken(),
            },
          }
        );
        console.log('status ',response.status)
        console.log('data ',response.data)
        console.log('user',response.data.user)

        if (response.status === 200 && response.data && response.data.userName) {
          this.userData = response.data.user;
          const role = response.data.role;
          this.showSnackbar("Login successful.", "success");
          this.fetchPackages();

          localStorage.setItem("user", JSON.stringify(this.userData));

          if (role === "admin") {
            this.$router.push("/edit_package");
          } else {
            this.$router.push("/PackageSelector");
          }
        } else {
          this.showSnackbar("Invalid username or password.", "error");
        }
      } catch (error) {
        console.error(error);
        this.showSnackbar("An error occurred during login.", "error");
      } finally {
        this.loading = false;
      }
    },
    async register() {
  this.loading = true;

  if (
    !this.username ||
    !this.password ||
    !this.firstName ||
    !this.lastName ||
    !this.phone ||
    !this.email
  ) {
    this.showSnackbar("Please fill in all required fields.", "error");
    this.loading = false;
    return;
  }

  try {
    const response = await axios.post(
      this.IP + "/api/register",
      {
        userName: this.username,
        passwd: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        email: this.email,
      },
      {
        headers: {
          "X-CSRFToken": getCsrfToken(),
        },
      }
    );

    if (response.data.status) {
      this.showSnackbar(response.data.message, "success");
      // ทำการล็อกอินหลังจากลงทะเบียนสำเร็จ
      await this.login();
    } else {
      this.showSnackbar(response.data.message, "error");
    }
  } catch (error) {
    console.error(error);
    this.showSnackbar("An error occurred during registration.", "error");
  } finally {
    this.loading = false;
  }
},
    async fetchPackages() {
      try {
        const response = await axios.get(this.IP + "/package/get");

        if (response.status === 200 && response.data) {
          this.packages = response.data.packages;
        }
      } catch (error) {
        console.error(error);
      }
    },
    checklogin() {
      if (this.isRegistering) {
        this.register();
      } else {
        this.login();
      }
    },
    toggleRegister() {
      this.isRegistering = !this.isRegistering;
    },
    showSnackbar(message, color) {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.google-btn {
  background-color: #fff;
  color: #757575;
  border: 1px solid #e0e0e0;
}
</style>
