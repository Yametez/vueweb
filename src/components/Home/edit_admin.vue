<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Select a Package</h1>
      </v-col>
      <v-col cols="12" md="4" v-for="(pkg, index) in packages" :key="index">
        <v-card>
          <v-card-title>{{ pkg.name }}</v-card-title>
          <v-card-text>
            <div v-for="(line, lineIndex) in getDescription(pkg.description)" :key="lineIndex" class="d-flex align-center mb-2">
              <v-icon class="custom-icon mr-2">{{ getIcon(pkg.description)[lineIndex] }}</v-icon>
              {{ line }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn color="primary" @click="openEditForm">แก้ไขแพ็กเกจ</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="showEditForm">
      <v-col cols="12">
        <h2>แก้ไขแพ็กเกจ</h2>
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
          <v-btn type="submit" color="success" class="mr-4">อัปเดต</v-btn>
          <v-btn @click="cancelEdit" color="secondary">ยกเลิก</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
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
      IP: "https://3334-49-49-216-99.ngrok-free.app" // เปลี่ยนเป็น URL ngrok ของคุณ
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
        console.log("packages", response);
      } catch (error) {
        console.error("Error fetching packages:", error.message);
      }
    },
    getDescription(description) {
      try {
        const descObj = JSON.parse(description); // แปลง JSON เป็น Object
        return descObj.map(item => item.title); // นำข้อมูลมาแสดงเป็น array ของ titles
      } catch (error) {
        console.error("Error parsing description:", error);
        return ["Description not available"];
      }
    },
    getIcon(description) {
      try {
        const descObj = JSON.parse(description); // แปลง JSON เป็น Object
        return descObj.map(item => item.icon); // นำข้อมูล icon มาแสดงเป็น array ของ icons
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
          this.descriptionText = this.editingPackage.description.map(item => item.title).join('\n'); // แปลงเป็นข้อความธรรมดาสำหรับการแสดงผลใน textarea
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
            
            // ส่งข้อมูลไปยังเซิร์ฟเวอร์
            const response = await axios.post(`${this.IP}/package/edit/${updatedPackage.id}`, updatedPackage);
            
            if (response.status === 200) { // หรือสถานะที่เซิร์ฟเวอร์ส่งกลับเมื่ออัปเดตสำเร็จ
              // อัปเดต local state
              this.$set(this.packages, index, updatedPackage);
              
              // รีเซ็ตฟอร์มและปิด
              this.showEditForm = false;
              this.selectedPackage = null;
              this.editingPackage = {
                id: null,
                name: "",
                description: []
              };
              this.descriptionText = "";
              
              // แจ้งเตือนผู้ใช้
              alert('อัปเดตแพ็กเกจสำเร็จ');
              
              // รีโหลดข้อมูลแพ็กเกจทั้งหมดเพื่อให้แน่ใจว่าข้อมูลตรงกับ DB
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
    }
  }
};
</script>



<style scoped>
v-card {
  margin-bottom: 16px;
}
.custom-icon {
  color: #FFFFFF;
  background-color: #1976D2; /* สีฟ้าของ Vuetify primary color */
  border-radius: 50%;
  padding: 2px;
}
</style>
