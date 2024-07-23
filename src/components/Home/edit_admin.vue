<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" class="primary darken-1">
      <v-list dense dark>
        <v-list-item @click="navigateTo('/edit_admin')" link>
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="navigateTo('/edit_users')" link>
          <v-list-item-icon>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>User List</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app elevation="4" class="secondary">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="white"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h5 font-weight-bold white--text">Admin Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-menu bottom right>
        <template #activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon color="white">mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="navigateTo('/profile')">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="signOut">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Sign Out</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="grey lighten-4">
      <v-container>
        <v-row>
          <v-col cols="12">
            <h1 class="display-1 font-weight-bold mb-4">PackageSelector (Preview)</h1>
            <v-btn color="primary" @click="openEditForm" class="mb-4">
              <v-icon left>mdi-pencil</v-icon>
              แก้ไข
            </v-btn>
          </v-col>
          <v-col cols="12" md="4" v-for="(pkg, index) in packages" :key="index">
            <v-card elevation="2" class="mb-4">
              <v-card-title class="headline">{{ pkg.name }}</v-card-title>
              <v-card-text>
                <div v-for="(line, lineIndex) in getDescription(pkg.description)" :key="lineIndex" class="d-flex align-center mb-2">
                  <v-icon class="custom-icon mr-2">{{ getIcon(pkg.description)[lineIndex] }}</v-icon>
                  {{ line }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="showEditForm">
          <v-col cols="12">
            <v-card>
              <v-card-title class="headline">แก้ไขแพ็กเกจ</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="updatePackage">
                  <v-select
                    v-model="selectedPackage"
                    :items="packages"
                    item-text="name"
                    item-value="name"
                    label="เลือกแพ็กเกจที่ต้องการแก้ไข"
                    @change="loadPackage"
                    required
                  ></v-select>
                  <v-text-field
                    v-model="editingPackage.name"
                    label="ชื่อแพ็กเกจ"
                    required
                  ></v-text-field>
                  <v-textarea
                    v-model="descriptionText"
                    label="รายละเอียดแพ็กเกจ"
                    hint="ถ้าขึ้นบรรทัดใหม่จะแสดงไอคอนในแต่ละบรรทัด"
                    required
                  ></v-textarea>
                  <v-btn type="submit" color="success" class="mr-4 mt-4">อัปเดต</v-btn>
                  <v-btn @click="cancelEdit" color="secondary" class="mt-4">ยกเลิก</v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      packages: [],
      selectedPackage: null,
      showEditForm: false,
      editingPackage: {
        id: null,
        name: "",
        description: []
      },
      descriptionText: "",
      drawer: false,
      IP: "https://06a6-58-8-14-234.ngrok-free.app"
    };
  },
  mounted() {
    this.fetchPackages();
  },
  methods: {
    async fetchPackages() {
      try {
        const response = await axios.get(`${this.IP}/package/get`);
        this.packages = response.data;
        this.packages.sort((a, b) => a.id - b.id);
        console.log("packages", response);
      } catch (error) {
        console.error("Error fetching packages:", error.message);
      }
    },
    getDescription(description) {
      try {
        const descObj = JSON.parse(description);
        return descObj.map(item => item.title);
      } catch (error) {
        console.error("Error parsing description:", error);
        return ["Description not available"];
      }
    },
    getIcon(description) {
      try {
        const descObj = JSON.parse(description);
        return descObj.map(item => item.icon);
      } catch (error) {
        console.error("Error parsing icon:", error);
        return [];
      }
    },
    openEditForm() {
      this.showEditForm = true;
    },
    loadPackage() {
      if (this.selectedPackage) {
        const pkg = this.packages.find(p => p.name === this.selectedPackage);
        if (pkg) {
          this.editingPackage = {
            id: pkg.id,
            name: pkg.name,
            description: JSON.parse(pkg.description)
          };
          this.descriptionText = this.editingPackage.description.map(item => item.title).join('\n');
        } else {
          console.error("Selected package not found");
        }
      }
    },
    async updatePackage() {
      if (this.selectedPackage) {
        try {
          const index = this.packages.findIndex(pkg => pkg.name === this.selectedPackage);
          if (index !== -1) {
            const updatedDescription = this.descriptionText.split('\n').map((title, i) => ({
              title,
              icon: this.editingPackage.description[i]?.icon || 'mdi-check-circle-outline'
            }));
            const updatedPackage = {
              ...this.editingPackage,
              description: JSON.stringify(updatedDescription)
            };
            
            const response = await axios.post(`${this.IP}/package/edit/${updatedPackage.id}`, updatedPackage);
            
            if (response.status === 200) {
              this.$set(this.packages, index, updatedPackage);
              
              this.showEditForm = false;
              this.selectedPackage = null;
              this.editingPackage = {
                id: null,
                name: "",
                description: []
              };
              this.descriptionText = "";
              
              alert('อัปเดตแพ็กเกจสำเร็จ');
              
              await this.fetchPackages();
            } else {
              throw new Error('การอัปเดตล้มเหลว');
            }
          } else {
            throw new Error('ไม่พบแพ็กเกจที่เลือก');
          }
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการอัปเดตแพ็กเกจ:', error.message);
          alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
      } else {
        alert('กรุณาเลือกแพ็กเกจที่ต้องการแก้ไข');
      }
    },
    cancelEdit() {
      this.showEditForm = false;
      this.selectedPackage = null;
      this.editingPackage = {
        id: null,
        name: "",
        description: []
      };
      this.descriptionText = "";
    },
    navigateTo(route) {
      this.$router.push(route);
    },
    signOut() {
      localStorage.removeItem('userName');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease-in-out;
}
.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.custom-icon {
  color: #FFFFFF;
  background-color: #1976D2;
  border-radius: 50%;
  padding: 2px;
}
.v-app-bar {
  backdrop-filter: blur(10px);
}
.v-toolbar-title {
  letter-spacing: 1px;
  text-transform: uppercase;
}
.v-navigation-drawer {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
