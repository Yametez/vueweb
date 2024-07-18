<template>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1>Select a Package</h1>
        </v-col>
        <v-col cols="12" md="4" v-for="(pkg, index) in packages" :key="index">
          <v-card @click="editPackage(pkg)">
            <v-card-title>{{ pkg.name }}</v-card-title>
            <v-card-subtitle>
              <v-icon>mdi-check-circle-outline</v-icon>
              {{ getDescription(pkg.description) }}
            </v-card-subtitle>
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
              v-model="editingPackage.description"
              label="รายละเอียดแพ็กเกจ"
              required
            ></v-textarea>
            <v-btn type="submit" color="success">อัปเดต</v-btn>
            <v-btn @click="cancelEdit" color="secondary">ยกเลิก</v-btn>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        packages: [
          {
            name: "Package 1",
            description: JSON.stringify([
              { title: "Feature 1", icon: "mdi-feature-1" },
              { title: "Feature 2", icon: "mdi-feature-2" }
            ])
          },
          {
            name: "Package 2",
            description: JSON.stringify([
              { title: "Feature A", icon: "mdi-feature-a" },
              { title: "Feature B", icon: "mdi-feature-b" }
            ])
          },
          {
            name: "Package 3",
            description: JSON.stringify([
              { title: "Feature X", icon: "mdi-feature-x" },
              { title: "Feature Y", icon: "mdi-feature-y" }
            ])
          }
        ],
        selectedPackage: null,
        showEditForm: false,
        editingPackage: {
          name: "",
          description: ""
        }
      };
    },
    methods: {
      openEditForm() {
        this.showEditForm = true;
      },
      loadPackage() {
        if (this.selectedPackage) {
          try {
            this.editingPackage = {
              ...this.selectedPackage,
              description: JSON.stringify(JSON.parse(this.selectedPackage.description), null, 2)
            };
          } catch (e) {
            console.error("Error parsing selected package description:", e);
            this.editingPackage.description = "";
          }
        }
      },
      updatePackage() {
        console.log("Selected Package:", this.selectedPackage);
        console.log("Editing Package:", this.editingPackage);
  
        if (this.selectedPackage) {
          const index = this.packages.findIndex(pkg => pkg.name === this.selectedPackage.name);
          if (index !== -1) {
            try {
              this.$set(this.packages, index, {
                ...this.editingPackage,
                description: JSON.stringify(JSON.parse(this.editingPackage.description))
              });
              this.showEditForm = false;
              this.selectedPackage = null;
              this.editingPackage = {
                name: "",
                description: ""
              };
            } catch (e) {
              console.error("Error updating package description:", e);
            }
          } else {
            console.error("Selected package not found");
          }
        } else {
          console.error("No package selected");
        }
      },
      cancelEdit() {
        this.showEditForm = false;
        this.selectedPackage = null;
        this.editingPackage = {
          name: "",
          description: ""
        };
      },
      getDescription(description) {
        try {
          const descObj = JSON.parse(description);
          return descObj.map(item => item.title).join(", ");
        } catch (e) {
          console.error("Error parsing description:", e);
          return "Description not available";
        }
      },
      editPackage(pkg) {
        this.selectedPackage = pkg;
        this.loadPackage();
        this.showEditForm = true;
      }
    }
  };
  </script>
  
  <style scoped>
  v-card {
    cursor: pointer;
    margin-bottom: 16px;
  }
  </style>
  