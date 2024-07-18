<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Select a Package</h1>
      </v-col>
      <v-col cols="12" md="4" v-for="(pkg, index) in packages" :key="index">
        <v-card @click="selectPackage(pkg)">
          <v-card-title>{{ pkg.name }}</v-card-title>
          <v-card-subtitle>

            <v-icon>{{ getIcon(pkg.description) }}</v-icon
            >{{ getDescription(pkg.description) }}</v-card-subtitle
          >
          
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
      IP:"https://ab66-2001-fb1-3a-7e10-6138-b2b0-a0f0-5d9a.ngrok-free.app/"
    };
  },
  mounted() {
    this.fetchPackages();
  },
  methods: {
    async fetchPackages() {
      try {
        // const response = await axios.get("https://e471-58-8-14-234.ngrok-free.app/package/get");
        axios.get(this.IP+"/package/get").then(response => {
          this.packages = response.data;
          console.log("packages",response);
        })
        
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
        return descObj.map((item) => item.title).join(", "); // นำข้อมูลมาแสดงเป็น string ตามต้องการ
      } catch (error) {
        console.error("Error parsing description:", error);
        return "Description not available";
      }
    },
    getIcon(description) {
      try {
        console.log(description);
        const descObj = JSON.parse(description); // แปลง JSON เป็น Object
        return descObj.map((item) => item.icon).join(", "); // นำข้อมูล icon มาแสดงเป็น string ตามต้องการ
      } catch (error) {
        console.error("Error parsing icon:", error);
        return ""; 
      }
    },
  },
};
</script>

<style scoped>
v-card {
  cursor: pointer;
  margin-bottom: 16px;
}
</style>
