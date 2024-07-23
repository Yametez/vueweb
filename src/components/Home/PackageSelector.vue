<template>
  <v-container >
    <!-- Navbar -->
    <v-app-bar app color="white">
      <v-toolbar-title>GETPACKAGE</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="goToHomePage" text>
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn @click="logout" text>
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Content -->
    <v-row>
      <v-col cols="12">
        <h1>Please Select Package</h1>
      </v-col>
      <v-col cols="12" md="4" v-for="(pkg, index) in packages" :key="index">
        <v-card @click="selectPackage(pkg)">
          <v-card-title>{{ pkg.name }}</v-card-title>
          <v-card-subtitle>
            <div v-for="(line, lineIndex) in getDescription(pkg.description)" :key="lineIndex" class="d-flex align-center mb-2">
              <v-icon class="custom-icon mr-2">{{ getIcon(pkg.description)[lineIndex] }}</v-icon>
              {{ line }}
            </div>
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      packages: [],
      selectedPackages: [],
      IP: "https://06a6-58-8-14-234.ngrok-free.app"
    };
  },
  mounted() {
    this.fetchPackages();
  },
  methods: {
    async fetchPackages() {
      try {
        const response = await axios.get(this.IP + "/package/get");
        this.packages = response.data;
        this.packages.sort((a, b) => a.id - b.id);

        console.log("packages", response);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    },
    selectPackage(pkg) {
      if (this.selectedPackages.includes(pkg)) {
        this.selectedPackages = this.selectedPackages.filter((p) => p !== pkg);
      } else if (this.selectedPackages.length < 3) {
        this.selectedPackages.push(pkg);
      }
    },
    getDescription(description) {
      try {
        const descObj = JSON.parse(description); // แปลง JSON เป็น Object
        return descObj.map((item) => item.title); // นำข้อมูลมาแสดงเป็น array ของ titles
      } catch (error) {
        console.error("Error parsing description:", error);
        return ["Description not available"];
      }
    },
    getIcon(description) {
      try {
        const descObj = JSON.parse(description); // แปลง JSON เป็น Object
        return descObj.map((item) => item.icon); // นำข้อมูล icon มาแสดงเป็น array ของ icons
      } catch (error) {
        console.error("Error parsing icon:", error);
        return [];
      }
    },
    goToHomePage() {
      this.$router.push({ name: 'Home' }); // เปลี่ยนเส้นทางไปยังหน้า Home
    },
    logout() {
      // Implement logout logic here
      console.log('Logout');
      // เช่น: this.$firebase.auth().signOut();
      this.$router.push('/'); // เปลี่ยนเส้นทางไปยังหน้า root (/) หลังออกจากระบบ
    }
  }
};
</script>

<style scoped>
v-card {
  cursor: pointer;
  margin-bottom: 16px;
}
.custom-icon {
  color: #FFFFFF;
  background-color: #1976D2; /* สีฟ้าของ Vuetify primary color */
  border-radius: 50%;
  padding: 2px;
}
</style>
