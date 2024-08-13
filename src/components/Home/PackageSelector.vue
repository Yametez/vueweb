<template>
  <v-container >
    <!-- Navbar -->
    <v-app-bar app color="white" elevation="1">
  <v-toolbar-title>USERS</v-toolbar-title>
  <v-spacer></v-spacer>
  <v-btn text>
    <v-icon>mdi-home</v-icon>
    <span class="ml-2">Home</span>
  </v-btn>

  <v-btn text>
    <v-icon>mdi-package-variant</v-icon>
    <span class="ml-2">Package</span>
  </v-btn>

  <v-btn text>
    <v-icon>mdi-information</v-icon>
    <span class="ml-2">About</span>
  </v-btn>

  <v-btn text>
    <v-icon>mdi-account</v-icon>
    <span class="ml-2">Profile</span>
  </v-btn>

  <v-btn text>
    <v-icon>mdi-email</v-icon>
    <span class="ml-2">Contact</span>
  </v-btn>

  <v-spacer></v-spacer>
  <!-- Profile button with avatar, dropdown, and arrow -->
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" text>
        <v-avatar size="32px">
          <img
        src="https://scontent.fbkk5-8.fna.fbcdn.net/v/t39.30808-6/452381742_1238737407293878_6528376753369380268_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=zk8fe4a3x3UQ7kNvgFrbwi1&_nc_ht=scontent.fbkk5-8.fna&oh=00_AYAtmJV6yqlXENz8lyEDGeIlDUdpRfsDZToZ6DURDVTiMg&oe=66A68134"
        alt="kim"
      >
        </v-avatar>
        <v-icon size="20px"> mdi-chevron-down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="logout">
        <v-list-item-icon>
          <v-icon>mdi-logout</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Log out</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</v-app-bar>



    <!-- Content -->
    <v-row class="mt-10">
      <v-col cols="12">
        <h1>Select Package</h1>
        <v-select :items="items" label="Select The Package"
      v-model="packages_type" 
      @input="filterData(packages_type)"
      >
      </v-select>
      </v-col>
      
      <v-col cols="12" md="4" v-for="(pkg, index) in filter" :key="index">
       
        <v-card >
          <v-card-title>{{ pkg.name }}</v-card-title>
     
          <v-card-subtitle>
            <div v-for="(line, lineIndex) in getDescription(pkg.description)" :key="lineIndex" class="d-flex align-center mb-2">
              
              <v-icon class="custom-icon mr-2" color="primary">{{ getIcon(pkg.description)[lineIndex] }}</v-icon>
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
      items: ['standard','vip','supervip'],
      packages_type:'',
      filter:[],
      IP: "https://ef6d-171-7-48-85.ngrok-free.app"
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
        this.filter = response.data;
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
    filterData (items){
      this.filter=[]
      this.packages.find(response => {
        console.log("filterdata",response);
        if(items === response.name ){
          console.log('check',items === response.name );
          this.filter.push(response)
        }
      }) 
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
.position-relative {
  position: relative;
}
.chevron-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(50%, 50%);
  background-color: white; /* Optional: to match background color */
}
</style>
