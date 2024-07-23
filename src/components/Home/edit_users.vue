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
        <v-list-item link>
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
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" color="white"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h5 font-weight-bold white--text">Admin Dashboard</v-toolbar-title>
    </v-app-bar>

    <v-main class="grey lighten-4">
      <v-container>
        

        <v-card class="mb-4">
          <v-card-title class="headline d-flex justify-space-between align-center">
            <span>User List</span>
            <v-btn color="primary" @click="openAddUserDialog">
              <v-icon left>mdi-plus</v-icon>
              เพิ่ม User/Admin
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="ค้นหาผู้ใช้"
              single-line
              hide-details
              outlined
              class="mb-4"
            ></v-text-field>

            <v-data-table
              :headers="headers"
              :items="users"
              :search="search"
              :items-per-page="10"
              class="elevation-1"
            >
              <template #[`item.userName`]="{ item }">
                <v-icon left small>mdi-account</v-icon>
                {{ item.userName }}
              </template>
              <template #[`item.email`]="{ item }">
                <v-icon left small>mdi-email</v-icon>
                {{ item.email }}
              </template>
              <template #[`item.phone`]="{ item }">
                <v-icon left small>mdi-phone</v-icon>
                {{ item.phone }}
              </template>
              <template #[`item.CREATE_DATE`]="{ item }">
                <v-icon left small>mdi-calendar</v-icon>
                {{ formatDate(item.CREATE_DATE) }}
              </template>
              <template #[`item.RECORD_STATUS`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.RECORD_STATUS)"
                  text-color="white"
                  small
                >
                  {{ item.RECORD_STATUS }}
                </v-chip>
              </template>
              <template #[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="editItem(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small @click="deleteItem(item)">
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- Add User Dialog -->
        <v-dialog v-model="dialog" max-width="600px">
  <v-card>
    <v-card-title class="headline"> {{ formTitle }} </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <!-- Name Field -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.userName"
              label="ชื่อผู้ใช้"
              outlined
              dense
              clearable
            ></v-text-field>
          </v-col>

          <!-- Email Field -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.email"
              label="อีเมล"
              outlined
              dense
              clearable
            ></v-text-field>
          </v-col>

          <!-- Phone Field -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.phone"
              label="โทรศัพท์"
              outlined
              dense
              clearable
            ></v-text-field>
          </v-col>

          <!-- First Name Field -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.firstName"
              label="ชื่อจริง"
              outlined
              dense
              clearable
            ></v-text-field>
          </v-col>

          <!-- Last Name Field -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.lastName"
              label="นามสกุล"
              outlined
              dense
              clearable
            ></v-text-field>
          </v-col>

          <!-- Role Field -->
          <v-col cols="12" sm="6">
            <v-select
              v-model="editedItem.role"
              :items="roles"
              label="บทบาท"
              item-text="text"
              item-value="value"
              outlined
              dense
            ></v-select>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" text @click="close">ยกเลิก</v-btn>
      <v-btn color="blue darken-1" text @click="save">บันทึก</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      drawer: false,
      search: '',
      dialog: false,
      headers: [
        { text: 'ชื่อผู้ใช้', align: 'start', value: 'userName' },
        { text: 'อีเมล', value: 'email' },
        { text: 'โทรศัพท์', value: 'phone' },
        { text: 'ชื่อจริง', value: 'firstName' },
        { text: 'นามสกุล', value: 'lastName' },
        { text: 'วันที่สร้าง', value: 'CREATE_DATE' },
        { text: 'สถานะ', value: 'RECORD_STATUS' },
        { text: '', value: 'actions', sortable: false }
      ],
      users: [],
      editedIndex: -1,
      editedItem: {
        userName: '',
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
      },
      defaultItem: {
        userName: '',
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
      },
      IP: "https://06a6-58-8-14-234.ngrok-free.app"
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Add User' : 'Edit User';
    },
    activeUsers() {
      return this.users.filter(user => user.RECORD_STATUS === 'active').length;
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get(`${this.IP}/labApi/get`);
        this.users = response.data;
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', options);
    },
    getStatusColor(status) {
      if (status === 'active') return 'green';
      if (status === 'inactive') return 'red';
      return 'grey';
    },
    editItem(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      const index = this.users.indexOf(item);
      confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?') && this.users.splice(index, 1);
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.users[this.editedIndex], this.editedItem);
      } else {
        this.users.push(this.editedItem);
      }
      this.close();
    },
    openAddUserDialog() {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.dialog = true;
    },
    navigateTo(route) {
      this.$router.push(route);
    }
  },
};
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-data-table >>> .v-data-table__wrapper > table > thead > tr > th {
  font-size: 14px;
  font-weight: bold;
  background-color: #2c3e50;
  color: white;
  text-transform: uppercase;
}

.v-data-table >>> .v-data-table__wrapper > table > tbody > tr:hover {
  background-color: #f0f8ff !important;
}

.v-card-title {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}
</style>