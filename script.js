document.addEventListener("DOMContentLoaded", () => {
  // Fungsi pembantu untuk navigasi normal (tetap menyimpan histori)
  const navigateTo = (url) => {
    window.location.href = url;
  };
  
  // Fungsi untuk pengalihan (redirect) yang membersihkan histori browser
  const navigateAndClearHistory = (url) => {
    window.location.replace(url); 
  };
  
  const currentPage = window.location.pathname.split("/").pop();

  // 1. INISIALISASI DATA PENGGUNA (USERS)
  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.length === 0) {
    users.push({ username: "admin", password: "password", role: "admin" });
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Ambil data user yang sedang login
  const currentUserString = localStorage.getItem("currentUser");
  const currentUser = currentUserString ? JSON.parse(currentUserString) : null;

  // =========================================================
  // 0A. PERLINDUNGAN HALAMAN PUBLIK (Login/Register)
  // Tidak boleh diakses jika sudah login.
  // =========================================================
  const publicPages = ["index.html", "Register.html", ""]; 

  if (publicPages.includes(currentPage) && currentUser) {
      if (currentUser.role === 'admin') {
          navigateAndClearHistory("Admin.html");
      } else {
          navigateAndClearHistory("home.html");
      }
      return; 
  }

  // =========================================================
  // 0B. PERLINDUNGAN HALAMAN TERPROTEKSI (Membutuhkan Login)
  // =========================================================
  const protectedPages = ["home.html", "Admin.html", "RoomList.html", "Reservasi.html", "Jadwal.html", "CalenderView.html", "PopUp.html"];

  if (protectedPages.includes(currentPage)) {
      if (!currentUser) {
          alert("🔒 Akses ditolak. Anda harus login terlebih dahulu.");
          // PENTING: Gunakan fungsi yang menghapus histori
          navigateAndClearHistory("index.html"); 
          return; 
      }
      
      // Cek Role Admin
      if (currentPage === "Admin.html" && currentUser.role !== "admin") {
          alert("❌ Akses Admin ditolak. Anda dialihkan ke halaman utama.");
          navigateAndClearHistory("home.html");
          return;
      }
      
      initProfileFeatures(currentUser, navigateTo);
  }

  // =========================================================
  // 1. LOGIKA HALAMAN LOGIN (index.html)
  // =========================================================
  if (currentPage === "index.html" || currentPage === "") {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
      localStorage.removeItem("currentUser");

      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value;

        users = JSON.parse(localStorage.getItem("users")) || [];

        // Cek 1: Apakah username terdaftar?
        const userExists = users.find((u) => u.username === username);

        if (userExists) {
          // Cek 2: Apakah password cocok?
          if (userExists.password === password) {
            // Login Berhasil
            localStorage.setItem("currentUser", JSON.stringify(userExists));
            alert(`✅ Login berhasil! Selamat datang, ${userExists.username}.`);

            if (userExists.role === "admin") navigateTo("Admin.html");
            else navigateTo("home.html");
          } else {
            // Login Gagal: Password salah
            alert(
              "❌ Login Gagal: Password yang Anda masukkan salah. Periksa kembali."
            );
          }
        } else {
          // Login Gagal: Username tidak ditemukan
          alert("❌ Login Gagal: Username tidak terdaftar.");
        }
      });
    }
  }

  // =========================================================
  // 2. LOGIKA HALAMAN REGISTRASI (Register.html)
  // =========================================================
  else if (currentPage === "Register.html") {
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document
          .getElementById("register-username")
          .value.trim();
        const password = document.getElementById("register-password").value;
        const role = document.getElementById("register-role").value;

        if (!username || !password) {
          alert("⚠️ Username dan Password harus diisi.");
          return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.some((u) => u.username === username)) {
          alert(
            "❌ Registrasi Gagal: Username sudah terdaftar. Silakan gunakan username lain."
          );
          return;
        }

        users.push({ username, password, role });
        localStorage.setItem("users", JSON.stringify(users));

        alert(
          `🎉 Registrasi berhasil! Akun '${username}' berhasil dibuat. Silakan Login.`
        );
        navigateTo("index.html");
      });
    }
  }

  // =========================================================
  // 3. LOGIKA HALAMAN RESERVASI (Reservasi.html)
  // =========================================================
  else if (currentPage === "Reservasi.html") {
    const form = document.querySelector("form");
    if (form) {
      const submitButton = form.querySelector('button[type="button"]');
      if (submitButton) {
        submitButton.setAttribute("type", "submit");
        submitButton.removeAttribute("onclick");
      }

      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;
        const purpose = document.getElementById("purpose").value;

        if (!name || !date || !time || !purpose) {
          alert("⚠️ Semua kolom harus diisi!");
          return;
        }

        const reservation = {
          lab: "Computer Lab B205",
          date: date,
          time: time,
          purpose: purpose,
          name: name,
          status: "Pending",
        };

        const reservations =
          JSON.parse(localStorage.getItem("reservasiData")) || [];
        reservations.push(reservation);
        localStorage.setItem("reservasiData", JSON.stringify(reservations));

        alert("✅ Reservasi Berhasil Dibuat! Silakan periksa detailnya.");
        navigateTo("PopUp.html");
      });
    }
  }

  // =========================================================
  // 4. LOGIKA HALAMAN KONFIRMASI (PopUp.html)
  // =========================================================
  else if (currentPage === "PopUp.html") {
    const backToDashboardButton = document.querySelector(
      'button[onclick*="RoomList.html"]'
    );
    const viewScheduleButton = document.querySelector(
      'button[onclick*="Jadwal.html"]'
    );
    if (backToDashboardButton)
      backToDashboardButton.onclick = () => navigateTo("RoomList.html");
    if (viewScheduleButton)
      viewScheduleButton.onclick = () => navigateTo("Jadwal.html");

    const reservations = JSON.parse(localStorage.getItem("reservasiData"));
    if (reservations && reservations.length > 0) {
      const lastReservation = reservations[reservations.length - 1];

      document.querySelector(
        ".space-y-4 div:nth-child(1) p:last-child"
      ).textContent = lastReservation.lab || "N/A";
      document.querySelector(
        ".space-y-4 div:nth-child(2) p:last-child"
      ).textContent = lastReservation.date || "N/A";
      document.querySelector(
        ".space-y-4 div:nth-child(3) p:last-child"
      ).textContent = lastReservation.time || "N/A";
      const purposeElement = document.querySelector(
        ".space-y-4 div:nth-child(5) p:last-child"
      );
      if (purposeElement)
        purposeElement.textContent = lastReservation.purpose || "N/A";
    }
  }

  // =========================================================
  // 5. LOGIKA HALAMAN ADMIN (Admin.html)
  // =========================================================
  else if (currentPage === "Admin.html") {
    const reservationsTableBody = document.getElementById(
      "reservation-table-body"
    );
    const searchReservationsInput = document.getElementById("search-input");

    // Fungsi untuk merender (menampilkan) data reservasi
    const renderReservations = (reservationsToRender) => {
      reservationsTableBody.innerHTML = "";
      if (!reservationsToRender || reservationsToRender.length === 0) {
        reservationsTableBody.innerHTML =
          '<tr><td colspan="6" class="text-center py-4 text-gray-500 dark:text-gray-400">Tidak ada reservasi yang ditemukan.</td></tr>';
        return;
      }
      reservationsToRender.forEach((reservation, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${reservation.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${reservation.lab}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${reservation.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${reservation.time}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${reservation.purpose}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="deleteReservation(${index})" class="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400">Hapus</button>
                </td>
            `;
        reservationsTableBody.appendChild(row);
      });
    };

    // Fungsi global untuk menghapus reservasi (dipanggil dari tombol Hapus)
    window.deleteReservation = (index) => {
      if (confirm("⚠️ Apakah Anda yakin ingin menghapus reservasi ini?")) {
        let reservations =
          JSON.parse(localStorage.getItem("reservasiData")) || [];
        reservations.splice(index, 1);
        localStorage.setItem("reservasiData", JSON.stringify(reservations));

        fetchAndRenderReservations();
        alert("✅ Reservasi berhasil dihapus.");
      }
    };

    const fetchAndRenderReservations = () => {
      const reservations =
        JSON.parse(localStorage.getItem("reservasiData")) || [];
      renderReservations(reservations);
    };

    if (searchReservationsInput) {
      searchReservationsInput.addEventListener("keyup", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allReservations =
          JSON.parse(localStorage.getItem("reservasiData")) || [];
        const filteredReservations = allReservations.filter((res) => {
          return Object.values(res).some(
            (value) =>
              typeof value === "string" &&
              value.toLowerCase().includes(searchTerm)
          );
        });
        renderReservations(filteredReservations);
      });
    }

    fetchAndRenderReservations();
  }

  // =========================================================
  // 6. LOGIKA HALAMAN DAFTAR RUANGAN (RoomList.html)
  // =========================================================
  else if (currentPage === "RoomList.html") {
    const reserveButtons = document.querySelectorAll(
      "button[onclick=\"window.location.href='Reservasi.html'\"]"
    );
    reserveButtons.forEach((button) => {
      button.onclick = () => navigateTo("Reservasi.html");
    });
  }
});

// =========================================================
// FUNGSI UTAMA: LOGIKA PROFIL DAN UPLOAD FOTO
// =========================================================
function initProfileFeatures(currentUser, navigateTo) {
  // Elemen Profil di Header
  const profileImg = document.getElementById("profile-img");
  const profileInitials = document.getElementById("profile-initials");
  const profileButton = document.getElementById("profile-button");
  const profileMenu = document.getElementById("profile-menu");
  const dropdownUsernameElement = document.getElementById("dropdown-username");
  const dropdownRoleElement = document.getElementById("dropdown-role");
  const logoutBtn = document.getElementById("logout-btn");
  const changePhotoBtn = document.getElementById("change-photo-btn");

  // Elemen Modal
  const modal = document.getElementById("upload-modal");
  const photoInput = document.getElementById("photo-input");
  const selectPhotoBtn = document.getElementById("select-photo-btn");
  const savePhotoBtn = document.getElementById("save-photo-btn");
  const cancelUploadBtn = document.getElementById("cancel-upload-btn");
  const form = document.getElementById("photo-upload-form");

  let uploadedFile = null;

  // --- A. Memuat Foto Profil dari localStorage saat halaman dimuat ---
  const loadProfilePhoto = () => {
    // Gunakan kunci unik per user agar foto tidak tertukar
    const photoUrl = localStorage.getItem(
      "userProfilePhoto_" + currentUser.username
    );

    if (profileImg && profileInitials) {
      if (photoUrl) {
        profileImg.src = photoUrl;
        profileImg.classList.remove("hidden");
        profileInitials.classList.add("hidden");
      } else {
        profileImg.classList.add("hidden");
        profileInitials.classList.remove("hidden");
      }
    }
  };
  loadProfilePhoto();

  // --- B. Logika Dropdown Info dan Toggle ---
  if (profileButton && profileMenu) {
    const roleDisplay =
      currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

    if (dropdownUsernameElement)
      dropdownUsernameElement.textContent = currentUser.username;
    if (dropdownRoleElement) dropdownRoleElement.textContent = roleDisplay;
    if (profileInitials)
      profileInitials.textContent = currentUser.username
        .charAt(0)
        .toUpperCase();

    // FUNGSI TOGGLE DROPDOWN
    const toggleMenu = () => {
      const isHidden = profileMenu.classList.toggle("hidden");
      profileMenu.classList.toggle("scale-95", isHidden);
      profileMenu.classList.toggle("opacity-0", isHidden);
      profileMenu.classList.toggle("scale-100", !isHidden);
      profileMenu.classList.toggle("opacity-100", !isHidden);
    };
    profileButton.addEventListener("click", toggleMenu);

    // FUNGSI LOGOUT
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (confirm("Anda yakin ingin keluar (Logout)?")) {
          localStorage.removeItem("currentUser");
          navigateTo("index.html");
        }
      });
    }

    // Sembunyikan menu jika mengklik di luar
    document.addEventListener("click", (e) => {
      const container = document.getElementById("profile-dropdown-container");
      if (
        container &&
        !container.contains(e.target) &&
        !profileMenu.classList.contains("hidden")
      ) {
        profileMenu.classList.add("hidden", "scale-95", "opacity-0");
        profileMenu.classList.remove("scale-100", "opacity-100");
      }
    });
  }

  // --- C. Logika Modal Upload Foto ---
  if (modal) {
    // 1. Membuka Modal
    if (changePhotoBtn) {
      changePhotoBtn.addEventListener("click", () => {
        // Sembunyikan dropdown
        if (profileMenu)
          profileMenu.classList.add("hidden", "scale-95", "opacity-0");
        if (profileMenu)
          profileMenu.classList.remove("scale-100", "opacity-100");

        modal.classList.add("flex");
        modal.classList.remove("hidden");
      });
    }

    // 2. Tombol Batal
    if (cancelUploadBtn) {
      cancelUploadBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        if (photoInput) photoInput.value = "";
        uploadedFile = null;
        if (savePhotoBtn) savePhotoBtn.disabled = true;
        if (selectPhotoBtn)
          selectPhotoBtn.textContent = "Pilih File Gambar (.jpg, .png)";
      });
    }

    // 3. Tombol Pemicu Input File
    if (selectPhotoBtn) {
      selectPhotoBtn.addEventListener("click", () => {
        photoInput.click();
      });
    }

    // 4. Memilih File dan Memprosesnya
    if (photoInput) {
      photoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          uploadedFile = file;
          if (selectPhotoBtn)
            selectPhotoBtn.textContent = `File dipilih: ${file.name}`;
          if (savePhotoBtn) savePhotoBtn.disabled = false;
        } else {
          uploadedFile = null;
          if (savePhotoBtn) savePhotoBtn.disabled = true;
          if (selectPhotoBtn)
            selectPhotoBtn.textContent = "Pilih File Gambar (.jpg, .png)";
        }
      });
    }

    // 5. Submit Form: Konversi ke Base64 dan Simpan
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!uploadedFile) return;

        const reader = new FileReader();

        reader.onload = () => {
          const base64Image = reader.result;

          // Simpan ke localStorage dengan kunci unik per user
          localStorage.setItem(
            "userProfilePhoto_" + currentUser.username,
            base64Image
          );

          // Perbarui tampilan dan tutup modal
          loadProfilePhoto();
          alert("Foto Profil Berhasil Diunggah!");
          if (cancelUploadBtn) cancelUploadBtn.click();
        };

        reader.readAsDataURL(uploadedFile);
      });
    }
  }
}

