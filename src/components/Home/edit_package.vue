<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" class="primary darken-1">
      <v-list dense dark>
        <v-list-item link>
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

    <v-main class="grey lighten-5">
      <v-container>
        <v-row>
          <v-col cols="12">
            <h1 class="display-1 font-weight-bold mb-4">Select to Edit For PackageSelector</h1>
          </v-col>
          <v-col cols="12" md="4" v-for="(pkg, index) in packages" :key="index">
            <v-card elevation="2" class="mb-4" @click="editPackage(pkg)">
              <v-card-title class="headline">{{ pkg.name }}</v-card-title>
              <v-card-text>
                <div v-for="(line, lineIndex) in getDescription(pkg.description)" :key="lineIndex" class="d-flex align-center mb-2">
                  <v-icon class="custom-icon mr-2" color="primary">{{ line.icon }}</v-icon>
                  {{ line.title }}
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
                  
                  <v-text-field
                    v-model="editingPackage.name"
                    label="ชื่อแพ็กเกจ"
                    required
                  ></v-text-field>
                  <v-container>
                    <v-row v-for="(line, lineIndex) in editingPackage.description" :key="lineIndex">
                      <v-col cols="3">
                        <v-select
                          v-model="line.icon"
                          :items="iconOptions"
                          item-text="icon"
                          item-value="icon"
                          label="ไอคอน"
                          required
                        >
                          <template v-slot:selection="data">
                            <v-icon :class="data.item" color="primary">{{ data.item }}</v-icon>
                          </template>
                          <template v-slot:item="data">
                            <v-list-item-content>
                              <v-list-item-title>
                                <v-icon :class="data.item">{{ data.item }}</v-icon>
                              </v-list-item-title>
                            </v-list-item-content>
                          </template>
                        </v-select>
                      </v-col>
                      <v-col cols="9">
                        <v-text-field
                          v-model="line.title"
                          label="รายละเอียด"
                          required
                        ></v-text-field>
                      </v-col>
                      
                    </v-row>
                    <v-btn color="white" @click="addDescriptionLine">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-container>
                  <v-btn type="submit" color="success" class="mr-4 mt-4">อัปเดต</v-btn>
                  <v-btn @click="cancelEdit" color="secondary" class="mt-4">ยกเลิก</v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <transition name="alert" @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <v-alert
        v-if="alert.visible"
        :type="alert.type"
        dense
        border="left"
        dismissible
        elevation="2"
        outlined
        prominent
        class="alert-bottom-right alert-left-border"
      >
        {{ alert.text }}
      </v-alert>
    </transition>
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
      iconOptions: ['mdi-check-circle', 'mdi-check-circle-outline'],
      drawer: false,
      alert: {
        visible: false,
        text: '',
        type: '' // 'success' or 'error'
      },
      IP: "https://ef6d-171-7-48-85.ngrok-free.app"
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
        return JSON.parse(description);
      } catch (error) {
        console.error("Error parsing description:", error);
        return [{ title: "Description not available", icon: "mdi-alert" }];
      }
    },
    editPackage(pkg) {
      this.selectedPackage = pkg.name;
      this.openEditForm();
      this.loadPackage();
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
            const updatedPackage = {
              ...this.editingPackage,
              description: JSON.stringify(this.editingPackage.description)
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

              // Show success alert
              this.showAlert('อัปเดตแพ็กเกจสำเร็จ', 'success');

              await this.fetchPackages();
            } else {
              throw new Error('การอัปเดตล้มเหลว');
            }
          } else {
            throw new Error('ไม่พบแพ็กเกจที่เลือก');
          }
        } catch (error) {
          console.error('Error updating package:', error.message);
          this.showAlert('เกิดข้อผิดพลาดในการอัปเดตแพ็กเกจ', 'error');
        }
      }
    },
    async deletePackage(pkg) {
      const confirmed = confirm(`คุณต้องการลบแพ็กเกจ ${pkg.name} หรือไม่?`);
      if (confirmed) {
        try {
          const response = await axios.post(`${this.IP}/package/delete/${pkg.id}`);
          if (response.status === 200) {
            this.packages = this.packages.filter(p => p.id !== pkg.id);
            this.showAlert('ลบแพ็กเกจสำเร็จ', 'success');
          } else {
            throw new Error('การลบล้มเหลว');
          }
        } catch (error) {
          console.error('Error deleting package:', error.message);
          this.showAlert('เกิดข้อผิดพลาดในการลบแพ็กเกจ', 'error');
        }
      }
    },
    showAlert(text, type) {
      this.alert.text = text;
      this.alert.type = type;
      this.alert.visible = true;
      setTimeout(() => {
        this.alert.visible = false;
      }, 3000); // Hide alert after 3 seconds
    },
    addDescriptionLine() {
      this.editingPackage.description.push({ icon: 'mdi-check-circle', title: '' });
    },
    cancelEdit() {
      this.showEditForm = false;
      this.selectedPackage = null;
      this.editingPackage = {
        id: null,
        name: "",
        description: []
      };
    },
    navigateTo(route) {
      this.$router.push(route);
    },
    async signOut() {
      try {
        await axios.post(`${this.IP}/api/logout`);
        this.$router.push('/');
      } catch (error) {
        console.error('Error signing out:', error.message);
      }
    }
  }
};
</script>


<style scoped>
.alert-bottom-right {
  position: fixed;
  bottom: 16px; /* Adjust to your preference */
  right: 16px; /* Adjust to your preference */
  z-index: 2000; /* Ensure it appears above other components */
}

.alert-left-border {
  border-left: 4px solid; /* Adjust color and width as needed */
}

.fade-transition-enter-active,
.fade-transition-leave-active {
  transition: opacity 5s ease-in-out; /* Adjust transition duration here */
}

.fade-transition-enter, .fade-transition-leave-to /* .fade-transition-leave-active in <2.1.8 */ {
  opacity: 0;
}
.alert-enter-active,
.alert-leave-active {
  transition: opacity 1s ease;
}

.alert-enter, 
.alert-leave-to /* .alert-leave-active in <2.1.8 */ {
  opacity: 0;
}

.alert-left-border {
  border-left: 4px solid #1976D2; /* Customize border color as needed */
}
</style>